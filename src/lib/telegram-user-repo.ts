import type { TelegramWebAppUser } from "@/types/telegram";

import { prisma } from "./prisma";

/** Создаём или обновляем пользователя по Telegram ID. Email синтетический — для уникального ключа User. */
export async function upsertUserFromTelegram(
  telegram: TelegramWebAppUser
): Promise<{ id: string }> {
  const telegramId = String(telegram.id);
  const email = `tg_${telegramId}@users.delybet.internal`;
  const telegramUsername = telegram.username?.trim().toLowerCase() || null;

  const name =
    [telegram.first_name, telegram.last_name]
      .filter(Boolean)
      .join(" ")
      .trim() || telegram.first_name;

  const user = await prisma.user.upsert({
    where: { telegramId },
    create: {
      email,
      name,
      telegramId,
      telegramUsername,
    },
    update: {
      name,
      telegramUsername,
    },
    select: { id: true },
  });

  return user;
}
