import Link from "next/link";
import { Zap } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 font-display text-[15px] font-semibold tracking-wide">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gold text-bg">
            <Zap size={14} />
          </div>
          QuestOS
        </Link>
        <nav className="flex items-center gap-5">
          <Link href="/login" className="text-[13.5px] font-medium text-text-dim transition-colors hover:text-text">
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-[8px] bg-gold px-4 py-2 text-[13.5px] font-semibold text-bg transition-opacity hover:opacity-90"
          >
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
}
