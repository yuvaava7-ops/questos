// Custom player avatars: a 16x16 pixel-art grid plus a palette, drawn by an AI
// through the MCP `set_avatar` tool and rendered by the app's sprite system.
// Everything stored is re-validated on read, and colours are strict hex, so an
// avatar can never inject markup into the page.

export const AVATAR_SIZE = 16;
export const MAX_AVATAR_COLORS = 16;

export interface Avatar {
  /** 16 rows of 16 chars. "." is transparent; other chars key into `palette`. */
  art: string[];
  /** Optional second walking frame, same shape as `art`. */
  walk: string[] | null;
  palette: Record<string, string>;
}

export class AvatarError extends Error {}

const HEX = /^#[0-9a-fA-F]{6}$/;
const KEY = /^[A-Za-z0-9]$/;

function checkGrid(name: string, grid: unknown, palette: Record<string, string>): string[] {
  if (!Array.isArray(grid) || grid.length !== AVATAR_SIZE) {
    throw new AvatarError(`${name} must be exactly ${AVATAR_SIZE} rows (got ${Array.isArray(grid) ? grid.length : "not an array"}).`);
  }
  let filled = 0;
  grid.forEach((row, y) => {
    if (typeof row !== "string" || row.length !== AVATAR_SIZE) {
      throw new AvatarError(`${name} row ${y} must be a string of exactly ${AVATAR_SIZE} characters (got ${typeof row === "string" ? row.length : typeof row}).`);
    }
    for (const ch of row) {
      if (ch === ".") continue;
      if (!(ch in palette)) throw new AvatarError(`${name} row ${y} uses "${ch}", which is not in the palette.`);
      filled++;
    }
  });
  if (filled < 30) throw new AvatarError(`${name} is nearly empty (${filled} filled pixels). Draw a full character.`);
  return grid as string[];
}

export function validateAvatar(input: { art: unknown; walk?: unknown; palette: unknown }): Avatar {
  const raw = input.palette;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new AvatarError("palette must be an object mapping one character to a #rrggbb colour.");
  const palette: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!KEY.test(key)) throw new AvatarError(`Palette key "${key}" must be a single letter or digit ("." is reserved for transparent).`);
    if (typeof value !== "string" || !HEX.test(value)) throw new AvatarError(`Palette colour for "${key}" must be #rrggbb hex (got ${JSON.stringify(value)}).`);
    palette[key] = value.toLowerCase();
  }
  const count = Object.keys(palette).length;
  if (count === 0 || count > MAX_AVATAR_COLORS) throw new AvatarError(`Use between 1 and ${MAX_AVATAR_COLORS} palette colours (got ${count}).`);

  const art = checkGrid("art", input.art, palette);
  const walk = input.walk == null ? null : checkGrid("walk_art", input.walk, palette);
  return { art, walk, palette };
}

/** For data read back from the database: null instead of throwing. */
export function parseAvatar(value: unknown): Avatar | null {
  if (!value || typeof value !== "object") return null;
  const v = value as { art?: unknown; walk?: unknown; palette?: unknown };
  try {
    return validateAvatar({ art: v.art, walk: v.walk, palette: v.palette });
  } catch {
    return null;
  }
}
