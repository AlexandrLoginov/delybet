/** Соответствие пакетов UI (`renewal-packages`) и Price ID в Stripe Dashboard. */

const PACKAGE_IDS = ["1m", "3m", "6m", "12m"] as const;
export type SubscriptionPackageId = (typeof PACKAGE_IDS)[number];

export function isSubscriptionPackageId(
  raw: unknown
): raw is SubscriptionPackageId {
  return typeof raw === "string" && PACKAGE_IDS.includes(raw as SubscriptionPackageId);
}

export function stripePriceIdForPackage(
  pkg: SubscriptionPackageId
): string | null {
  const map: Record<SubscriptionPackageId, string | undefined> = {
    "1m": process.env.STRIPE_PRICE_PRO_1M?.trim(),
    "3m": process.env.STRIPE_PRICE_PRO_3M?.trim(),
    "6m": process.env.STRIPE_PRICE_PRO_6M?.trim(),
    "12m": process.env.STRIPE_PRICE_PRO_12M?.trim(),
  };

  const v = map[pkg];
  return v && v.startsWith("price_") ? v : null;
}
