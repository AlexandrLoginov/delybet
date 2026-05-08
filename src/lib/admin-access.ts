import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getSessionPayloadFromRequest } from "@/lib/auth-session";
import { isProfileAdminTelegramUsername } from "@/lib/telegram/profile-admin-eligible";

export function requireAdminSession(req: NextRequest): {
  ok: true;
  adminUserId: string;
} | {
  ok: false;
  response: NextResponse;
} {
  const session = getSessionPayloadFromRequest(req);
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 }),
    };
  }

  if (!isProfileAdminTelegramUsername(session.tg)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "FORBIDDEN" }, { status: 403 }),
    };
  }

  return { ok: true, adminUserId: session.sub };
}
