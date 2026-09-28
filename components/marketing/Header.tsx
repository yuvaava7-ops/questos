import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { PRIMARY_BUTTON_CLASS } from "@/lib/theme";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/50 bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between px-4 py-4 sm:px-6">
        <BrandMark />
        <nav className="flex items-center gap-4 sm:gap-5">
          <Link href="/login" className="text-[13.5px] font-medium text-text-dim transition-colors hover:text-text">
            Log in
          </Link>
          <Link href="/signup" className={`${PRIMARY_BUTTON_CLASS} px-4 py-1 text-[14px]`}>
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
}
