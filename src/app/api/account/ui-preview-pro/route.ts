import { NextRequest, NextResponse } from "next/server";

import { getSessionPayloadFromRequest } from "@/lib/auth-session";
import { UI_PREVIEW_PRO_COOKIE } from "@/lib/ui-preview-pro-cookie";
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

    const body = (await req.json()) as { enabled?: boolean };
    const enabled = body.enabled === true;

    const res = NextResponse.json({ ok: true as const });

    res.cookies.set({
      name: UI_PREVIEW_PRO_COOKIE,
      value: enabled ? "1" : "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: enabled ? MAX_AGE_SEC : 0,
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
