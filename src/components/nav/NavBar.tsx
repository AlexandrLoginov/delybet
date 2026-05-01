"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleUser,
  History,
  Star,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (path: string) => boolean;
}

const ITEMS: NavItem[] = [
  {
    href: "/matches",
    label: "Главная",
    icon: Trophy,
    match: (p) =>
      p === "/" || p === "/matches" || p.startsWith("/match/"),
  },
  {
    href: "/history",
    label: "История",
    icon: History,
    match: (p) => p.startsWith("/history"),
  },
  {
    href: "/favorites",
    label: "Избранное",
    icon: Star,
    match: (p) => p.startsWith("/favorites"),
  },
  {
    href: "/profile",
    label: "Профиль",
    icon: CircleUser,
    match: (p) => p.startsWith("/profile"),
  },
];

export function NavBar() {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/75"
      aria-label="Главная навигация"
    >
      <div className="mx-auto grid w-full max-w-2xl grid-cols-4">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] transition-transform",
                  active && "scale-110 text-primary"
                )}
                strokeWidth={active ? 2.25 : 2}
                aria-hidden
              />
              {item.label}
            </Link>
          );
        })}
      </div>
      <div
        className="h-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] shrink-0"
        aria-hidden
      />
    </nav>
  );
}
