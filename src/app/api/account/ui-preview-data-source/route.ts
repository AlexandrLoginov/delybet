import { NextRequest, NextResponse } from "next/server";

import { getSessionPayloadFromRequest } from "@/lib/auth-session";
import { UI_PREVIEW_DATA_SOURCE_COOKIE } from "@/lib/ui-preview-data-source-cookie";
import { isProfileAdminTelegramUsername } from "@/lib/telegram/profile-admin-eligible";

export const dynamic = "force-dynamic";

const MAX_AGE_SEC = 60 * 60 * 24 * 180;

export async function POST(req: NextRequest) {
  try {
    const session = getSessionPayloadFromRequest(req);
    if (!session?.sub) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    if (!isProfileAdminTelegramUsername(session.tg)) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    const body = (await req.json()) as { mode?: string };
    const mode = body.mode === "mock" || body.mode === "api" ? body.mode : null;
    if (!mode) {
      return NextResponse.json({ error: "INVALID_MODE" }, { status: 400 });
    }

    const res = NextResponse.json({ ok: true as const, mode });

    res.cookies.set({
      name: UI_PREVIEW_DATA_SOURCE_COOKIE,
      value: mode,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE_SEC,
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
