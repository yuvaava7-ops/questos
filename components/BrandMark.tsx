import Link from "next/link";
import { adaptSize } from "@/icons/game/adapt-size";
import CrossedSwordsSvg from "@/icons/game/lorc/crossed-swords.svg";

const Logo = adaptSize(CrossedSwordsSvg);

export function BrandMark({ href = "/", className = "" }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={`group flex items-center gap-2.5 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-gold/60 bg-black/50 text-gold shadow-[inset_0_1px_0_rgb(255_255_255/0.08),inset_0_-2px_4px_rgb(0_0_0/0.6)] transition-colors group-hover:text-gold-bright">
        <Logo size={18} aria-hidden />
      </span>
      <span className="engraved font-display text-[17px] font-bold tracking-[0.08em] text-gold">QuestOS</span>
    </Link>
  );
}
