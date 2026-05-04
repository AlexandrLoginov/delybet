"use client";

import { useState, type ReactNode } from "react";
import { Medal } from "@phosphor-icons/react";

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
   * renew — уже есть Pro: редирект в Stripe Customer Portal
   */
  intent?: "subscribe" | "renew";
  /**
   * По умолчанию: renew → portal, subscribe → checkout через Stripe.
   * Можно переопределить явно.
   */
  billingAction?: "checkout" | "portal";
  /** Контролируемое открытие (например второй шаг из UpgradeModal без trigger) */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const INTENT_COPY = {
  renew: {
    eyebrow: "Продление Pro",
    title: "Управление подпиской",
    description:
      "Оплата, счета, смена карты и отмена — через защищённый кабинет Stripe.",
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
  billingAction,
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

  const resolvedBilling: "checkout" | "portal" =
    billingAction ?? (intent === "renew" ? "portal" : "checkout");

  const [selected, setSelected] = useState<string>(
    () => RENEWAL_PACKAGES[0]?.id ?? "1m"
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pkg = RENEWAL_PACKAGES.find((p) => p.id === selected) ?? RENEWAL_PACKAGES[0];
  const fullWithoutDiscount = renewalFullPriceWithoutDiscount(pkg.months);
  const eqMonthly = renewalEquivalentMonthlyRub(pkg.totalRub, pkg.months);
  const copy = INTENT_COPY[intent];

  async function submitPayment() {
    setError(null);
    setBusy(true);
    try {
      if (resolvedBilling === "portal") {
        const res = await fetch("/api/stripe/portal", {
          method: "POST",
          credentials: "include",
        });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !data.url) {
          setError(
            data.error === "NO_STRIPE_CUSTOMER"
              ? "Сначала оформи Pro — запись в Stripe ещё не создана."
              : (data.error ?? "Не удалось открыть кабинет оплаты")
          );
          return;
        }
        window.location.href = data.url;
        return;
      }

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: selected }),
      });
      const data = (await res.json()) as { url?: string; message?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(
          data.message ??
            data.error ??
            (res.status === 401
              ? "Откройте приложение через Telegram Mini App и попробуйте снова."
              : "Оплата временно недоступна.")
        );
        return;
      }
      window.location.href = data.url;
    } finally {
      setBusy(false);
    }
  }

  const showPackages = resolvedBilling === "checkout";

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent>
        <div className="max-h-[min(72vh,560px)] overflow-y-auto overscroll-contain px-6">
          <DrawerHeader className="px-0 pt-0">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Medal className="h-3.5 w-3.5" weight="fill" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-foreground">
                {copy.eyebrow}
              </span>
            </div>
            <DrawerTitle className="pt-2 text-left">{copy.title}</DrawerTitle>
            <DrawerDescription className="text-left">{copy.description}</DrawerDescription>
          </DrawerHeader>

          {showPackages ? (
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
          ) : (
            <p className="py-4 text-sm text-muted-foreground">
              После перехода вы сможете продлить период, обновить способ оплаты или отменить
              автопродление до конца оплаченного срока.
            </p>
          )}

          {error ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          ) : null}
        </div>

        <DrawerFooter className="gap-2">
          {showPackages ? (
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
          ) : null}

          <Button
            size="lg"
            className="w-full"
            type="button"
            disabled={busy}
            onClick={submitPayment}
          >
            {busy
              ? "Загрузка…"
              : resolvedBilling === "portal"
                ? "Открыть кабинет Stripe"
                : `Оплатить ${pkg.totalRub.toLocaleString("ru-RU")} ₽`}
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
