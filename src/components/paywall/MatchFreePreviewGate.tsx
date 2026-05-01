"use client";

import { Lock, Medal } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { UpgradeModal } from "@/components/paywall/UpgradeModal";
import {
  freePreviewKindForMatch,
  getFreeRedeemedMatchId,
  redeemFreePreview,
  isMatchGloballyEligibleForFreePreview,
} from "@/lib/freemium";
import type { Match } from "@/types/match";

function FreePreviewBlocked() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Lock className="h-5 w-5" strokeWidth={2} />
      </div>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">
          Бесплатный просмотр уже использован
        </h1>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          Полный ИИ‑анализ остальных матчей доступен по подписке Pro.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <UpgradeModal
          trigger={
            <Button className="gap-1.5">
              <Medal className="h-3.5 w-3.5" strokeWidth={2} />
              Оформить Pro
            </Button>
          }
        />
        <Button asChild variant="outline">
          <Link href="/matches">К списку матчей</Link>
        </Button>
      </div>
    </main>
  );
}

export function MatchFreePreviewGate({
  match,
  isPro,
  children,
}: {
  match: Match;
  isPro: boolean;
  children: ReactNode;
}) {
  if (isPro) return <>{children}</>;

  const eligibleGlobally = isMatchGloballyEligibleForFreePreview(match);
  const kind = freePreviewKindForMatch(match);

  if (typeof window !== "undefined") {
    const r = getFreeRedeemedMatchId(kind);
    if (!r && eligibleGlobally) {
      redeemFreePreview(match.id, kind);
    }
  }

  const redeemed = getFreeRedeemedMatchId(kind);

  if (!eligibleGlobally) {
    if (redeemed === match.id) return <>{children}</>;
    return <FreePreviewBlocked />;
  }

  const rNow = getFreeRedeemedMatchId(kind);
  if (!rNow || rNow === match.id) return <>{children}</>;
  return <FreePreviewBlocked />;
}
