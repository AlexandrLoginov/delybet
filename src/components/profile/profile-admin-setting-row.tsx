"use client";

import Link from "next/link";
import { CaretRight, GearFine } from "@phosphor-icons/react/ssr";

import { useAppLocale } from "@/hooks/use-app-locale";
import { isProfileAdminTelegramUsername } from "@/lib/telegram/profile-admin-eligible";
import { useTelegramSession } from "@/lib/telegram/use-telegram-session";

export function ProfileAdminSettingRow() {
  const { t } = useAppLocale();
  const state = useTelegramSession();

  if (
    state.status !== "telegram" ||
    !isProfileAdminTelegramUsername(state.user.username)
  ) {
    return null;
  }

  return (
    <Link
      href="/admin"
      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/40"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
        <GearFine className="h-4 w-4" weight="fill" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{t("profile.admin")}</div>
        <div className="text-[11px] text-muted-foreground">
          {t("profile.adminHint")}
        </div>
      </div>
      <CaretRight
        className="h-4 w-4 shrink-0 text-muted-foreground"
        weight="fill"
      />
    </Link>
  );
}
