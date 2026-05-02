"use client";

import { useState } from "react";
import { ArrowSquareOut, Radio } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import type { NewsImpact, NewsSource } from "@/types/analysis";

interface NewsImpactListProps {
  items: NewsImpact[];
}

function sourceLinkLabel(s: NewsSource): string {
  if (s.label?.trim()) return s.label.trim();
  try {
    return new URL(s.url).hostname.replace(/^www\./, "");
  } catch {
    return "Источник";
  }
}

export function NewsImpactList({ items }: NewsImpactListProps) {
  const [active, setActive] = useState<NewsImpact | null>(null);

  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center text-sm text-muted-foreground">
        Нет данных о влиянии новостей на матч.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Radio className="h-4 w-4 text-foreground/80" weight="fill" />
          Связка с медиафоном
        </div>

        <ul className="space-y-2">
          {items.map((n, idx) => (
            <li key={`${idx}-${n.headline}`}>
              <button
                type="button"
                onClick={() => setActive(n)}
                className={cn(
                  "w-full rounded-lg border bg-background px-3 py-2.5 text-left transition-colors",
                  "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                )}
              >
                <div className="text-[11px] text-muted-foreground">{n.team}</div>
                <div className="mt-1 text-sm font-medium text-foreground">{n.headline}</div>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {n.impact}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Drawer open={active !== null} onOpenChange={(o) => !o && setActive(null)}>
        <DrawerContent>
          <div className="max-h-[min(70vh,520px)] overflow-y-auto overscroll-contain px-6">
            {active && (
              <>
                <DrawerHeader className="px-0 pt-0">
                  <p className="text-xs font-medium text-muted-foreground">{active.team}</p>
                  <DrawerTitle className="pt-1 text-left text-base leading-snug">
                    {active.headline}
                  </DrawerTitle>
                </DrawerHeader>

                {active.body ? (
                  <p className="pb-4 text-sm leading-relaxed text-foreground">{active.body}</p>
                ) : null}

                <div className="border-t border-border pt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Влияние на матч
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {active.impact}
                  </p>
                </div>

                {active.sources && active.sources.length > 0 ? (
                  <div className="mt-6 border-t border-border pt-4 pb-6">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Источники
                    </p>
                    <ul className="mt-3 space-y-2">
                      {active.sources.map((s, i) => (
                        <li key={`${s.url}-${i}`}>
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
                          >
                            <ArrowSquareOut
                              className="h-4 w-4 shrink-0 text-muted-foreground"
                              weight="fill"
                            />
                            <span className="min-w-0 break-words">{sourceLinkLabel(s)}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            )}
          </div>

          <DrawerFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setActive(null)}
            >
              Закрыть
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
