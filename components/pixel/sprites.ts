// Pixel-art sprites as plain string grids. "." is transparent; every other
// character is a key into the sprite's palette. Keep every row the same width.

export interface SpriteDef {
  art: string[];
  palette: Record<string, string>;
}

const INK = "#0b0820";

export const HERO_PALETTE = {
  k: INK,
  h: "#6b3f24",
  s: "#ffcf9f",
  R: "#e8344f",
  b: "#4a7bff",
  B: "#2a3fa8",
  w: "#f4f1ff",
  g: "#ffd24a",
  d: "#4a2c18",
};

const HERO_TOP = [
  "......kkkk......",
  ".....khhhhk.....",
  "....khhhhhhk....",
  "....khhhhhhk....",
  "....khhsssk.....",
  "....kssskssk....",
  "....kssssssk....",
  ".....kssssk.....",
  "....kRRRRk......",
  "...kbbbbbbk.....",
  "..ksbbwwbbsk....",
  "..ksbbbbbbsk....",
  "...kbbbbbbk.....",
  "...kggggggk.....",
];

export const HERO_A: SpriteDef = {
  art: [...HERO_TOP, "...kBBkkBBk.....", "..kdddkkdddk...."],
  palette: HERO_PALETTE,
};

export const HERO_B: SpriteDef = {
  art: [...HERO_TOP, "....kBBBBk......", "....kddddk......"],
  palette: HERO_PALETTE,
};

export const CHEST: SpriteDef = {
  art: [
    "..kkkkkkkkkkkk..",
    ".kbbbbbbbbbbbbk.",
    "kbBBBBBBBBBBBBbk",
    "kbBkkkkkkkkkkBbk",
    "kbBBBBggggBBBBbk",
    "kkkkkkkggkkkkkkk",
    "kbbbbbkggkbbbbbk",
    "kbBBBBkggkBBBBbk",
    "kbBBBBBkkBBBBBbk",
    "kbBBBBBBBBBBBBbk",
    ".kkkkkkkkkkkkkk.",
  ],
  palette: { k: INK, b: "#c8782f", B: "#8a4a1c", g: "#ffd24a" },
};

export const COIN: SpriteDef = {
  art: [
    "..kkkk..",
    ".kggggk.",
    "kgGwwGgk",
    "kgGwgGgk",
    "kgGwgGgk",
    "kgGGGGgk",
    ".kggggk.",
    "..kkkk..",
  ],
  palette: { k: INK, g: "#ffd24a", G: "#c48a1a", w: "#fff6c9" },
};

export const HEART: SpriteDef = {
  art: [
    ".kk...kk.",
    "krrk.krrk",
    "krwrkrrrk",
    "krrrrrrrk",
    ".krrrrrk.",
    "..krrrk..",
    "...krk...",
    "....k....",
  ],
  palette: { k: INK, r: "#ff4d6d", w: "#ffd1da" },
};

export const STAR: SpriteDef = {
  art: [
    "....k....",
    "...kyk...",
    "...kyk...",
    "kkkkykkkk",
    "kyyyyyyyk",
    ".kyywyyk.",
    "..kyyyk..",
    ".kyykyyk.",
    ".kkk.kkk.",
  ],
  palette: { k: INK, y: "#ffd24a", w: "#fff6c9" },
};

export const FLAME: SpriteDef = {
  art: [
    "....k....",
    "...kok...",
    "..kook...",
    "..koook..",
    ".kooyook.",
    ".kooyyok.",
    ".koyyyyok",
    ".kooyyok.",
    "..kooook.",
    "...kkkk..",
  ],
  palette: { k: INK, o: "#ff7a2f", y: "#ffd24a" },
};

function buildCastle(): string[] {
  const W = 24;
  const H = 16;
  const g = Array.from({ length: H }, () => Array<string>(W).fill("."));
  const box = (x: number, y: number, w: number, h: number, fill: string) => {
    for (let j = y; j < y + h; j++) {
      for (let i = x; i < x + w; i++) {
        const edge = i === x || i === x + w - 1 || j === y || j === y + h - 1;
        g[j][i] = edge ? "k" : fill;
      }
    }
  };
  box(1, 5, 6, 11, "g"); // left tower
  box(17, 5, 6, 11, "g"); // right tower
  box(6, 7, 12, 9, "g"); // keep
  // battlements: notch the top edge of each block
  for (const [x, w, y] of [[1, 6, 5], [17, 6, 5], [6, 12, 7]] as const) {
    for (let i = x + 1; i < x + w - 1; i += 2) g[y][i] = ".";
  }
  // flag
  for (let j = 0; j < 7; j++) g[j][12] = "k";
  for (const j of [0, 1, 2]) for (const i of [13, 14, 15]) g[j][i] = j === 1 || i < 15 ? "R" : "k";
  // gate + windows
  box(10, 11, 4, 5, "d");
  for (const [x, y] of [[3, 8], [19, 8], [8, 9], [15, 9]]) g[y][x] = "G";
  for (const x of [3, 19]) g[11][x] = "G";
  return g.map((r) => r.join(""));
}

export const CASTLE: SpriteDef = {
  art: buildCastle(),
  palette: { k: INK, g: "#c9c2f5", G: "#7d77b8", d: "#4a2c18", R: "#ff4d6d" },
};

export const SWORD: SpriteDef = {
  art: [
    ".......kk",
    "......kwk",
    ".....kwk.",
    "....kwk..",
    "k..kwk...",
    "kgkwk....",
    ".kgk.....",
    "kdkgk....",
    "kk..k....",
  ],
  palette: { k: INK, w: "#e8ecff", g: "#ffd24a", d: "#8a4a1c" },
};

export const GEM: SpriteDef = {
  art: [
    "..kkkk..",
    ".kwcccck",
    "kwccccck",
    "kcccCCck",
    ".kcCCck.",
    "..kCCk..",
    "...kk...",
  ],
  palette: { k: INK, c: "#4ad8ff", C: "#2a8fc4", w: "#e6faff" },
};

export const CHECK: SpriteDef = {
  art: [
    "......w.",
    ".....ww.",
    "w...ww..",
    "ww.ww...",
    ".www....",
    "..w.....",
  ],
  palette: { w: INK },
};

export const CURSOR: SpriteDef = {
  art: [
    "k.......",
    "kk......",
    "kwk.....",
    "kwwk....",
    "kwwwk...",
    "kwwwwk..",
    "kwwwk...",
    "kwwk....",
    "kwk.....",
    "kk......",
    "k.......",
  ],
  palette: { k: INK, w: "#ffd24a" },
};

export const LOCK: SpriteDef = {
  art: [
    "..kkkk..",
    ".k....k.",
    ".k....k.",
    "kkkkkkkk",
    "kyyyyyyk",
    "kyykkyyk",
    "kyyykyyk",
    "kkkkkkkk",
  ],
  palette: { k: INK, y: "#7d77b8" },
};

export const HOURGLASS: SpriteDef = {
  art: [
    "kkkkkkkk",
    "kooooook",
    ".kooook.",
    "..kook..",
    "...kk...",
    "..kook..",
    ".kooook.",
    "kooooook",
    "kkkkkkkk",
  ],
  palette: { k: INK, o: "#ff9a3c" },
};

// Recolours a sprite by swapping palette keys, e.g. a gem per skill-tree accent.
export function tint(def: SpriteDef, colors: Record<string, string>): SpriteDef {
  return { art: def.art, palette: { ...def.palette, ...colors } };
}

// Four-point star used for skill-tree nodes. w = body, c = bright core.
export const STAR_NODE: SpriteDef = {
  art: [
    "...w...",
    "...w...",
    "..www..",
    "wwwcwww",
    "..www..",
    "...w...",
    "...w...",
  ],
  palette: { w: "#f4f1ff", c: "#ffffff" },
};

// Weekly bosses, from small to large.
export const SLIME: SpriteDef = {
  art: [
    "................",
    "................",
    "......kkkk......",
    "....kkggggkk....",
    "...kgggggggwk...",
    "..kggwwgggggbk..".replace("b", "g"),
    "..kgkkggggkkgk..",
    "..kgkkggggkkgk..",
    ".kgggggggggggbk.".replace("b", "g"),
    ".kggggkkkkggggk.",
    ".kgggggggggggGk.",
    "..kkkkkkkkkkkk..",
  ],
  palette: { k: INK, g: "#5bd96a", G: "#2e7d46", w: "#c4ffcb" },
};

export const SKULL: SpriteDef = {
  art: [
    "....kkkkkkkk....",
    "..kkwwwwwwwwkk..",
    ".kwwwwwwwwwwwwk.",
    ".kwwwwwwwwwwwwk.",
    ".kwkkkkwwkkkkwk.",
    ".kwkrrkwwkrrkwk.",
    ".kwkkkkwwkkkkwk.",
    ".kwwwwwkkwwwwwk.",
    "..kwwwwwwwwwwk..",
    "...kwkwkwkwkwk..",
    "...kkkkkkkkkkk..",
    "................",
  ],
  palette: { k: INK, w: "#e8ecff", r: "#ff4d6d" },
};

export const EYE: SpriteDef = {
  art: [
    "k..............k",
    "kk....kkkk....kk",
    "kPk.kkwwwwkk.kPk",
    ".kPkwwwwwwwwkPk.",
    ".kkwwwrrrrwwwkk.",
    "..kwwrrkkrrwwk..",
    "..kwwrkkkkrwwk..",
    "..kwwrrkkrrwwk..",
    "..kwwwrrrrwwwk..",
    "...kkwwwwwwkk...",
    ".....kkkkkk.....",
    "................",
  ],
  palette: { k: INK, w: "#f4f1ff", r: "#ff4d6d", P: "#b377ff" },
};
