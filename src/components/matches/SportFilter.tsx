"use client";

import { cn } from "@/lib/utils";
import { SPORTS } from "@/lib/mock-data";
import type { SportSlug } from "@/types/match";

interface SportFilterProps {
  value: SportSlug | "all";
  onChange: (next: SportSlug | "all") => void;
  /** Количество событий по всем видам спорта (для чипа «Все») */
  allEventsCount: number;
  /** Сколько матчей в текущей вкладке по каждому виду спорта */
  countsBySport: Record<SportSlug, number>;
}

export function SportFilter({
  value,
  onChange,
  allEventsCount,
  countsBySport,
}: SportFilterProps) {
  const items: { slug: SportSlug | "all"; label: string; emoji: string }[] = [
    { slug: "all", label: "Все", emoji: "" },
    ...SPORTS,
  ];

  return (
    <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 no-scrollbar">
      {items.map((s) => {
        const active = value === s.slug;
        const isAll = s.slug === "all";
        const sportCount = isAll
          ? null
          : countsBySport[s.slug as SportSlug];
        return (
          <button
            key={s.slug}
            type="button"
            onClick={() => onChange(s.slug)}
            aria-label={
              isAll
                ? `Все виды спорта, ${allEventsCount} событий`
                : `${s.label}, ${sportCount ?? 0} событий`
            }
            className={cn(
              "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors",
              active
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {isAll ? (
              <>
                <span>{s.label}</span>
                <span className="min-w-[1.25rem] tabular-nums text-sm font-semibold leading-none">
                  {allEventsCount}
                </span>
              </>
            ) : (
              <>
                <span aria-hidden className="text-sm leading-none">
                  {s.emoji}
                </span>
                <span>{s.label}</span>
                <span className="min-w-[1rem] tabular-nums text-sm font-semibold leading-none">
                  {sportCount}
                </span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
