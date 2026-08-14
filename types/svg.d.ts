declare module "*.svg" {
  import type { SVGProps, FC } from "react";
  const Component: FC<SVGProps<SVGSVGElement>>;
  export default Component;
}
