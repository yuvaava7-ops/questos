import * as Lucide from "lucide-react";
import type { LucideIcon, LucideProps } from "lucide-react";
import { GAME_ICONS } from "@/icons/game";

// Namespace lookup (not lucide's `icons` map) so alias names like "Code2"
// resolve too. Server-only usage, so this doesn't reach the client bundle.
const LUCIDE = Lucide as unknown as Record<string, LucideIcon | undefined>;

// Resolves an icon name stored in the database: game-icons.net keys
// (kebab-case, see icons/game/index.tsx) first, then lucide PascalCase names.
export function DynamicIcon({ name, ...props }: { name: string } & LucideProps) {
  const Game = GAME_ICONS[name];
  if (Game) return <Game size={props.size} className={props.className} aria-hidden />;
  const Icon = LUCIDE[name] ?? Lucide.Circle;
  return <Icon aria-hidden {...props} />;
}
