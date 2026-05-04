import { createHmac, timingSafeEqual } from "node:crypto";

import type { NextRequest } from "next/server";

export const SESSION_COOKIE = "delybet_session";

const MAX_AGE_SEC = 60 * 60 * 24 * 30;

function sessionSecret(): string | null {
  const s = process.env.SESSION_SECRET?.trim();
  return s && s.length >= 16 ? s : null;
}

export function signSession(userId: string): string | null {
  const secret = sessionSecret();
  if (!secret) return null;
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
  const payload = JSON.stringify({ sub: userId, exp });
  const payloadB64 = Buffer.from(payload, "utf8").toString("base64url");
  const sig = createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");
  return `${payloadB64}.${sig}`;
}

export function verifySession(token: string): string | null {
  const secret = sessionSecret();
  if (!secret) return null;

  const i = token.lastIndexOf(".");
  if (i <= 0) return null;

  const payloadB64 = token.slice(0, i);
  const sig = token.slice(i + 1);

  const expected = createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");

  try {
    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  let data: unknown;
  try {
    data = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (!data || typeof data !== "object") return null;
  const row = data as { sub?: unknown; exp?: unknown };
  if (typeof row.sub !== "string" || typeof row.exp !== "number") return null;
  if (row.exp < Math.floor(Date.now() / 1000)) return null;

  return row.sub;
}

export function getSessionUserIdFromRequest(req: NextRequest): string | null {
  const raw = req.cookies.get(SESSION_COOKIE)?.value;
  return raw ? verifySession(raw) : null;
}

export function sessionCookieMaxAgeSec(): typeof MAX_AGE_SEC {
  return MAX_AGE_SEC;
}
