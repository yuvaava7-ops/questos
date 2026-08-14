// Icons from https://game-icons.net (CC BY 3.0 — see icons/license.txt),
// imported as React components via @svgr/webpack (see next.config.js).
// Register each one here so StatCard/SkillProgressPanel can look icons up
// by name the same way they already do for lucide-react icons.
//
// 1. Drop the file in, e.g. icons/game/<author>/sword.svg
// 2. import Sword from "./<author>/sword.svg";
// 3. Add it below: sword: adaptSize(Sword),
// 4. Reference it from Supabase by that same key, e.g. icon = "sword"
// 5. Add the author to the attribution list below (license requires it)
//
// Raw SVGs use width/height, not lucide's `size` prop — adaptSize()
// remaps `size` to both so <Icon size={14} /> works for either kind.
//
// Icons used so far made by: Lorc (http://lorcblog.blogspot.com)

import type { ComponentType, SVGProps } from "react";
import CrossedSwords from "./lorc/crossed-swords.svg";

type IconProps = SVGProps<SVGSVGElement> & { size?: number | string };

export function adaptSize(Svg: ComponentType<SVGProps<SVGSVGElement>>): ComponentType<IconProps> {
  return function AdaptedIcon({ size, ...props }: IconProps) {
    return <Svg width={size} height={size} {...props} />;
  };
}

export const GAME_ICONS: Record<string, ComponentType<IconProps>> = {
  "crossed-swords": adaptSize(CrossedSwords),
};
