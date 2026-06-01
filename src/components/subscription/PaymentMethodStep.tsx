"use client";

import { CreditCard, QrCode } from "@phosphor-icons/react";

import { useAppLocale } from "@/hooks/use-app-locale";
import type { PaymentMethodId } from "@/lib/payment-methods";
import { cn } from "@/lib/utils";

interface PaymentMethodStepProps {
  methods: PaymentMethodId[];
  selected: PaymentMethodId;
  onSelect: (id: PaymentMethodId) => void;
}

export function PaymentMethodStep({
  methods,
  selected,
  onSelect,
}: PaymentMethodStepProps) {
  const { t } = useAppLocale();

  return (
    <div className="space-y-3 py-4">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {t("subscription.paymentMethods.title")}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("subscription.paymentMethods.subtitle")}
        </p>
      </div>
      <ul className="flex flex-col gap-2" role="listbox">
        {methods.map((id) => (
          <li key={id}>
            <MethodCard
              id={id}
              selected={selected === id}
              onSelect={() => onSelect(id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function MethodCard({
  id,
  selected,
  onSelect,
}: {
  id: PaymentMethodId;
  selected: boolean;
  onSelect: () => void;
}) {
  const { t } = useAppLocale();
  const title = t(`subscription.paymentMethods.${id}.title`);
  const description = t(`subscription.paymentMethods.${id}.description`);
  const chargeNote = t(`subscription.paymentMethods.${id}.chargeNote`);
  const Icon = id === "payos" ? QrCode : CreditCard;

  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors",
        selected
          ? "border-primary bg-primary/[0.08] ring-1 ring-primary/35"
          : "border-border bg-background hover:bg-muted/40"
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          selected
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-5 w-5" weight="fill" />
      </span>
      <span className="min-w-0 flex-1 space-y-0.5">
        <span className="block font-semibold text-foreground">{title}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
        <span className="block text-[11px] leading-snug text-muted-foreground/90">
          {chargeNote}
        </span>
      </span>
    </button>
  );
}
