import { convertRubToDisplay } from "@/lib/currency";
import type { RenewalPackageId } from "@/i18n/types";
import { RENEWAL_PACKAGES } from "@/lib/renewal-packages";

/** Сумма к оплате в PayOS (VND, целое). */
export function payosAmountVndForPackage(packageId: RenewalPackageId): number {
  const pkg = RENEWAL_PACKAGES.find((p) => p.id === packageId);
  if (!pkg) return convertRubToDisplay(499, "vi");
  return convertRubToDisplay(pkg.totalRub, "vi");
}

export function generatePayosOrderCode(): number {
  const base = Date.now() % 900_000_000;
  const jitter = Math.floor(Math.random() * 10_000);
  return 100_000_000 + base + jitter;
}
