import "server-only";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { computeActivity } from "@/lib/activity";
import { todayISO } from "@/lib/dates";
import { levelFromTotalXp } from "@/lib/leveling";
import {
  addSkillNodes,
  assertOwnsNode,
  awardXp,
  createSkillTree,
  deleteSkillTree,
  getSkillTree,
  getSkillTrees,
  getXpTotals,
  updateSkillNode,
} from "@/lib/skill-data";
import { MAX_NODES_PER_TREE, TreeValidationError } from "@/lib/skill-trees";
import { STAT_KEYS, STATS, classFor, emptyStatXp, isStatKey, statLevel } from "@/lib/stats";
import { AVATAR_SIZE, AvatarError, MAX_AVATAR_COLORS, parseAvatar, validateAvatar } from "@/lib/avatar";
import { HERO_A, HERO_B, HERO_PALETTE } from "@/components/pixel/sprites";
import { ensureDailies, getHabits } from "@/lib/game-data";
import { BOSS_PRESETS, weekStartOf } from "@/lib/boss";
import type { SkillNodeView, SkillTreeView } from "@/lib/types";

const INSTRUCTIONS = `QuestOS is the user's gamified productivity tracker. Daily quests earn XP; XP levels the user up and progresses nodes on skill trees.

The player also has a character: a hero class derived from the stats their quests train (get_character), and an avatar you can draw for them with set_avatar. Offer to draw one; base it on their class. Repeating habits are dailies (add_habit), one-offs are quests (add_quests), and the week's big goal is a boss (set_boss). Completing quests on a streak earns bonus XP, so scheduling a realistic daily rhythm matters more than piling on quests.

How it works:
- A skill tree is a graph of nodes. Each node has xp_required; it is complete once that much XP has been logged to it. A node is locked until all its prerequisites are complete (XP still accrues while locked).
- Quests linked to a node (skill_node_id) award their XP to that node when completed. log_activity records XP for work done outside a quest.
- Nodes with maintenance_days become "rusty" when not practiced for that many days. Rusty nodes keep their XP; they just need a refresher.

Designing trees (create_skill_tree):
- Start with get_overview to see existing trees and avoid duplicates.
- 8-30 nodes is a good size. Root nodes (no prerequisites) are fundamentals; each later tier builds on earlier ones. Keep chains to at most ~6 tiers.
- Nodes should be concrete, checkable capabilities ("Write a recursive function", "Hold a 5-minute plank"), not vague topics.
- Calibrate xp_required to effort: roughly 10 XP per focused 15-30 minute session. Fundamentals 50-150, intermediate 150-400, advanced 400-1000.
- Set maintenance_days for perishable skills (languages, instruments, fitness: 7-21) and leave it null for one-time knowledge.
- icon: optional free-text label. The app draws its own pixel gem per tree, so a short word is enough. Pick the accent with color.
- color: green, blue, purple, or orange.

Planning days (add_quests): prefer quests linked to available or rusty nodes, sized to real sessions (10-30 XP each).`;

const accent = z.enum(["green", "blue", "purple", "orange"]);

const nodeInput = z.object({
  key: z.string().min(1).max(60).describe("Unique key for this node within the request, e.g. 'loops'. Used by other nodes' prerequisites."),
  name: z.string().min(1).max(80),
  description: z.string().max(500).optional(),
  icon: z.string().max(60).optional(),
  xp_required: z.number().int().min(10).max(5000).optional().describe("XP to complete. Default 100."),
  maintenance_days: z.number().int().min(1).max(365).nullable().optional(),
  prerequisites: z
    .array(z.string())
    .max(6)
    .optional()
    .describe("Keys of other nodes in this request, or ids of existing nodes in the same tree."),
});

type NodeInputZ = z.infer<typeof nodeInput>;

function toNodeInput(n: NodeInputZ) {
  return {
    key: n.key,
    name: n.name,
    description: n.description,
    icon: n.icon,
    xpRequired: n.xp_required,
    maintenanceDays: n.maintenance_days,
    prerequisites: n.prerequisites,
  };
}

function json(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] };
}

function fail(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true };
}

// Validation problems go back to the model so it can fix its request;
// anything else is logged and reported generically.
async function run<T>(fn: () => Promise<T>) {
  try {
    return json(await fn());
  } catch (e) {
    if (e instanceof TreeValidationError || e instanceof AvatarError) return fail(e.message);
    console.error("[mcp] tool failed", e);
    return fail("QuestOS hit an internal error running this tool.");
  }
}

function nodeSummary(n: SkillNodeView) {
  return {
    id: n.id,
    name: n.name,
    state: n.state,
    xp: n.xp,
    xp_required: n.xpRequired,
    tier: n.tier,
    maintenance_days: n.maintenanceDays,
    last_practiced_at: n.lastPracticedAt,
    prerequisites: n.prerequisites,
    description: n.description,
    icon: n.icon,
  };
}

function treeSummary(t: SkillTreeView) {
  return {
    id: t.id,
    name: t.name,
    description: t.description,
    percent: t.percent,
    nodes_complete: t.completeCount,
    nodes_total: t.nodes.length,
    rusty: t.rustyCount,
  };
}

export function createQuestOsMcpServer(db: SupabaseClient, userId: string): McpServer {
  const server = new McpServer({ name: "questos", version: "0.2.0" }, { instructions: INSTRUCTIONS });

  server.registerTool(
    "get_overview",
    {
      description:
        "The user's current state: level, XP, streak, today's quests, skill tree summaries, rusty nodes needing maintenance, and nodes available to work on next. Call this first.",
      inputSchema: {},
    },
    () =>
      run(async () => {
        const xp = await getXpTotals(db, userId);
        const [trees, activity, quests] = await Promise.all([
          getSkillTrees(db, userId, xp),
          computeActivity(db, userId),
          db
            .from("quests")
            .select("id, label, xp, done, time, skill_node_id")
            .eq("user_id", userId)
            .eq("quest_date", todayISO())
            .order("time"),
        ]);
        if (quests.error) throw quests.error;
        const nodes = trees.flatMap((t) => t.nodes.map((n) => ({ tree: t.name, ...nodeSummary(n) })));
        return {
          today: todayISO(),
          ...levelFromTotalXp(xp.total),
          streak_days: activity.streakDays,
          todays_quests: quests.data,
          skill_trees: trees.map(treeSummary),
          rusty_nodes: nodes.filter((n) => n.state === "rusty"),
          available_nodes: nodes.filter((n) => n.state === "available").slice(0, 25),
        };
      })
  );

  async function loadCharacter() {
    const [xp, statRows, profile] = await Promise.all([
      getXpTotals(db, userId),
      db.rpc("stat_xp", { p_user_id: userId }),
      db.from("profile").select("*").eq("user_id", userId).maybeSingle(),
    ]);
    if (profile.error) throw profile.error;
    // stat_xp is absent until migration 002 is applied: treat as no stats yet.
    const statXp = emptyStatXp();
    for (const row of (statRows.data ?? []) as { stat: string; xp: number }[]) {
      if (isStatKey(row.stat)) statXp[row.stat] = Number(row.xp);
    }
    const heroClass = classFor(statXp);
    return {
      name: profile.data?.name ?? null,
      level: levelFromTotalXp(xp.total),
      class: { name: heroClass.name, description: heroClass.blurb, primary_stat: heroClass.primary },
      stats: Object.fromEntries(
        STAT_KEYS.map((k) => [k, { name: STATS[k].name, xp: statXp[k], level: statLevel(statXp[k]).value }])
      ),
      avatar: parseAvatar(profile.data?.avatar),
    };
  }

  server.registerTool(
    "get_character",
    {
      description:
        "The player's character sheet: name, level, hero class (derived from which stats their completed quests train), per-stat levels, and their current avatar if one is set. Call this before drawing an avatar so it matches their class and strengths.",
      inputSchema: {},
    },
    () =>
      run(async () => {
        const c = await loadCharacter();
        return {
          ...c,
          default_avatar_reference: {
            note: `The app's default hero, as a ${AVATAR_SIZE}x${AVATAR_SIZE} example of the exact format set_avatar expects. Facing right, 1px dark outline, flat colours.`,
            art: HERO_A.art,
            walk_art: HERO_B.art,
            palette: HERO_PALETTE,
          },
        };
      })
  );

  server.registerTool(
    "set_avatar",
    {
      description: `Draw the player's pixel-art avatar. It replaces the default hero in the app (profile card, character sheet, journey scene), so make it look like THEM: call get_character first and reflect their class and top stats (str: armour and sword; int: robe, hat, staff or book; dex: hood, daggers or tools; wis: headband, calm stance, prayer beads; cha: feathered hat, lute or flashy cape; mixed classes blend two). Style: 16-bit SNES RPG sprite, ${AVATAR_SIZE}x${AVATAR_SIZE} pixels, facing right, 1px dark outline (#0b0820), flat colours with at most one highlight and one shadow tone per material, no anti-aliasing, centred horizontally with feet on the bottom row. Format: art is exactly ${AVATAR_SIZE} strings of exactly ${AVATAR_SIZE} characters; "." is transparent; every other character is a single letter or digit defined in palette as #rrggbb (max ${MAX_AVATAR_COLORS} colours). Optionally pass walk_art, a second frame (same palette) with only the legs and arms changed, so the avatar walks in the journey scene; without it the avatar bobs instead. Replaces any previous avatar.`,
      inputSchema: {
        art: z.array(z.string()).length(AVATAR_SIZE).describe(`${AVATAR_SIZE} rows of ${AVATAR_SIZE} characters each.`),
        walk_art: z.array(z.string()).length(AVATAR_SIZE).optional().describe("Optional second walking frame, same size and palette."),
        palette: z.record(z.string().length(1), z.string()).describe('Map of one character to a #rrggbb colour, e.g. {"k":"#0b0820","s":"#ffcf9f"}.'),
      },
    },
    ({ art, walk_art, palette }) =>
      run(async () => {
        const avatar = validateAvatar({ art, walk: walk_art, palette });
        const updated = await db.from("profile").update({ avatar }).eq("user_id", userId).select("user_id");
        if (updated.error) {
          if (/avatar/i.test(updated.error.message)) {
            throw new AvatarError("Avatars are not enabled on this QuestOS yet: the database migration 003_profile_avatar.sql has not been applied.");
          }
          throw updated.error;
        }
        if ((updated.data ?? []).length === 0) {
          const inserted = await db.from("profile").insert({ user_id: userId, avatar });
          if (inserted.error) throw inserted.error;
        }
        return { saved: true, frames: avatar.walk ? 2 : 1, colors: Object.keys(avatar.palette).length, preview: avatar.art.join("\n") };
      })
  );

  server.registerTool(
    "list_habits",
    {
      description: "The player's dailies (recurring habits) with their schedule and current streak. Check this before adding one to avoid duplicates.",
      inputSchema: {},
    },
    () =>
      run(async () =>
        (await getHabits(db, userId)).map((h) => ({
          id: h.id,
          label: h.label,
          xp: h.xp,
          stat: h.stat,
          weekdays: h.weekdays,
          time: h.time || null,
          active: h.active,
          streak: h.streak,
        }))
      )
  );

  server.registerTool(
    "add_habit",
    {
      description:
        "Add a daily (recurring habit). It appears as a quest in the player's log on every scheduled day, builds a streak, and trains a stat. Use for things they do repeatedly (a nightly workout, daily study), not one-offs (use add_quests).",
      inputSchema: {
        label: z.string().min(1).max(120),
        xp: z.number().int().min(1).max(1000).default(10),
        stat: z.enum(STAT_KEYS).optional(),
        weekdays: z.array(z.number().int().min(0).max(6)).min(1).max(7).default([0, 1, 2, 3, 4, 5, 6]).describe("0 = Sunday ... 6 = Saturday."),
        time: z.string().max(20).optional(),
      },
    },
    ({ label, xp, stat, weekdays, time }) =>
      run(async () => {
        const days = [...new Set(weekdays)].sort();
        const { data, error } = await db
          .from("habits")
          .insert({ user_id: userId, label, xp, stat: stat ?? null, weekdays: days, time: time ?? null })
          .select("id, label, xp, weekdays")
          .single();
        if (error) throw error;
        await ensureDailies(db, userId);
        return { added: data };
      })
  );

  server.registerTool(
    "set_boss",
    {
      description:
        "Summon this week's boss: a weekly goal. All XP the player earns during the week damages it; defeating it before Sunday earns a bonus. One boss per week. Name it after their real goal for the week (e.g. 'IELTS mock exam').",
      inputSchema: {
        name: z.string().min(1).max(60),
        difficulty: z.enum(["light", "normal", "hard", "legendary"]).default("normal").describe("Light 200 HP, normal 400, hard 800, legendary 1500."),
      },
    },
    ({ name, difficulty }) =>
      run(async () => {
        const preset = BOSS_PRESETS.find((p) => p.label.toLowerCase() === difficulty) ?? BOSS_PRESETS[1];
        const { error } = await db
          .from("bosses")
          .insert({ user_id: userId, week_start: weekStartOf(), name, hp: preset.hp, reward_xp: preset.reward });
        if (error) {
          if (error.code === "23505") throw new AvatarError("A boss is already summoned for this week.");
          throw error;
        }
        return { summoned: name, hp: preset.hp, reward_xp: preset.reward };
      })
  );

  server.registerTool(
    "reset_avatar",
    { description: "Remove the custom avatar and go back to the default class-coloured hero.", inputSchema: {} },
    () =>
      run(async () => {
        const { error } = await db.from("profile").update({ avatar: null }).eq("user_id", userId);
        if (error) throw error;
        return { reset: true };
      })
  );

  server.registerTool(
    "list_skill_trees",
    { description: "Summaries of all the user's skill trees (ids, progress, rusty counts).", inputSchema: {} },
    () => run(async () => (await getSkillTrees(db, userId)).map(treeSummary))
  );

  server.registerTool(
    "get_skill_tree",
    {
      description: "Full detail of one skill tree: every node with state (locked/available/complete/rusty), XP, and prerequisites.",
      inputSchema: { tree_id: z.string().uuid() },
    },
    ({ tree_id }) =>
      run(async () => {
        const tree = await getSkillTree(db, userId, tree_id);
        if (!tree) throw new TreeValidationError(`Skill tree ${tree_id} not found.`);
        return { ...treeSummary(tree), color: tree.color, icon: tree.icon, nodes: tree.nodes.map(nodeSummary) };
      })
  );

  server.registerTool(
    "create_skill_tree",
    {
      description: `Create a new skill tree from a list of nodes with prerequisites (max ${MAX_NODES_PER_TREE} nodes). Tiers are derived automatically. Returns the created tree.`,
      inputSchema: {
        name: z.string().min(1).max(80),
        description: z.string().max(500).optional(),
        icon: z.string().max(60).optional(),
        color: accent.optional(),
        nodes: z.array(nodeInput).min(1).max(MAX_NODES_PER_TREE),
      },
    },
    ({ name, description, icon, color, nodes }) =>
      run(async () => {
        const id = await createSkillTree(db, userId, {
          name,
          description,
          icon,
          color,
          source: "mcp",
          nodes: nodes.map(toNodeInput),
        });
        const tree = await getSkillTree(db, userId, id);
        return { ...treeSummary(tree!), nodes: tree!.nodes.map((n) => ({ id: n.id, name: n.name, tier: n.tier })) };
      })
  );

  server.registerTool(
    "add_skill_nodes",
    {
      description: "Add nodes to an existing tree. Prerequisites may reference new keys in this request or ids of existing nodes in the tree.",
      inputSchema: { tree_id: z.string().uuid(), nodes: z.array(nodeInput).min(1).max(MAX_NODES_PER_TREE) },
    },
    ({ tree_id, nodes }) =>
      run(async () => {
        const ids = await addSkillNodes(db, userId, tree_id, nodes.map(toNodeInput));
        return { added: Object.fromEntries(ids) };
      })
  );

  server.registerTool(
    "update_skill_node",
    {
      description: "Edit a node's name, description, icon, xp_required, or maintenance_days (null removes maintenance).",
      inputSchema: {
        node_id: z.string().uuid(),
        name: z.string().min(1).max(80).optional(),
        description: z.string().max(500).optional(),
        icon: z.string().max(60).optional(),
        xp_required: z.number().int().min(10).max(5000).optional(),
        maintenance_days: z.number().int().min(1).max(365).nullable().optional(),
      },
    },
    ({ node_id, name, description, icon, xp_required, maintenance_days }) =>
      run(async () => {
        await updateSkillNode(db, userId, node_id, {
          name,
          description,
          icon,
          xpRequired: xp_required,
          maintenanceDays: maintenance_days,
        });
        return { updated: node_id };
      })
  );

  server.registerTool(
    "delete_skill_tree",
    {
      description: "Permanently delete a skill tree and its nodes. XP already earned stays in the user's total. Confirm with the user first.",
      inputSchema: { tree_id: z.string().uuid() },
    },
    ({ tree_id }) =>
      run(async () => {
        await deleteSkillTree(db, userId, tree_id);
        return { deleted: tree_id };
      })
  );

  server.registerTool(
    "add_quests",
    {
      description: "Add quests to the user's quest list for today (or a given date). Link each to a skill node when it trains one.",
      inputSchema: {
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("YYYY-MM-DD, default today (UTC)."),
        quests: z
          .array(
            z.object({
              label: z.string().min(1).max(200),
              xp: z.number().int().min(1).max(1000).default(10),
              time: z.string().max(20).optional(),
              skill_node_id: z.string().uuid().optional(),
              stat: z
                .enum(STAT_KEYS)
                .optional()
                .describe("Character stat this trains: str (body), int (mind), dex (craft), wis (calm/habits), cha (social). Drives the hero class."),
            })
          )
          .min(1)
          .max(20),
      },
    },
    ({ date, quests }) =>
      run(async () => {
        for (const q of quests) if (q.skill_node_id) await assertOwnsNode(db, userId, q.skill_node_id);
        const { data, error } = await db
          .from("quests")
          .insert(
            quests.map((q) => ({
              user_id: userId,
              label: q.label,
              xp: q.xp,
              time: q.time ?? null,
              skill_node_id: q.skill_node_id ?? null,
              ...(q.stat ? { stat: q.stat } : {}),
              quest_date: date ?? todayISO(),
            }))
          )
          .select("id, label, xp");
        if (error) throw error;
        return { added: data };
      })
  );

  server.registerTool(
    "log_activity",
    {
      description:
        "Record XP for something the user did that wasn't a quest (e.g. 'practiced guitar 30 min'). Only log what the user says they actually did.",
      inputSchema: {
        amount: z.number().int().min(1).max(500),
        note: z.string().min(1).max(300),
        skill_node_id: z.string().uuid().optional(),
      },
    },
    ({ amount, note, skill_node_id }) =>
      run(async () => {
        await awardXp(db, userId, { amount, note, skillNodeId: skill_node_id, source: "mcp" });
        const xp = await getXpTotals(db, userId);
        return { logged: amount, ...levelFromTotalXp(xp.total) };
      })
  );

  server.registerTool(
    "get_xp_history",
    {
      description: "Recent XP events (newest first) to see what the user has been working on.",
      inputSchema: { days: z.number().int().min(1).max(90).default(14) },
    },
    ({ days }) =>
      run(async () => {
        const since = new Date(Date.now() - days * 86_400_000).toISOString();
        const { data, error } = await db
          .from("xp_events")
          .select("amount, source, note, created_at, skill_node_id, quests(label), skill_nodes(name)")
          .eq("user_id", userId)
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(200);
        if (error) throw error;
        return data;
      })
  );

  return server;
}
