"use client";

import Link from "next/link";
import { ShieldWarning } from "@phosphor-icons/react";

import { AppPageSkeleton } from "@/components/layout/app-page-skeleton";
import { Button } from "@/components/ui/button";
import { isProfileAdminTelegramUsername } from "@/lib/telegram/profile-admin-eligible";
import { useTelegramSession } from "@/lib/telegram/use-telegram-session";

export function AdminScreen() {
  const state = useTelegramSession();

  if (state.status === "loading") {
    return <AppPageSkeleton variant="profile" />;
  }

  const allowed =
    state.status === "telegram" &&
    isProfileAdminTelegramUsername(state.user.username);

  if (!allowed) {
    return (
      <main className="mx-auto max-w-2xl space-y-4 px-4 pb-10 pt-8 text-center">
        <ShieldWarning
          className="mx-auto h-10 w-10 text-muted-foreground"
          weight="duotone"
          aria-hidden
        />
        <h1 className="text-lg font-semibold">Нет доступа</h1>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          Раздел только для авторизованного служебного аккаунта в Telegram.
        </p>
        <Button asChild variant="outline">
          <Link href="/profile">В профиль</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 pb-10 pt-6">
      <h1 className="text-[26px] font-semibold tracking-tight">Админка</h1>
      <p className="text-sm text-muted-foreground">
        Внутренние инструменты — наполни этот экран при необходимости.
      </p>
    </main>
  );
}
