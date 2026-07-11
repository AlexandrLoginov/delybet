import { NextRequest, NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin-access";
import {
  resolveAdminUserRole,
  resolveAdminUserStatusKind,
} from "@/lib/admin-user-status";
import {
  classifyDatabaseError,
  isDatabaseUrlConfigured,
} from "@/lib/database-config";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function buildAdminStats(
  rows: {
    role: string;
    statusKind: string;
    subscription: {
      plan: string;
      status: string;
      stripeCustomerId: string | null;
    } | null;
  }[]
) {
  return {
    totalUsers: rows.length,
    adminUsers: rows.filter((u) => u.role === "admin").length,
    proUsers: rows.filter((u) => u.statusKind === "pro").length,
    freeUsers: rows.filter((u) => u.statusKind === "free").length,
    blockedUsers: rows.filter((u) => u.statusKind === "blocked").length,
    stripeLinkedUsers: rows.filter((u) =>
      Boolean(u.subscription?.stripeCustomerId)
    ).length,
  };
}

export async function GET(req: NextRequest) {
  try {
    const guard = requireAdminSession(req);
    if (!guard.ok) return guard.response;

    if (!isDatabaseUrlConfigured()) {
      return NextResponse.json(
        { error: "DATABASE_URL_MISSING" },
        { status: 503 }
      );
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        telegramId: true,
        telegramUsername: true,
        createdAt: true,
        subscription: {
          select: {
            plan: true,
            status: true,
            currentPeriodEnd: true,
            stripeCustomerId: true,
            stripeSubscriptionId: true,
            updatedAt: true,
          },
        },
      },
    });

    const result = users.map((u) => {
      const role = resolveAdminUserRole(u.telegramUsername);
      const statusKind = resolveAdminUserStatusKind({
        telegramUsername: u.telegramUsername,
        plan: u.subscription?.plan,
        status: u.subscription?.status,
        currentPeriodEnd: u.subscription?.currentPeriodEnd,
      });

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        telegramId: u.telegramId,
        telegramUsername: u.telegramUsername,
        createdAt: u.createdAt.toISOString(),
        role,
        statusKind,
        subscription: u.subscription
          ? {
              plan: u.subscription.plan,
              status: u.subscription.status,
              currentPeriodEnd:
                u.subscription.currentPeriodEnd?.toISOString() ?? null,
              stripeCustomerId: u.subscription.stripeCustomerId,
              stripeSubscriptionId: u.subscription.stripeSubscriptionId,
              updatedAt: u.subscription.updatedAt.toISOString(),
              isBlocked: u.subscription.status === "blocked",
            }
          : null,
      };
    });

    return NextResponse.json({
      users: result,
      stats: buildAdminStats(result),
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    const code = classifyDatabaseError(e);
    return NextResponse.json({ error: code }, { status: 503 });
  }
}
