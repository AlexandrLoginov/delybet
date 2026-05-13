import { NextRequest, NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin-access";
import {
  getAdminDesignPreviewPayments,
  getAdminDesignPreviewUserById,
  isAdminDesignPreviewUserId,
} from "@/lib/admin-demo-data";
import { prisma } from "@/lib/prisma";
import { PRO_SUBSCRIPTION_DEMO } from "@/lib/pro-subscription-demo";
import { getStripe } from "@/lib/stripe-client";

export const dynamic = "force-dynamic";

type PaymentRow = {
  id: string;
  createdAt: string;
  amountRub: number;
  status: string;
  source: "stripe" | "demo";
  description: string;
};

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const guard = requireAdminSession(req);
    if (!guard.ok) return guard.response;

    const userId = params.userId;
    if (!userId) {
      return NextResponse.json({ error: "INVALID_USER_ID" }, { status: 400 });
    }

    if (isAdminDesignPreviewUserId(userId)) {
      const previewUser = getAdminDesignPreviewUserById(userId);
      if (!previewUser) {
        return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
      }
      return NextResponse.json({
        user: previewUser,
        payments: getAdminDesignPreviewPayments(userId),
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        telegramId: true,
        subscription: {
          select: {
            stripeCustomerId: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    }

    const customerId = user.subscription?.stripeCustomerId?.trim();
    let rows: PaymentRow[] = [];

    if (customerId) {
      try {
        const stripe = getStripe();
        const invoices = await stripe.invoices.list({
          customer: customerId,
          limit: 20,
        });

        rows = invoices.data.map((inv) => ({
          id: inv.id,
          createdAt: new Date(inv.created * 1000).toISOString(),
          amountRub: Math.round((inv.amount_paid ?? 0) / 100),
          status: inv.status ?? "unknown",
          source: "stripe" as const,
          description: inv.description || inv.lines.data[0]?.description || "Stripe invoice",
        }));
      } catch {
        rows = [];
      }
    }

    if (rows.length === 0) {
      rows = PRO_SUBSCRIPTION_DEMO.history.map((row) => ({
        id: `demo-${row.id}`,
        createdAt: row.periodStartISO,
        amountRub: row.amountRub,
        status: row.status,
        source: "demo" as const,
        description: row.periodLabel,
      }));
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        telegramId: user.telegramId,
      },
      payments: rows,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "ADMIN_PAYMENTS_FAILED";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
