import { CacheKeys, getCached, setCached } from "@/lib/cache";
import type { RenewalPackageId } from "@/i18n/types";

export type PayosPendingOrder = {
  userId: string;
  packageId: RenewalPackageId;
};

const TTL_SECONDS = 60 * 60;

export function payosOrderCacheKey(orderCode: number): string {
  return CacheKeys.payosOrder(orderCode);
}

export async function savePayosPendingOrder(
  orderCode: number,
  payload: PayosPendingOrder
): Promise<void> {
  await setCached(payosOrderCacheKey(orderCode), payload, TTL_SECONDS);
}

export async function loadPayosPendingOrder(
  orderCode: number
): Promise<PayosPendingOrder | null> {
  return getCached<PayosPendingOrder>(payosOrderCacheKey(orderCode));
}
