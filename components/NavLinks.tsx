"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TreeDeciduous, Settings } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/skills", label: "Skill Trees", icon: TreeDeciduous },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

export function NavLinks({ variant }: { variant: "sidebar" | "compact" }) {
  const pathname = usePathname();

  if (variant === "compact") {
    return (
      <nav aria-label="Main" className="flex items-center gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={`rounded-[9px] p-2 transition-colors ${active ? "bg-gold/15 text-gold" : "text-text-faint hover:bg-white/[0.04] hover:text-text"}`}
            >
              <Icon size={17} strokeWidth={1.75} />
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <>
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`group relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
              active
                ? "bg-gradient-to-r from-gold/[0.16] to-gold/[0.02] text-text"
                : "text-text-dim hover:bg-white/[0.04] hover:text-text"
            }`}
          >
            {active && (
              <span aria-hidden className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-gold shadow-[0_0_10px_rgb(var(--gold)/0.9)]" />
            )}
            <Icon size={17} strokeWidth={1.75} className={active ? "text-gold" : "text-text-faint group-hover:text-text-dim"} />
            {label}
          </Link>
        );
      })}
    </>
  );
}
