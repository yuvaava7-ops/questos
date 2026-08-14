// Icons from https://game-icons.net (CC BY 3.0 — see icons/license.txt),
// imported as React components via @svgr/webpack (see next.config.js).
// Register each one here so StatCard/SkillProgressPanel can look icons up
// by name the same way they already do for lucide-react icons.
//
// This module eagerly imports every registered icon, so anything that only
// needs ONE specific icon (a logo mark, a fixed decoration) should import
// that .svg directly + adaptSize from "@/icons/game/adapt-size" instead of
// importing GAME_ICONS here — otherwise it drags the whole set into its
// bundle. Reserve this barrel for genuine name-string lookups (icon values
// coming from the database).
//
// 1. Drop the file in, e.g. icons/game/<author>/sword.svg
// 2. import Sword from "./<author>/sword.svg";
// 3. Add it below: sword: adaptSize(Sword),
// 4. Reference it from Supabase by that same key, e.g. icon = "sword"
// 5. Add the author to the attribution list below (license requires it)
//
// Icons used so far made by: Lorc (http://lorcblog.blogspot.com),
// Delapouite (https://delapouite.com)

import type { ComponentType } from "react";
import { adaptSize, type IconProps } from "./adapt-size";
import CrossedSwords from "./lorc/crossed-swords.svg";
import Compass from "./lorc/compass.svg";
import LockedChest from "./lorc/locked-chest.svg";
import Quill from "./lorc/quill.svg";
import OpenBook from "./lorc/open-book.svg";
import Trophy from "./lorc/trophy.svg";
import SwordBrandish from "./delapouite/sword-brandish.svg";

export const GAME_ICONS: Record<string, ComponentType<IconProps>> = {
  "crossed-swords": adaptSize(CrossedSwords),
  compass: adaptSize(Compass),
  "locked-chest": adaptSize(LockedChest),
  quill: adaptSize(Quill),
  "open-book": adaptSize(OpenBook),
  trophy: adaptSize(Trophy),
  "sword-brandish": adaptSize(SwordBrandish),
};
