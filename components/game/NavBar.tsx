"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sprite } from "@/components/pixel/Sprite";
import { CHEST, GEM, SWORD } from "@/components/pixel/sprites";

const TABS = [
  { href: "/dashboard", label: "Quests", sprite: SWORD, match: (p: string) => p === "/dashboard" },
  { href: "/dashboard/skills", label: "Skills", sprite: GEM, match: (p: string) => p.startsWith("/dashboard/skills") },
  { href: "/dashboard/settings", label: "Camp", sprite: CHEST, match: (p: string) => p.startsWith("/dashboard/settings") },
];

// Fixed bottom tab bar, thumb-reachable on phones.
export function NavBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Sections"
      className="fixed inset-x-0 bottom-0 z-40 border-t-4 border-paper bg-ink pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_0_0_#0b0820]"
    >
      <ul className="mx-auto flex max-w-[560px]">
        {TABS.map((t) => {
          const active = t.match(pathname);
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1.5 py-2.5 ${active ? "bg-dusk text-gold" : "text-faint hover:text-paper"}`}
              >
                <span className={active ? "anim-bob" : undefined}>
                  <Sprite def={t.sprite} scale={3} />
                </span>
                <span className="px-title text-[9px]">{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
