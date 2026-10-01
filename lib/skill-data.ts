import type { SupabaseClient } from "@supabase/supabase-js";
import { buildNodeViews, computeTiers, summarizeTree, MAX_NODES_PER_TREE, TreeValidationError, type NodeRow, type XpByNode } from "@/lib/skill-trees";
import type { Accent, SkillNodeOption, SkillTreeView } from "@/lib/types";

// Data access for skill trees and the XP ledger. Every function takes the
// Supabase client and the user id explicitly so the same code serves both
// the web app (RLS-scoped client) and the MCP endpoint (service-role client,
// where the explicit user_id filter is the only thing scoping the query).

type Db = SupabaseClient;

export interface XpTotals {
  total: number;
  byNode: Map<string, XpByNode>;
}

export async function getXpTotals(db: Db, userId: string): Promise<XpTotals> {
  const { data, error } = await db.rpc("xp_summary", { p_user_id: userId });
  if (error) throw error;
  const byNode = new Map<string, XpByNode>();
  let total = 0;
  for (const row of (data ?? []) as { skill_node_id: string | null; total: number; last_at: string | null }[]) {
    const xp = Number(row.total);
    total += xp;
    if (row.skill_node_id) byNode.set(row.skill_node_id, { xp, lastPracticedAt: row.last_at });
  }
  return { total, byNode };
}

interface TreeRow {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: Accent;
  source: "manual" | "mcp";
  created_at: string;
}

const NODE_COLUMNS = "id, tree_id, name, description, icon, xp_required, tier, position, maintenance_days";

export async function getSkillTrees(db: Db, userId: string, xp?: XpTotals, treeId?: string): Promise<SkillTreeView[]> {
  let treeQuery = db
    .from("skill_trees")
    .select("id, name, description, icon, color, source, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  let nodeQuery = db.from("skill_nodes").select(NODE_COLUMNS).eq("user_id", userId);
  if (treeId) {
    treeQuery = treeQuery.eq("id", treeId);
    nodeQuery = nodeQuery.eq("tree_id", treeId);
  }

  const [trees, nodes, edges, totals] = await Promise.all([
    treeQuery,
    nodeQuery.order("tier").order("position"),
    db.from("skill_node_prereqs").select("node_id, prereq_id").eq("user_id", userId),
    xp ?? getXpTotals(db, userId),
  ]);
  if (trees.error) throw trees.error;
  if (nodes.error) throw nodes.error;
  if (edges.error) throw edges.error;

  const views = buildNodeViews((nodes.data ?? []) as NodeRow[], edges.data ?? [], totals.byNode);
  return ((trees.data ?? []) as TreeRow[]).map((t) =>
    summarizeTree(
      { id: t.id, name: t.name, description: t.description, icon: t.icon, color: t.color, source: t.source, createdAt: t.created_at },
      views.filter((n) => n.treeId === t.id)
    )
  );
}

export async function getSkillTree(db: Db, userId: string, treeId: string, xp?: XpTotals): Promise<SkillTreeView | null> {
  const [tree] = await getSkillTrees(db, userId, xp, treeId);
  return tree ?? null;
}

export async function getSkillNodeOptions(db: Db, userId: string): Promise<SkillNodeOption[]> {
  const { data, error } = await db
    .from("skill_nodes")
    .select("id, name, skill_trees(name)")
    .eq("user_id", userId)
    .order("tier")
    .order("position");
  if (error) throw error;
  return ((data ?? []) as unknown as { id: string; name: string; skill_trees: { name: string } | null }[]).map((n) => ({
    id: n.id,
    name: n.name,
    treeName: n.skill_trees?.name ?? "",
  }));
}

// FK checks ignore RLS, so ownership of a referenced node must be verified
// explicitly before linking a quest or XP event to it.
export async function assertOwnsNode(db: Db, userId: string, nodeId: string): Promise<void> {
  const { data, error } = await db.from("skill_nodes").select("id").eq("id", nodeId).eq("user_id", userId).maybeSingle();
  if (error) throw error;
  if (!data) throw new TreeValidationError(`Skill node ${nodeId} not found.`);
}

export interface NodeInput {
  key: string;
  name: string;
  description?: string;
  icon?: string;
  xpRequired?: number;
  maintenanceDays?: number | null;
  prerequisites?: string[]; // keys of other new nodes, or ids of existing nodes in the tree
}

export interface TreeInput {
  name: string;
  description?: string;
  icon?: string;
  color?: Accent;
  source: "manual" | "mcp";
  nodes: NodeInput[];
}

async function insertNodes(db: Db, userId: string, treeId: string, nodes: NodeInput[], existing: { id: string; tier: number }[]) {
  const existingTiers = new Map(existing.map((n) => [n.id, n.tier]));
  const tiers = computeTiers(
    nodes.map((n) => ({ key: n.key, prerequisites: n.prerequisites ?? [] })),
    existingTiers
  );

  // Positions continue after existing nodes in the same tier.
  const nextPosition = new Map<number, number>();
  for (const n of existing) nextPosition.set(n.tier, (nextPosition.get(n.tier) ?? 0) + 1);

  // Ids are generated here (not by Postgres) so prerequisite edges can be
  // built without relying on RETURNING order.
  const idByKey = new Map(nodes.map((n) => [n.key, crypto.randomUUID()]));
  const rows = nodes.map((n) => {
    const tier = tiers.get(n.key)!;
    const position = nextPosition.get(tier) ?? 0;
    nextPosition.set(tier, position + 1);
    return {
      id: idByKey.get(n.key)!,
      user_id: userId,
      tree_id: treeId,
      name: n.name,
      description: n.description ?? "",
      icon: n.icon ?? "Circle",
      xp_required: n.xpRequired ?? 100,
      maintenance_days: n.maintenanceDays ?? null,
      tier,
      position,
    };
  });

  const { error } = await db.from("skill_nodes").insert(rows);
  if (error) throw error;

  const edges = nodes.flatMap((n) =>
    (n.prerequisites ?? []).map((p) => ({
      user_id: userId,
      node_id: idByKey.get(n.key)!,
      prereq_id: idByKey.get(p) ?? p,
    }))
  );
  if (edges.length > 0) {
    const { error: edgeError } = await db.from("skill_node_prereqs").insert(edges);
    if (edgeError) throw edgeError;
  }
  return idByKey;
}

export async function createSkillTree(db: Db, userId: string, input: TreeInput): Promise<string> {
  if (input.nodes.length === 0) throw new TreeValidationError("A tree needs at least one node.");
  if (input.nodes.length > MAX_NODES_PER_TREE) throw new TreeValidationError(`A tree can have at most ${MAX_NODES_PER_TREE} nodes.`);
  // Validate before writing anything.
  computeTiers(input.nodes.map((n) => ({ key: n.key, prerequisites: n.prerequisites ?? [] })));

  const { data, error } = await db
    .from("skill_trees")
    .insert({
      user_id: userId,
      name: input.name,
      description: input.description ?? "",
      icon: input.icon ?? "TreeDeciduous",
      color: input.color ?? "green",
      source: input.source,
    })
    .select("id")
    .single();
  if (error) throw error;

  try {
    await insertNodes(db, userId, data.id, input.nodes, []);
  } catch (e) {
    // No multi-statement transactions over PostgREST: undo the partial tree.
    await db.from("skill_trees").delete().eq("id", data.id).eq("user_id", userId);
    throw e;
  }
  return data.id;
}

export async function addSkillNodes(db: Db, userId: string, treeId: string, nodes: NodeInput[]): Promise<Map<string, string>> {
  const { data: existing, error } = await db.from("skill_nodes").select("id, tier").eq("tree_id", treeId).eq("user_id", userId);
  if (error) throw error;
  const { data: tree, error: treeError } = await db.from("skill_trees").select("id").eq("id", treeId).eq("user_id", userId).maybeSingle();
  if (treeError) throw treeError;
  if (!tree) throw new TreeValidationError(`Skill tree ${treeId} not found.`);
  if ((existing?.length ?? 0) + nodes.length > MAX_NODES_PER_TREE) {
    throw new TreeValidationError(`A tree can have at most ${MAX_NODES_PER_TREE} nodes.`);
  }

  return insertNodes(db, userId, treeId, nodes, existing ?? []);
}

export async function updateSkillNode(
  db: Db,
  userId: string,
  nodeId: string,
  patch: { name?: string; description?: string; icon?: string; xpRequired?: number; maintenanceDays?: number | null }
): Promise<void> {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.description !== undefined) row.description = patch.description;
  if (patch.icon !== undefined) row.icon = patch.icon;
  if (patch.xpRequired !== undefined) row.xp_required = patch.xpRequired;
  if (patch.maintenanceDays !== undefined) row.maintenance_days = patch.maintenanceDays;
  if (Object.keys(row).length === 0) return;
  const { data, error } = await db.from("skill_nodes").update(row).eq("id", nodeId).eq("user_id", userId).select("id");
  if (error) throw error;
  if (!data?.length) throw new TreeValidationError(`Skill node ${nodeId} not found.`);
}

export async function deleteSkillTree(db: Db, userId: string, treeId: string): Promise<void> {
  const { error } = await db.from("skill_trees").delete().eq("id", treeId).eq("user_id", userId);
  if (error) throw error;
}

export async function awardXp(
  db: Db,
  userId: string,
  event: { amount: number; source: "quest" | "mcp" | "manual" | "login" | "boss" | "achievement"; skillNodeId?: string | null; questId?: string; note?: string }
): Promise<void> {
  if (event.skillNodeId) await assertOwnsNode(db, userId, event.skillNodeId);
  const row = {
    user_id: userId,
    amount: event.amount,
    source: event.source,
    skill_node_id: event.skillNodeId ?? null,
    quest_id: event.questId ?? null,
    note: event.note ?? null,
  };
  // quest_id is unique: re-completing an already-awarded quest is a no-op.
  const { error } = event.questId
    ? await db.from("xp_events").upsert(row, { onConflict: "quest_id", ignoreDuplicates: true })
    : await db.from("xp_events").insert(row);
  if (error) throw error;
}

export async function revokeQuestXp(db: Db, userId: string, questId: string): Promise<void> {
  const { error } = await db.from("xp_events").delete().eq("quest_id", questId).eq("user_id", userId);
  if (error) throw error;
}
