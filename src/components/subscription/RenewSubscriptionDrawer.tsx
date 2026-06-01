"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CaretLeft, Medal } from "@phosphor-icons/react";

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
import { PaymentMethodStep } from "@/components/subscription/PaymentMethodStep";
import { getMessages } from "@/i18n";
import { useAppLocale } from "@/hooks/use-app-locale";
import {
  paymentMethodsForLocale,
  shouldShowPaymentMethodStep,
  type PaymentMethodId,
} from "@/lib/payment-methods";
import {
  mergeRenewalPackages,
  RENEWAL_BASE_MONTHLY_RUB,
  RENEWAL_PACKAGES,
  renewalFullPriceWithoutDiscount,
  type RenewalPackage,
} from "@/lib/renewal-packages";
import { cn } from "@/lib/utils";

interface RenewSubscriptionDrawerProps {
  trigger?: ReactNode;
  defaultOpen?: boolean;
  intent?: "subscribe" | "renew";
  billingAction?: "checkout" | "portal";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type CheckoutStep = "package" | "method";

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
    if (!next) setCheckoutStep("package");
    onOpenChange?.(next);
  }

  const resolvedBilling: "checkout" | "portal" =
    billingAction ?? (intent === "renew" ? "portal" : "checkout");

  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("package");
  const [selected, setSelected] = useState<string>(
    () => RENEWAL_PACKAGES[0]?.id ?? "1m"
  );
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>("stripe");
  const [availableMethods, setAvailableMethods] = useState<PaymentMethodId[]>([
    "stripe",
  ]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { locale, t, formatFromRub, formatMonthlyFromRub } = useAppLocale();

  const localizedPackages = useMemo(
    () =>
      mergeRenewalPackages(
        RENEWAL_PACKAGES,
        getMessages(locale).subscription.packages
      ),
    [locale]
  );

  const pkg =
    localizedPackages.find((p) => p.id === selected) ?? localizedPackages[0];
  const fullWithoutDiscount = renewalFullPriceWithoutDiscount(pkg.months);

  const renew = intent === "renew";
  const eyebrow = renew
    ? t("subscription.renew.eyebrowRenew")
    : t("subscription.renew.eyebrowSubscribe");
  const title = renew
    ? t("subscription.renew.titleRenew")
    : t("subscription.renew.titleSubscribe");
  const description = renew
    ? t("subscription.renew.descRenew")
    : t("subscription.renew.descSubscribe");
  const packagesLabel = renew
    ? t("subscription.renew.packagesLabelRenew")
    : t("subscription.renew.packagesLabelSubscribe");
  const packagesAria = renew
    ? t("subscription.renew.packagesAriaRenew")
    : t("subscription.renew.packagesAriaSubscribe");

  const showPackages = resolvedBilling === "checkout";
  const showMethodStep =
    showPackages &&
    checkoutStep === "method" &&
    shouldShowPaymentMethodStep(locale, availableMethods);

  useEffect(() => {
    if (!open || !showPackages) return;
    let cancelled = false;
    void fetch(`/api/payments/methods?locale=${locale}`, { cache: "no-store" })
      .then((res) => res.json())
      .then(
        (data: { methods?: Array<{ id: PaymentMethodId; available: boolean }> }) => {
          if (cancelled) return;
          const ids =
            data.methods?.map((m) => m.id) ??
            paymentMethodsForLocale(locale).filter(() => true);
          const fallback = paymentMethodsForLocale(locale).includes("stripe")
            ? (["stripe"] as PaymentMethodId[])
            : ids;
          const resolved = ids.length > 0 ? ids : fallback;
          setAvailableMethods(resolved);
          setSelectedMethod(resolved[0] ?? "stripe");
        }
      )
      .catch(() => {
        if (!cancelled) {
          setAvailableMethods(["stripe"]);
          setSelectedMethod("stripe");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, locale, showPackages]);

  function handlePrimaryPackageAction() {
    setError(null);
    if (shouldShowPaymentMethodStep(locale, availableMethods)) {
      setCheckoutStep("method");
      return;
    }
    void submitPayment(availableMethods[0] ?? "stripe");
  }

  async function submitPayment(method: PaymentMethodId) {
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
              ? t("subscription.renew.noCustomer")
              : (data.error ?? t("subscription.renew.portalFail"))
          );
          return;
        }
        window.location.href = data.url;
        return;
      }

      if (method === "payos") {
        const res = await fetch("/api/payos/checkout", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packageId: selected }),
        });
        const data = (await res.json()) as {
          url?: string;
          message?: string;
          error?: string;
        };
        if (!res.ok || !data.url) {
          setError(
            data.error === "PAYOS_NOT_CONFIGURED"
              ? t("subscription.paymentMethods.payosNotConfigured")
              : (data.message ??
                  data.error ??
                  (res.status === 401
                    ? t("subscription.renew.unauthorized")
                    : t("subscription.renew.checkoutFail")))
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
      const data = (await res.json()) as {
        url?: string;
        message?: string;
        error?: string;
      };
      if (!res.ok || !data.url) {
        setError(
          data.message ??
            data.error ??
            (res.status === 401
              ? t("subscription.renew.unauthorized")
              : t("subscription.renew.checkoutFail"))
        );
        return;
      }
      window.location.href = data.url;
    } finally {
      setBusy(false);
    }
  }

  const primaryLabel = busy
    ? t("subscription.renew.loading")
    : resolvedBilling === "portal"
      ? t("subscription.renew.portalButton")
      : checkoutStep === "package" &&
          shouldShowPaymentMethodStep(locale, availableMethods)
        ? t("subscription.paymentMethods.continueButton")
        : t("subscription.renew.payButton", {
            price: formatFromRub(pkg.totalRub),
          });

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent>
        <div className="max-h-[min(72vh,560px)] overflow-y-auto overscroll-contain px-6">
          <DrawerHeader className="px-0 pt-0">
            {showMethodStep ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="-ml-2 mb-1 h-8 gap-1 px-2"
                onClick={() => {
                  setError(null);
                  setCheckoutStep("package");
                }}
              >
                <CaretLeft className="h-4 w-4" weight="fill" />
                {t("common.back")}
              </Button>
            ) : null}
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Medal className="h-3.5 w-3.5" weight="fill" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-foreground">
                {showMethodStep
                  ? t("subscription.paymentMethods.title")
                  : eyebrow}
              </span>
            </div>
            <DrawerTitle className="pt-2 text-left">
              {showMethodStep
                ? t("subscription.paymentMethods.title")
                : title}
            </DrawerTitle>
            <DrawerDescription className="text-left">
              {showMethodStep
                ? t("subscription.paymentMethods.subtitle")
                : description}
            </DrawerDescription>
          </DrawerHeader>

          {showMethodStep ? (
            <PaymentMethodStep
              methods={availableMethods}
              selected={selectedMethod}
              onSelect={setSelectedMethod}
            />
          ) : showPackages ? (
            <div className="space-y-2 py-4">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {packagesLabel}
              </p>
              <ul
                className="flex flex-col gap-2"
                role="listbox"
                aria-label={packagesAria}
              >
                {localizedPackages.map((p) => (
                  <li key={p.id}>
                    <PackageOption
                      pkg={p}
                      selected={selected === p.id}
                      onSelect={() => setSelected(p.id)}
                      formatFromRub={formatFromRub}
                      formatMonthlyFromRub={formatMonthlyFromRub}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="py-4 text-sm text-muted-foreground">
              {t("subscription.renew.portalHint")}
            </p>
          )}

          {error ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          ) : null}
        </div>

        <DrawerFooter className="gap-2">
          {showPackages && checkoutStep === "package" ? (
            <div className="flex w-full flex-col gap-1 pb-1 text-center">
              <span className="text-xs text-muted-foreground">
                {t("subscription.renew.payLabel")}
              </span>
              <span className="text-xl font-semibold tabular-nums text-foreground">
                {formatFromRub(pkg.totalRub)}
              </span>
              <span className="text-[11px] text-muted-foreground">
                ~{formatMonthlyFromRub(pkg.totalRub, pkg.months)} ·{" "}
                {t("subscription.renew.savings")}{" "}
                {fullWithoutDiscount - pkg.totalRub > 0
                  ? `${formatFromRub(fullWithoutDiscount)} → ${formatFromRub(pkg.totalRub)}`
                  : t("common.dash")}
              </span>
            </div>
          ) : showMethodStep ? (
            <div className="flex w-full flex-col gap-1 pb-1 text-center">
              <span className="text-xs text-muted-foreground">
                {t("subscription.renew.payLabel")}
              </span>
              <span className="text-xl font-semibold tabular-nums text-foreground">
                {formatFromRub(pkg.totalRub)}
              </span>
            </div>
          ) : null}

          <Button
            size="lg"
            className="w-full"
            type="button"
            disabled={busy}
            onClick={() => {
              if (resolvedBilling === "portal") {
                void submitPayment("stripe");
                return;
              }
              if (checkoutStep === "method") {
                void submitPayment(selectedMethod);
                return;
              }
              handlePrimaryPackageAction();
            }}
          >
            {primaryLabel}
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            type="button"
            onClick={() => handleOpenChange(false)}
          >
            {t("common.close")}
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
  formatFromRub,
  formatMonthlyFromRub,
}: {
  pkg: RenewalPackage;
  selected: boolean;
  onSelect: () => void;
  formatFromRub: (rub: number) => string;
  formatMonthlyFromRub: (totalRub: number, months: number) => string;
}) {
  const fullList = renewalFullPriceWithoutDiscount(pkg.months);
  const eqMonthly = formatMonthlyFromRub(pkg.totalRub, pkg.months);

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
          <span className="tabular-nums">{eqMonthly}</span>
          {pkg.discountPercent > 0 && (
            <>
              {" "}
              <span className="line-through opacity-70">
                {formatMonthlyFromRub(RENEWAL_BASE_MONTHLY_RUB, 1)}
              </span>
            </>
          )}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end justify-center gap-0.5 text-right">
        <span className="text-base font-semibold tabular-nums text-foreground">
          {formatFromRub(pkg.totalRub)}
        </span>
        {pkg.discountPercent > 0 && (
          <span className="text-[11px] text-muted-foreground line-through tabular-nums">
            {formatFromRub(fullList)}
          </span>
        )}
      </div>
    </button>
  );
}
