import { NextRequest, NextResponse } from "next/server";

import {
  SESSION_COOKIE,
  sessionCookieMaxAgeSec,
  signSession,
} from "@/lib/auth-session";
import { upsertUserFromTelegram } from "@/lib/telegram-user-repo";
import {
  isLoginWidgetAuthFresh,
  loginWidgetUserToTelegramUser,
  type TelegramLoginWidgetPayload,
  verifyTelegramLoginWidget,
} from "@/lib/telegram/verify-login-widget";

export const dynamic = "force-dynamic";

function parsePayload(body: unknown): TelegramLoginWidgetPayload | null {
  if (!body || typeof body !== "object") return null;
  const row = body as Record<string, unknown>;
  const id = typeof row.id === "number" ? row.id : Number(row.id);
  const first_name =
    typeof row.first_name === "string" ? row.first_name.trim() : "";
  const auth_date =
    typeof row.auth_date === "number" ? row.auth_date : Number(row.auth_date);
  const hash = typeof row.hash === "string" ? row.hash.trim() : "";

  if (!Number.isFinite(id) || id <= 0 || !first_name || !hash) return null;
  if (!Number.isFinite(auth_date)) return null;

  return {
    id,
    first_name,
    last_name:
      typeof row.last_name === "string" ? row.last_name.trim() : undefined,
    username:
      typeof row.username === "string" ? row.username.trim() : undefined,
    photo_url:
      typeof row.photo_url === "string" ? row.photo_url.trim() : undefined,
    auth_date,
    hash,
  };
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.SESSION_SECRET?.trim()) {
      return NextResponse.json(
        { error: "SESSION_SECRET is not configured" },
        { status: 503 }
      );
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
    if (!botToken) {
      return NextResponse.json(
        { error: "TELEGRAM_BOT_TOKEN is not set" },
        { status: 503 }
      );
    }

    const payload = parsePayload(await req.json());
    if (!payload) {
      return NextResponse.json({ error: "invalid payload" }, { status: 400 });
    }

    if (!isLoginWidgetAuthFresh(payload.auth_date)) {
      return NextResponse.json({ error: "auth expired" }, { status: 401 });
    }

    if (!verifyTelegramLoginWidget(payload, botToken)) {
      return NextResponse.json({ error: "invalid hash" }, { status: 401 });
    }

    const telegramUser = loginWidgetUserToTelegramUser(payload);
    const user = await upsertUserFromTelegram(telegramUser);
    const token = signSession(user.id, telegramUser.username);

    if (!token) {
      return NextResponse.json(
        { error: "could not create session" },
        { status: 500 }
      );
    }

    const res = NextResponse.json({
      ok: true,
      userId: user.id,
      user: telegramUser,
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
    return NextResponse.json({ error: "login failed" }, { status: 500 });
  }
}
