// Kept separate from index.tsx (which eagerly imports every registered
// icon) so components that only need one or two specific icons can import
// adaptSize without pulling the whole icon set into their bundle.
import type { ComponentType, SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement> & { size?: number | string };

export function adaptSize(Svg: ComponentType<SVGProps<SVGSVGElement>>): ComponentType<IconProps> {
  return function AdaptedIcon({ size, ...props }: IconProps) {
    return <Svg width={size} height={size} {...props} />;
  };
}
