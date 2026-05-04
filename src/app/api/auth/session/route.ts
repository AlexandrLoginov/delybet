import { NextRequest, NextResponse } from "next/server";

import {
  SESSION_COOKIE,
  sessionCookieMaxAgeSec,
  signSession,
} from "@/lib/auth-session";
import { upsertUserFromTelegram } from "@/lib/telegram-user-repo";
import {
  isInitDataAuthFresh,
  parseAuthDateFromInitData,
  parseUserFromInitData,
  verifyTelegramWebAppInitData,
} from "@/lib/telegram/validate-init-data";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.SESSION_SECRET?.trim()) {
      return NextResponse.json(
        { error: "SESSION_SECRET is not configured" },
        { status: 503 }
      );
    }

    const body = (await req.json()) as { initData?: string };
    const initData = body.initData?.trim();
    if (!initData) {
      return NextResponse.json({ error: "initData required" }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
    if (!botToken) {
      return NextResponse.json(
        { error: "TELEGRAM_BOT_TOKEN is not set" },
        { status: 503 }
      );
    }

    if (!isInitDataAuthFresh(initData)) {
      return NextResponse.json({ error: "initData expired" }, { status: 401 });
    }

    if (!verifyTelegramWebAppInitData(initData, botToken)) {
      return NextResponse.json({ error: "invalid initData" }, { status: 401 });
    }

    const telegramUser = parseUserFromInitData(initData);
    if (!telegramUser) {
      return NextResponse.json({ error: "user missing" }, { status: 400 });
    }

    const user = await upsertUserFromTelegram(telegramUser);
    const token = signSession(user.id);

    if (!token) {
      return NextResponse.json(
        { error: "could not create session" },
        { status: 500 }
      );
    }

    const res = NextResponse.json({
      ok: true,
      userId: user.id,
      authDate: parseAuthDateFromInitData(initData) ?? undefined,
    });

    const maxAge = sessionCookieMaxAgeSec();
    res.cookies.set({
      name: SESSION_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
