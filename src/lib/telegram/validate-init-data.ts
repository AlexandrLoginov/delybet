import { createHmac, timingSafeEqual } from "node:crypto";

import type { TelegramWebAppUser } from "@/types/telegram";

/** Только сервер (Route Handlers) — использует node:crypto. */

const MAX_AUTH_AGE_SEC = 24 * 60 * 60;

/**
 * Проверка подписи initData по спецификации Telegram Web Apps.
 * @see https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function verifyTelegramWebAppInitData(
  initData: string,
  botToken: string
): boolean {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return false;

  const entries = Array.from(params.entries())
    .filter(([k]) => k !== "hash")
    .sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join("\n");

  const secretKey = createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();
  const computed = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  try {
    const a = Buffer.from(computed, "hex");
    const b = Buffer.from(hash, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function parseUserFromInitData(
  initData: string
): TelegramWebAppUser | null {
  const params = new URLSearchParams(initData);
  const raw = params.get("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TelegramWebAppUser;
  } catch {
    return null;
  }
}

export function parseAuthDateFromInitData(initData: string): number | null {
  const params = new URLSearchParams(initData);
  const raw = params.get("auth_date");
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

/**
 * true, если auth_date не старше MAX_AUTH_AGE_SEC.
 */
export function isInitDataAuthFresh(
  initData: string,
  nowSec: number = Math.floor(Date.now() / 1000)
): boolean {
  const auth = parseAuthDateFromInitData(initData);
  if (auth == null) return false;
  return nowSec - auth <= MAX_AUTH_AGE_SEC;
}
