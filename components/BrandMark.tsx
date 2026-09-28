import Link from "next/link";
import { adaptSize } from "@/icons/game/adapt-size";
import CrossedSwordsSvg from "@/icons/game/lorc/crossed-swords.svg";

const Logo = adaptSize(CrossedSwordsSvg);

export function BrandMark({ href = "/", className = "" }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={`flex items-center gap-2.5 font-display text-[15px] font-semibold tracking-wide ${className}`}>
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gold text-bg">
        <Logo size={15} aria-hidden />
      </span>
      QuestOS
    </Link>
  );
}
