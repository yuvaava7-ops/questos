import type { SkillNodeState, SkillNodeView, SkillTreeView } from "@/lib/types";

// Pure skill-tree logic shared by the web app and the MCP server: validating
// a proposed tree, deriving tiers from prerequisites, and computing each
// node's state from the XP ledger. No database access here.

export const MAX_NODES_PER_TREE = 80;
export const MAX_PREREQS_PER_NODE = 6;

export interface NodeDraft {
  key: string;
  prerequisites: string[];
}

export class TreeValidationError extends Error {}

// Checks keys are unique, prerequisites exist, and there are no cycles, then
// returns each key's tier: 0 for roots, otherwise 1 + deepest prerequisite.
// `existingTiers` lets new nodes depend on nodes already in the tree.
export function computeTiers(nodes: NodeDraft[], existingTiers: Map<string, number> = new Map()): Map<string, number> {
  const byKey = new Map<string, NodeDraft>();
  for (const node of nodes) {
    if (byKey.has(node.key) || existingTiers.has(node.key)) {
      throw new TreeValidationError(`Duplicate node key "${node.key}".`);
    }
    byKey.set(node.key, node);
  }
  for (const node of nodes) {
    if (node.prerequisites.length > MAX_PREREQS_PER_NODE) {
      throw new TreeValidationError(`Node "${node.key}" has more than ${MAX_PREREQS_PER_NODE} prerequisites.`);
    }
    for (const prereq of node.prerequisites) {
      if (prereq === node.key) throw new TreeValidationError(`Node "${node.key}" cannot require itself.`);
      if (!byKey.has(prereq) && !existingTiers.has(prereq)) {
        throw new TreeValidationError(`Node "${node.key}" requires unknown node "${prereq}".`);
      }
    }
  }

  const tiers = new Map<string, number>();
  const visiting = new Set<string>();
  function tierOf(key: string): number {
    const existing = existingTiers.get(key);
    if (existing !== undefined) return existing;
    const known = tiers.get(key);
    if (known !== undefined) return known;
    if (visiting.has(key)) throw new TreeValidationError(`Prerequisite cycle involving "${key}".`);
    visiting.add(key);
    const prereqs = byKey.get(key)!.prerequisites;
    const tier = prereqs.length === 0 ? 0 : 1 + Math.max(...prereqs.map(tierOf));
    visiting.delete(key);
    tiers.set(key, tier);
    return tier;
  }
  for (const node of nodes) tierOf(node.key);
  return tiers;
}

export interface NodeRow {
  id: string;
  tree_id: string;
  name: string;
  description: string;
  icon: string;
  xp_required: number;
  tier: number;
  position: number;
  maintenance_days: number | null;
}

export interface XpByNode {
  xp: number;
  lastPracticedAt: string | null;
}

const DAY_MS = 86_400_000;

// complete: earned XP >= required. locked: some prerequisite incomplete
// (XP still accrues, practice is never wasted). rusty: has progress, has a
// maintenance interval, and hasn't been practiced within it.
export function buildNodeViews(
  nodes: NodeRow[],
  prereqEdges: { node_id: string; prereq_id: string }[],
  xpByNode: Map<string, XpByNode>,
  now: number = Date.now()
): SkillNodeView[] {
  const prereqsOf = new Map<string, string[]>();
  for (const edge of prereqEdges) {
    const list = prereqsOf.get(edge.node_id) ?? [];
    list.push(edge.prereq_id);
    prereqsOf.set(edge.node_id, list);
  }
  const isComplete = (id: string, required: number) => (xpByNode.get(id)?.xp ?? 0) >= required;
  const requiredById = new Map(nodes.map((n) => [n.id, n.xp_required]));

  return nodes.map((n) => {
    const { xp = 0, lastPracticedAt = null } = xpByNode.get(n.id) ?? {};
    const prerequisites = prereqsOf.get(n.id) ?? [];
    const prereqsDone = prerequisites.every((p) => isComplete(p, requiredById.get(p) ?? Infinity));
    const complete = xp >= n.xp_required;

    let state: SkillNodeState = complete ? "complete" : prereqsDone ? "available" : "locked";
    const rusty =
      xp > 0 &&
      n.maintenance_days !== null &&
      (lastPracticedAt === null || now - new Date(lastPracticedAt).getTime() > n.maintenance_days * DAY_MS);
    if (rusty) state = "rusty";

    return {
      id: n.id,
      treeId: n.tree_id,
      name: n.name,
      description: n.description,
      icon: n.icon,
      xp: Math.min(xp, n.xp_required),
      xpRequired: n.xp_required,
      tier: n.tier,
      position: n.position,
      maintenanceDays: n.maintenance_days,
      lastPracticedAt,
      prerequisites,
      complete,
      state,
    };
  });
}

export function summarizeTree(tree: Omit<SkillTreeView, "nodes" | "completeCount" | "rustyCount" | "percent">, nodes: SkillNodeView[]): SkillTreeView {
  const completeCount = nodes.filter((n) => n.complete).length;
  const rustyCount = nodes.filter((n) => n.state === "rusty").length;
  const totalRequired = nodes.reduce((s, n) => s + n.xpRequired, 0);
  const earned = nodes.reduce((s, n) => s + n.xp, 0);
  return {
    ...tree,
    nodes,
    completeCount,
    rustyCount,
    percent: totalRequired > 0 ? Math.round((earned / totalRequired) * 100) : 0,
  };
}
