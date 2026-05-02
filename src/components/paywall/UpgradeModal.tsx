"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { CircleCheck, Medal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { RenewSubscriptionDrawer } from "@/components/subscription/RenewSubscriptionDrawer";

interface UpgradeModalProps {
  trigger?: ReactNode;
  defaultOpen?: boolean;
}

const FEATURES = [
  "Безлимит анализов матчей в день",
  "Развёрнутая аргументация ИИ",
  "Ключевые факторы и влияние новостей",
];

const PACKAGES_OPEN_DELAY_MS = 260;

export function UpgradeModal({ trigger, defaultOpen = false }: UpgradeModalProps) {
  const [marketingOpen, setMarketingOpen] = useState(defaultOpen);
  const [packagesOpen, setPackagesOpen] = useState(false);
  const packagesDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (packagesDelayRef.current) clearTimeout(packagesDelayRef.current);
    };
  }, []);

  const goToPackages = () => {
    setMarketingOpen(false);
    if (packagesDelayRef.current) clearTimeout(packagesDelayRef.current);
    packagesDelayRef.current = setTimeout(() => {
      packagesDelayRef.current = null;
      setPackagesOpen(true);
    }, PACKAGES_OPEN_DELAY_MS);
  };

  const handleMarketingOpenChange = (next: boolean) => {
    setMarketingOpen(next);
    if (next) setPackagesOpen(false);
  };

  return (
    <>
      <Drawer open={marketingOpen} onOpenChange={handleMarketingOpenChange}>
        {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
        <DrawerContent>
          <div className="max-h-[min(70vh,520px)] overflow-y-auto overscroll-contain px-6">
            <DrawerHeader className="px-0 pt-0">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Medal className="h-3.5 w-3.5" strokeWidth={2} />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-foreground">
                  DelyBet Pro
                </span>
              </div>
              <DrawerTitle className="pt-2 text-left">
                Получи полный анализ ИИ
              </DrawerTitle>
              <DrawerDescription className="text-left">
                7 дней бесплатно, потом 499 ₽/мес. Отмена в один клик.
              </DrawerDescription>
            </DrawerHeader>

            <ul className="space-y-2 py-4">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success-muted text-success">
                    <CircleCheck className="h-2.5 w-2.5" strokeWidth={2} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <DrawerFooter className="gap-2 pb-[max(2rem,calc(env(safe-area-inset-bottom)+1rem))]">
            <Button
              size="lg"
              className="w-full"
              type="button"
              onClick={goToPackages}
            >
              Посмотреть пакеты подписки
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              type="button"
              onClick={() => setMarketingOpen(false)}
            >
              Может, позже
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <RenewSubscriptionDrawer
        intent="subscribe"
        open={packagesOpen}
        onOpenChange={setPackagesOpen}
      />
    </>
  );
}
