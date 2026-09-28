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
              className={`rounded-[8px] p-2 transition-colors ${active ? "bg-white/[0.06] text-gold" : "text-text-faint hover:text-text"}`}
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
            className={`flex items-center gap-3 rounded-[6px] border-l-2 px-3 py-2 text-[13.5px] font-medium transition-colors ${
              active
                ? "border-gold bg-white/[0.05] text-text"
                : "border-transparent text-text-faint hover:bg-white/[0.03] hover:text-text-dim"
            }`}
          >
            <Icon size={16} strokeWidth={1.75} />
            {label}
          </Link>
        );
      })}
    </>
  );
}
