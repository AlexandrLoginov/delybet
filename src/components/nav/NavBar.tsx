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
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/85 pb-[max(24px,env(safe-area-inset-bottom,0px))] backdrop-blur supports-[backdrop-filter]:bg-background/75"
      aria-label={t("nav.aria")}
    >
      <div className="mx-auto grid w-full max-w-2xl grid-cols-4">
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
                "group flex flex-col items-center gap-1 pt-3 pb-0 text-[11px] font-medium transition-colors",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/80"
              )}
            >
              <span className="relative inline-flex">
                <Icon
                  weight="fill"
                  className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-[transform,color]",
                    active
                      ? "scale-110 !text-primary"
                      : "text-muted-foreground group-hover:text-foreground/80"
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
