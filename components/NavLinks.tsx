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
              className={`rounded-[6px] border p-2 transition-colors ${
                active ? "border-gold/50 bg-black/40 text-gold" : "border-transparent text-text-faint hover:text-text"
              }`}
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
            className={`group flex items-center gap-3 rounded-[6px] border px-3 py-2 font-display text-[14px] font-semibold tracking-wide transition-colors ${
              active
                ? "border-gold/45 bg-black/40 text-gold shadow-[inset_0_2px_6px_rgb(0_0_0/0.5)]"
                : "border-transparent text-text-dim hover:border-white/10 hover:bg-black/20 hover:text-text"
            }`}
          >
            <Icon size={17} strokeWidth={1.75} className={active ? "text-gold" : "text-text-faint group-hover:text-text-dim"} />
            {label}
          </Link>
        );
      })}
    </>
  );
}
