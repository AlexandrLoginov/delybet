import { NextRequest, NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin-access";
import {
  getAdminDesignPreviewStats,
  getAdminDesignPreviewUsers,
} from "@/lib/admin-demo-data";
import {
  classifyDatabaseError,
  isDatabaseUrlConfigured,
} from "@/lib/database-config";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function buildAdminStats(
  rows: {
    subscription: {
      plan: string;
      status: string;
      stripeCustomerId: string | null;
    } | null;
  }[]
) {
  return {
    totalUsers: rows.length,
    proUsers: rows.filter((u) => u.subscription?.plan === "PRO").length,
    blockedUsers: rows.filter((u) => u.subscription?.status === "blocked").length,
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

    const includeDemo =
      req.nextUrl.searchParams.get("includeDemo") === "1" ||
      req.nextUrl.searchParams.get("includeDemo") === "true";

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        telegramId: true,
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

    const result = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      telegramId: u.telegramId,
      createdAt: u.createdAt.toISOString(),
      subscription: u.subscription
        ? {
            plan: u.subscription.plan,
            status: u.subscription.status,
            currentPeriodEnd: u.subscription.currentPeriodEnd?.toISOString() ?? null,
            stripeCustomerId: u.subscription.stripeCustomerId,
            stripeSubscriptionId: u.subscription.stripeSubscriptionId,
            updatedAt: u.subscription.updatedAt.toISOString(),
            isBlocked: u.subscription.status === "blocked",
          }
        : null,
    }));

    if (result.length === 0) {
      const demoUsers = getAdminDesignPreviewUsers();
      return NextResponse.json({
        users: demoUsers,
        stats: getAdminDesignPreviewStats(demoUsers),
        generatedAt: new Date().toISOString(),
        designPreview: true,
      });
    }

    const merged =
      includeDemo ? [...result, ...getAdminDesignPreviewUsers()] : result;

    const stats = buildAdminStats(merged);

    return NextResponse.json({
      users: merged,
      stats,
      generatedAt: new Date().toISOString(),
      ...(includeDemo ? { demoRowsAppended: true as const } : {}),
    });
  } catch (e) {
    const code = classifyDatabaseError(e);
    return NextResponse.json({ error: code }, { status: 503 });
  }
}
