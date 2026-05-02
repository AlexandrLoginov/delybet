"use client";

import { useState } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { SPORTS } from "@/lib/mock-data";
import type { SportSlug } from "@/types/match";

export function SportsPreference({ initial }: { initial: SportSlug[] }) {
  const [selected, setSelected] = useState<SportSlug[]>(initial);

  const toggle = (s: SportSlug) =>
    setSelected((arr) =>
      arr.includes(s) ? arr.filter((x) => x !== s) : [...arr, s]
    );

  return (
    <div className="grid grid-cols-2 gap-2">
      {SPORTS.map((s) => {
        const active = selected.includes(s.slug);
        return (
          <button
            key={s.slug}
            type="button"
            onClick={() => toggle(s.slug)}
            className={cn(
              "relative flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
              active
                ? "border-foreground bg-accent"
                : "border-border bg-background hover:bg-accent/40"
            )}
          >
            <span className="text-xl leading-none" aria-hidden>
              {s.emoji}
            </span>
            <span className="flex-1 text-sm font-medium">{s.label}</span>
            <span
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded-full border",
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border"
              )}
            >
              {active && (
                <CheckCircle className="h-2.5 w-2.5" weight="fill" />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
