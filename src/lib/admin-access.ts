import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getSessionPayloadFromRequest } from "@/lib/auth-session";
import { isAdminHttpRequest } from "@/lib/telegram/is-admin-request";
import { parseUserFromInitData } from "@/lib/telegram/validate-init-data";

export function requireAdminSession(req: NextRequest): {
  ok: true;
  adminUserId: string;
} | {
  ok: false;
  response: NextResponse;
} {
  const session = getSessionPayloadFromRequest(req);

  if (!isAdminHttpRequest(req)) {
    if (!session) {
      return {
        ok: false,
        response: NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 }),
      };
    }
    return {
      ok: false,
      response: NextResponse.json({ error: "FORBIDDEN" }, { status: 403 }),
    };
  }

  if (session?.sub) {
    return { ok: true, adminUserId: session.sub };
  }

  const initData = req.headers.get("x-telegram-init-data")?.trim();
  const tgUser = initData ? parseUserFromInitData(initData) : null;
  const adminUserId = tgUser ? `tg_${tgUser.id}` : "admin";

  return { ok: true, adminUserId };
}
