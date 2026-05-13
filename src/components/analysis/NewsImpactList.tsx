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
      <div className="flex h-fit w-full max-w-full flex-col gap-1.5">
        <div className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Radio className="h-3.5 w-3.5 shrink-0 text-foreground/80" weight="fill" />
          Связка с медиафоном
        </div>

        <ul className="m-0 grid w-full max-w-full list-none grid-cols-1 auto-rows-min gap-1 p-0">
          {items.map((n, idx) => (
            <li key={`${idx}-${n.headline}`} className="m-0 min-h-0 flex-none p-0">
              <button
                type="button"
                onClick={() => setActive(n)}
                className={cn(
                  "w-full min-w-0 overflow-hidden rounded-lg border bg-background px-2.5 py-2 text-left transition-colors",
                  "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                )}
              >
                <div className="text-[11px] leading-tight text-muted-foreground">{n.team}</div>
                <div className="mt-0.5 text-sm font-medium leading-snug text-foreground">
                  {n.headline}
                </div>
                <div className="mt-0.5 line-clamp-2 break-words text-xs leading-snug text-muted-foreground">
                  {(n.body?.trim() || n.impact).trim()}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Drawer open={active !== null} onOpenChange={(o) => !o && setActive(null)}>
        <DrawerContent>
          <div className="max-h-[min(70vh,520px)] overflow-y-auto overscroll-contain px-6 pb-10">
            {active && (
              <>
                <DrawerHeader className="px-0 pt-0">
                  <p className="text-xs font-medium text-muted-foreground">{active.team}</p>
                  <DrawerTitle className="pt-1 text-left text-base leading-snug">
                    {active.headline}
                  </DrawerTitle>
                </DrawerHeader>

                {active.body ? (
                  <div className="space-y-3 pb-1">
                    {active.body
                      .split(/\n\n+/)
                      .map((p) => p.trim())
                      .filter(Boolean)
                      .map((para, i) => (
                        <p
                          key={i}
                          className="text-sm leading-relaxed text-foreground/90"
                        >
                          {para}
                        </p>
                      ))}
                  </div>
                ) : null}

                <div className="pt-1">
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
