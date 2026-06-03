"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useAppLocale } from "@/hooks/use-app-locale";
import { useAdminDataSource } from "@/hooks/use-admin-data-source";
import { useDevProPreview } from "@/hooks/use-dev-pro-preview";
import type { AdminDataSourceMode } from "@/lib/admin-data-source";
import {
  getAdminDataSourceSnapshot,
  setAdminDataSource,
} from "@/lib/admin-data-source-store";
import {
  getDevProPreviewSnapshot,
  setDevProPreview,
} from "@/lib/dev-pro-preview-store";
import { useTelegramInitData } from "@/hooks/use-is-profile-admin";
import { useTelegramSession } from "@/lib/telegram/use-telegram-session";
import { isProfileAdminTelegramUser } from "@/lib/telegram/profile-admin-eligible";
import { cn } from "@/lib/utils";

function syncPreviewCookie(enabled: boolean, initData: string | null): void {
  void fetch("/api/account/ui-preview-pro", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled, initData: initData ?? undefined }),
  });
}

function syncDataSourceCookie(
  mode: AdminDataSourceMode,
  initData: string | null
): void {
  void fetch("/api/account/ui-preview-data-source", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode, initData: initData ?? undefined }),
  });
}

/** Показывает переключатель Free/Pro только для разрешённого Telegram @username. */
export function ProfileTariffPreviewGate({
  children,
}: {
  children: ReactNode;
}) {
  const state = useTelegramSession();
  if (state.status !== "telegram" || !isProfileAdminTelegramUser(state.user)) {
    return null;
  }
  return <>{children}</>;
}

/** Подписи Free / Pro и переключатель предпросмотра интерфейса. */
export function ProfileTariffPreviewControl() {
  const { t } = useAppLocale();
  const initData = useTelegramInitData();
  const previewPro = useDevProPreview();

  return (
    <div
      className="flex shrink-0 items-center gap-2"
      data-telegram-gate-exempt
    >
      <span
        className={cn(
          "text-[11px] tabular-nums",
          !previewPro ? "font-semibold text-foreground" : "text-muted-foreground"
        )}
      >
        {t("common.free")}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={previewPro}
        aria-label={t("profile.devPreview")}
        onClick={() => {
          const next = !previewPro;
          setDevProPreview(next);
          syncPreviewCookie(next, initData);
        }}
        className={cn(
          "inline-flex h-6 w-10 shrink-0 items-center rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          previewPro ? "bg-success" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "h-5 w-5 rounded-full bg-white shadow-none transition-transform dark:shadow",
            previewPro ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
      <span
        className={cn(
          "text-[11px] tabular-nums",
          previewPro ? "font-semibold text-foreground" : "text-muted-foreground"
        )}
      >
        {t("common.pro")}
      </span>
    </div>
  );
}

/** Переключатель Mock / Api — только для админов. */
export function ProfileDataSourcePreviewControl() {
  const { t } = useAppLocale();
  const router = useRouter();
  const initData = useTelegramInitData();
  const mode = useAdminDataSource();
  const useApi = mode === "api";

  return (
    <div
      className="flex shrink-0 items-center gap-2"
      data-telegram-gate-exempt
    >
      <span
        className={cn(
          "text-[11px] tabular-nums",
          !useApi ? "font-semibold text-foreground" : "text-muted-foreground"
        )}
      >
        {t("profile.dataSourceMock")}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={useApi}
        aria-label={t("profile.dataSourcePreview")}
        onClick={() => {
          const next: AdminDataSourceMode = useApi ? "mock" : "api";
          setAdminDataSource(next);
          syncDataSourceCookie(next, initData);
          router.refresh();
        }}
        className={cn(
          "inline-flex h-6 w-10 shrink-0 items-center rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          useApi ? "bg-success" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "h-5 w-5 rounded-full bg-white shadow-none transition-transform dark:shadow",
            useApi ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
      <span
        className={cn(
          "text-[11px] tabular-nums",
          useApi ? "font-semibold text-foreground" : "text-muted-foreground"
        )}
      >
        {t("profile.dataSourceApi")}
      </span>
    </div>
  );
}

/** Free/Pro и Mock/Api в одной строке (только админ). */
export function ProfileAdminPreviewBar() {
  const initData = useTelegramInitData();

  useEffect(() => {
    syncDataSourceCookie(getAdminDataSourceSnapshot(), initData);
    syncPreviewCookie(getDevProPreviewSnapshot(), initData);
  }, [initData]);

  return (
    <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 px-1 pt-1">
      <ProfileTariffPreviewControl />
      <ProfileDataSourcePreviewControl />
    </div>
  );
}
