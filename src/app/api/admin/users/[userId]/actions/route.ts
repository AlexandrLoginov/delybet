import { NextRequest, NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin-access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type AdminAction = "block" | "unblock" | "extend_pro";

type AdminActionBody = {
  action?: AdminAction;
  days?: number;
};

function parseDays(raw: unknown): number {
  if (typeof raw !== "number" || !Number.isFinite(raw)) return 30;
  return Math.max(1, Math.min(365, Math.floor(raw)));
}

export async function POST(
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

    const body = (await req.json()) as AdminActionBody;
    const action = body.action;

    if (
      action !== "block" &&
      action !== "unblock" &&
      action !== "extend_pro"
    ) {
      return NextResponse.json({ error: "INVALID_ACTION" }, { status: 400 });
    }

    const existing = await prisma.subscription.findUnique({
      where: { userId },
      select: {
        id: true,
        plan: true,
        status: true,
        currentPeriodEnd: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });

    if (action === "block") {
      const updated = await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          plan: "FREE",
          status: "blocked",
        },
        update: {
          plan: "FREE",
          status: "blocked",
          currentPeriodEnd: null,
        },
        select: {
          plan: true,
          status: true,
          currentPeriodEnd: true,
          stripeCustomerId: true,
          stripeSubscriptionId: true,
          updatedAt: true,
        },
      });

      return NextResponse.json({
        ok: true,
        action,
        subscription: {
          ...updated,
          currentPeriodEnd: updated.currentPeriodEnd?.toISOString() ?? null,
          updatedAt: updated.updatedAt.toISOString(),
        },
      });
    }

    if (action === "unblock") {
      if (!existing) {
        return NextResponse.json({
          ok: true,
          action,
          subscription: null,
        });
      }

      const updated = await prisma.subscription.update({
        where: { userId },
        data: {
          status: "active",
        },
        select: {
          plan: true,
          status: true,
          currentPeriodEnd: true,
          stripeCustomerId: true,
          stripeSubscriptionId: true,
          updatedAt: true,
        },
      });

      return NextResponse.json({
        ok: true,
        action,
        subscription: {
          ...updated,
          currentPeriodEnd: updated.currentPeriodEnd?.toISOString() ?? null,
          updatedAt: updated.updatedAt.toISOString(),
        },
      });
    }

    const days = parseDays(body.days);
    const now = new Date();
    const baseDate =
      existing?.currentPeriodEnd && existing.currentPeriodEnd > now
        ? existing.currentPeriodEnd
        : now;
    const nextPeriodEnd = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);

    const updated = await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        plan: "PRO",
        status: "active",
        currentPeriodEnd: nextPeriodEnd,
      },
      update: {
        plan: "PRO",
        status: "active",
        currentPeriodEnd: nextPeriodEnd,
      },
      select: {
        plan: true,
        status: true,
        currentPeriodEnd: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      action,
      days,
      subscription: {
        ...updated,
        currentPeriodEnd: updated.currentPeriodEnd?.toISOString() ?? null,
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "ADMIN_ACTION_FAILED";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
