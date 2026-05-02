"use client";

import { useState, type ReactNode } from "react";
import { Medal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import {
  RENEWAL_BASE_MONTHLY_RUB,
  RENEWAL_PACKAGES,
  renewalEquivalentMonthlyRub,
  renewalFullPriceWithoutDiscount,
  type RenewalPackage,
} from "@/lib/renewal-packages";
import { cn } from "@/lib/utils";

interface RenewSubscriptionDrawerProps {
  trigger?: ReactNode;
  defaultOpen?: boolean;
  /**
   * subscribe — первое оформление Pro (например с профиля)
   * renew — продление уже активной подписки
   */
  intent?: "subscribe" | "renew";
  /** Контролируемое открытие (например второй шаг из UpgradeModal без trigger) */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const INTENT_COPY = {
  renew: {
    eyebrow: "Продление Pro",
    title: "Выбери срок продления",
    description:
      "Чем дольше период — тем ниже цена за месяц. Оплата разовая за выбранный срок.",
    packagesLabel: "Пакеты продления",
    packagesAria: "Пакеты продления",
  },
  subscribe: {
    eyebrow: "DelyBet Pro",
    title: "Выбери пакет подписки",
    description:
      "Оформи доступ на месяц или на несколько месяцев — чем дольше период, тем ниже эквивалентная цена за месяц.",
    packagesLabel: "Пакеты",
    packagesAria: "Пакеты подписки Pro",
  },
} as const;

export function RenewSubscriptionDrawer({
  trigger,
  defaultOpen = false,
  intent = "renew",
  open: controlledOpen,
  onOpenChange,
}: RenewSubscriptionDrawerProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  function handleOpenChange(next: boolean) {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  }
  const [selected, setSelected] = useState<string>(
    () => RENEWAL_PACKAGES[0]?.id ?? "1m"
  );

  const pkg = RENEWAL_PACKAGES.find((p) => p.id === selected) ?? RENEWAL_PACKAGES[0];
  const fullWithoutDiscount = renewalFullPriceWithoutDiscount(pkg.months);
  const eqMonthly = renewalEquivalentMonthlyRub(pkg.totalRub, pkg.months);
  const copy = INTENT_COPY[intent];

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent>
        <div className="max-h-[min(72vh,560px)] overflow-y-auto overscroll-contain px-6">
          <DrawerHeader className="px-0 pt-0">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Medal className="h-3.5 w-3.5" strokeWidth={2} />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-foreground">
                {copy.eyebrow}
              </span>
            </div>
            <DrawerTitle className="pt-2 text-left">{copy.title}</DrawerTitle>
            <DrawerDescription className="text-left">{copy.description}</DrawerDescription>
          </DrawerHeader>

          <div className="space-y-2 py-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {copy.packagesLabel}
            </p>
            <ul
              className="flex flex-col gap-2"
              role="listbox"
              aria-label={copy.packagesAria}
            >
              {RENEWAL_PACKAGES.map((p) => (
                <li key={p.id}>
                  <PackageOption
                    pkg={p}
                    selected={selected === p.id}
                    onSelect={() => setSelected(p.id)}
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-[11px] leading-snug text-muted-foreground">
            Базовый месяц без скидки — {RENEWAL_BASE_MONTHLY_RUB} ₽. Скидки считаются от
            суммы «{RENEWAL_BASE_MONTHLY_RUB} ₽ × число месяцев» в пакете.
          </div>
        </div>

        <DrawerFooter className="gap-2 pb-[max(2rem,calc(env(safe-area-inset-bottom)+1rem))]">
          <div className="flex w-full flex-col gap-1 pb-1 text-center">
            <span className="text-xs text-muted-foreground">
              К оплате за выбранный период
            </span>
            <span className="text-xl font-semibold tabular-nums text-foreground">
              {pkg.totalRub.toLocaleString("ru-RU")} ₽
            </span>
            <span className="text-[11px] text-muted-foreground">
              ~{eqMonthly} ₽/мес · экономия к помесячной оплате{" "}
              {fullWithoutDiscount - pkg.totalRub > 0
                ? `${fullWithoutDiscount.toLocaleString("ru-RU")} ₽ → ${pkg.totalRub.toLocaleString("ru-RU")} ₽`
                : "—"}
            </span>
          </div>
          <Button size="lg" className="w-full" type="button">
            Оплатить {pkg.totalRub.toLocaleString("ru-RU")} ₽
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            type="button"
            onClick={() => handleOpenChange(false)}
          >
            Закрыть
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function PackageOption({
  pkg,
  selected,
  onSelect,
}: {
  pkg: RenewalPackage;
  selected: boolean;
  onSelect: () => void;
}) {
  const fullList = renewalFullPriceWithoutDiscount(pkg.months);
  const eq = renewalEquivalentMonthlyRub(pkg.totalRub, pkg.months);

  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      className={cn(
        "flex w-full items-stretch gap-3 rounded-xl border p-3.5 text-left transition-colors",
        selected
          ? "border-primary bg-primary/[0.08] ring-1 ring-primary/35"
          : "border-border bg-background hover:bg-muted/40"
      )}
    >
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-foreground">{pkg.title}</span>
          {pkg.discountPercent > 0 && (
            <Badge variant="success" className="px-1.5 text-[10px] font-semibold">
              −{pkg.discountPercent}%
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{pkg.caption}</p>
        <p className="text-[11px] text-muted-foreground">
          <span className="tabular-nums">{eq} ₽/мес</span>
          {pkg.discountPercent > 0 && (
            <>
              {" "}
              <span className="line-through opacity-70">
                {RENEWAL_BASE_MONTHLY_RUB} ₽/мес
              </span>
            </>
          )}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end justify-center gap-0.5 text-right">
        <span className="text-base font-semibold tabular-nums text-foreground">
          {pkg.totalRub.toLocaleString("ru-RU")} ₽
        </span>
        {pkg.discountPercent > 0 && (
          <span className="text-[11px] text-muted-foreground line-through tabular-nums">
            {fullList.toLocaleString("ru-RU")} ₽
          </span>
        )}
      </div>
    </button>
  );
}
