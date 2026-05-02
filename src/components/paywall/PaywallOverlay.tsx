import { LockSimple } from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { UpgradeModal } from "@/components/paywall/UpgradeModal";

interface PaywallOverlayProps {
  children: ReactNode;
  title?: string;
  description?: string;
  /** Кнопка «Открыть в Pro» под текстом градиента (как на списке матчей). */
  upgradeButton?: boolean;
}

export function PaywallOverlay({
  children,
  title = "Полный анализ — в Pro",
  description = "Открой обоснование рекомендации, ключевые факторы и влияние новостей.",
  upgradeButton = true,
}: PaywallOverlayProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card">
      <div
        className="pointer-events-none select-none [mask-image:linear-gradient(to_bottom,black_0,black_30%,transparent_88%)]"
        aria-hidden
      >
        <div className="opacity-50 blur-[3px]">{children}</div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 bg-gradient-to-t from-card via-card/95 to-transparent px-6 pb-6 pt-10 text-center">
        <div className="space-y-1">
          <div className="text-sm font-semibold">{title}</div>
          <p className="max-w-sm text-xs text-muted-foreground">{description}</p>
        </div>
        {upgradeButton ? (
          <UpgradeModal
            trigger={
              <Button size="sm" className="gap-1.5 px-5 shadow-lg">
                <LockSimple className="h-3.5 w-3.5" weight="fill" />
                Открыть в Pro
              </Button>
            }
          />
        ) : null}
      </div>
    </div>
  );
}
