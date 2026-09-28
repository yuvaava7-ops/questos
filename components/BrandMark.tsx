import Link from "next/link";
import { adaptSize } from "@/icons/game/adapt-size";
import CrossedSwordsSvg from "@/icons/game/lorc/crossed-swords.svg";

const Logo = adaptSize(CrossedSwordsSvg);

export function BrandMark({ href = "/", className = "" }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={`group flex items-center gap-2.5 font-display text-[15px] font-semibold tracking-wide ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-gradient-to-br from-gold-bright to-gold text-bg shadow-glow transition-transform group-hover:scale-105">
        <Logo size={16} aria-hidden />
      </span>
      <span className="bg-gradient-to-b from-text to-text-dim bg-clip-text text-transparent">QuestOS</span>
    </Link>
  );
}
