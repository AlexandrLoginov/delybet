import { NextRequest, NextResponse } from "next/server";

import { getSessionPayloadFromRequest } from "@/lib/auth-session";
import { UI_PREVIEW_PRO_COOKIE } from "@/lib/ui-preview-pro-cookie";
import { isAdminRequest } from "@/lib/telegram/is-admin-request";

export const dynamic = "force-dynamic";

const MAX_AGE_SEC = 60 * 60 * 24 * 180;

export async function POST(req: NextRequest) {
  try {
    const session = getSessionPayloadFromRequest(req);
    const body = (await req.json()) as { enabled?: boolean; initData?: string };
    const initData = body.initData?.trim();

    if (!isAdminRequest(session?.tg, initData)) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

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
