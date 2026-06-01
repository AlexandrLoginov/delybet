import { NextRequest, NextResponse } from "next/server";

import { getPayOS } from "@/lib/payos-client";
import { isPayosConfigured } from "@/lib/payos-config";
import { loadPayosPendingOrder } from "@/lib/payos-order-cache";
import { grantProFromPackage } from "@/lib/subscription-grant";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isPayosConfigured()) {
    return NextResponse.json({ error: "NOT_CONFIGURED" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const payos = getPayOS();
    const verified = await payos.webhooks.verify(body);

    if (verified.code !== "00") {
      return NextResponse.json({ received: true, skipped: true });
    }

    const orderCode = verified.orderCode;
    if (!orderCode) {
      return NextResponse.json({ received: true, skipped: true });
    }

    const pending = await loadPayosPendingOrder(orderCode);
    if (!pending) {
      return NextResponse.json({ received: true, missing: true });
    }

    await grantProFromPackage(pending.userId, pending.packageId);

    return NextResponse.json({ received: true, ok: true });
  } catch {
    return NextResponse.json({ error: "WEBHOOK_INVALID" }, { status: 400 });
  }
}
