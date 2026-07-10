import { createHash, createHmac, timingSafeEqual } from "node:crypto";

import type { TelegramWebAppUser } from "@/types/telegram";

/** Данные из callback Telegram Login Widget. */
export type TelegramLoginWidgetPayload = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

const MAX_AUTH_AGE_SEC = 24 * 60 * 60;

/**
 * Проверка подписи Telegram Login Widget.
 * @see https://core.telegram.org/widgets/login#checking-authorization
 */
export function verifyTelegramLoginWidget(
  payload: TelegramLoginWidgetPayload,
  botToken: string
): boolean {
  const { hash, ...rest } = payload;
  if (!hash?.trim()) return false;

  const entries = Object.entries(rest)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => [key, String(value)] as const)
    .sort(([a], [b]) => a.localeCompare(b));

  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join("\n");
  const secretKey = createHash("sha256").update(botToken).digest();
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

export function isLoginWidgetAuthFresh(
  authDate: number,
  nowSec: number = Math.floor(Date.now() / 1000)
): boolean {
  if (!Number.isFinite(authDate)) return false;
  return nowSec - authDate <= MAX_AUTH_AGE_SEC;
}

export function loginWidgetUserToTelegramUser(
  payload: TelegramLoginWidgetPayload
): TelegramWebAppUser {
  return {
    id: payload.id,
    first_name: payload.first_name,
    last_name: payload.last_name,
    username: payload.username,
    photo_url: payload.photo_url,
  };
}
