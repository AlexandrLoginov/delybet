"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import {
  ChartBar,
  Star,
  Trophy,
  UserCircle,
} from "@phosphor-icons/react";
import { useSyncExternalStore } from "react";

import {
  getFavoriteMatchesServerSnapshot,
  getFavoriteMatchesSnapshot,
  subscribeFavoritesChange,
} from "@/lib/favorites";
import { useAppLocale } from "@/hooks/use-app-locale";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  labelKey: "nav.home" | "nav.favorites" | "nav.statistics" | "nav.profile";
  icon: PhosphorIcon;
  match: (path: string) => boolean;
  indicatorWhen?: (key: string) => boolean;
}

const ITEMS: NavItem[] = [
  {
    href: "/matches",
    labelKey: "nav.home",
    icon: Trophy,
    match: (p) =>
      p === "/" || p === "/matches" || p.startsWith("/match/"),
  },
  {
    href: "/favorites",
    labelKey: "nav.favorites",
    icon: Star,
    match: (p) => p.startsWith("/favorites"),
    indicatorWhen: (key) => key.length > 0,
  },
  {
    href: "/statistics",
    labelKey: "nav.statistics",
    icon: ChartBar,
    match: (p) => p.startsWith("/statistics"),
  },
  {
    href: "/profile",
    labelKey: "nav.profile",
    icon: UserCircle,
    match: (p) => p.startsWith("/profile"),
  },
];

export function NavBar() {
  const pathname = usePathname() ?? "/";
  const { t } = useAppLocale();
  const favoritesKey = useSyncExternalStore(
    subscribeFavoritesChange,
    getFavoriteMatchesSnapshot,
    getFavoriteMatchesServerSnapshot
  );

  return (
    <nav
      data-telegram-gate-exempt
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(20px,env(safe-area-inset-bottom,0px))]"
      aria-label={t("nav.aria")}
    >
      <div className="glass-nav pointer-events-auto mx-auto grid w-full max-w-md grid-cols-4 rounded-2xl">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          const showFavDot =
            item.indicatorWhen?.(favoritesKey) ?? false;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex cursor-pointer flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors duration-200",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/85"
              )}
            >
              <span className="relative inline-flex">
                <Icon
                  weight="fill"
                  className={cn(
                    "h-[20px] w-[20px] shrink-0 transition-[transform,color] duration-200",
                    active
                      ? "scale-110 !text-primary"
                      : "text-muted-foreground group-hover:text-foreground/85"
                  )}
                  aria-hidden
                />
                {showFavDot ? (
                  <span
                    className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background"
                    aria-hidden
                  />
                ) : null}
              </span>
              {t(item.labelKey)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
