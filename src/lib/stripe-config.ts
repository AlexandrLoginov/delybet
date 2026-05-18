import {
  stripePriceIdForPackage,
  type SubscriptionPackageId,
} from "@/lib/stripe-price-env";

const ALL_PACKAGES: SubscriptionPackageId[] = ["1m", "3m", "6m", "12m"];

export function isStripeSecretConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function isStripeWebhookConfigured(): boolean {
  return Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim());
}

/** Какие пакеты UI имеют Price ID в env. */
export function stripePackagePriceStatus(): Record<
  SubscriptionPackageId,
  boolean
> {
  return {
    "1m": Boolean(stripePriceIdForPackage("1m")),
    "3m": Boolean(stripePriceIdForPackage("3m")),
    "6m": Boolean(stripePriceIdForPackage("6m")),
    "12m": Boolean(stripePriceIdForPackage("12m")),
  };
}

/** Можно открыть Checkout хотя бы для одного пакета. */
export function isStripeCheckoutReady(): boolean {
  if (!isStripeSecretConfigured()) return false;
  return ALL_PACKAGES.some((id) => stripePriceIdForPackage(id));
}

/** Секрет, вебхук и все четыре Price ID — готово к продакшену. */
export function isStripeProductionReady(): boolean {
  if (!isStripeSecretConfigured() || !isStripeWebhookConfigured()) {
    return false;
  }
  return ALL_PACKAGES.every((id) => stripePriceIdForPackage(id));
}
