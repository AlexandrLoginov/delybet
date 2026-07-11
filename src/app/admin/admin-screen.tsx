"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import useSWR from "swr";
import {
  CaretLeft,
  LockKey,
  ShieldCheck,
  ShieldWarning,
  Sparkle,
  User,
  UsersThree,
} from "@phosphor-icons/react";

import { AppPageSkeleton } from "@/components/layout/app-page-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppLocale } from "@/hooks/use-app-locale";
import { localeIntlTag } from "@/i18n";
import {
  useIsProfileAdmin,
  useTelegramInitData,
} from "@/hooks/use-is-profile-admin";
import { adminFetchInit } from "@/lib/admin-fetch";
import type { AdminUserStatusKind } from "@/lib/admin-user-status";
import { useTelegramSession } from "@/lib/telegram/use-telegram-session";
import { cn } from "@/lib/utils";

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  telegramId: string | null;
  telegramUsername: string | null;
  createdAt: string;
  role: "admin" | "user";
  statusKind: AdminUserStatusKind;
  subscription: {
    plan: string;
    status: string;
    currentPeriodEnd: string | null;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    updatedAt: string;
    isBlocked: boolean;
  } | null;
};

type AdminUsersResponse = {
  users: AdminUser[];
  stats: {
    totalUsers: number;
    adminUsers: number;
    proUsers: number;
    freeUsers: number;
    blockedUsers: number;
    stripeLinkedUsers: number;
  };
  generatedAt: string;
};

type PaymentRow = {
  id: string;
  createdAt: string;
  amountRub: number;
  status: string;
  source: "stripe";
  description: string;
};

type PaymentsResponse = {
  user: {
    id: string;
    name: string | null;
    email: string;
    telegramId: string | null;
    telegramUsername: string | null;
  };
  payments: PaymentRow[];
};

async function jsonFetcher<T>(
  [url, initData]: readonly [string, string | null]
): Promise<T> {
  const res = await fetch(url, adminFetchInit(initData));
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? "REQUEST_FAILED");
  return data as T;
}

function formatDate(value: string | null, locale: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAdminLoadError(
  error: Error,
  t: (key: string, params?: Record<string, string>) => string
): string {
  switch (error.message) {
    case "DATABASE_URL_MISSING":
      return t("admin.databaseUrlMissing");
    case "DATABASE_SCHEMA_MISSING":
      return t("admin.databaseSchemaMissing");
    case "DATABASE_CONNECTION_FAILED":
      return t("admin.databaseConnectionFailed");
    case "DATABASE_UNAVAILABLE":
      return t("admin.databaseUnavailable");
    case "UNAUTHORIZED":
      return t("admin.loadError", { error: "UNAUTHORIZED" });
    default:
      return t("admin.loadError", { error: error.message });
  }
}

function statusLabel(
  kind: AdminUserStatusKind,
  t: (key: string) => string
): string {
  switch (kind) {
    case "admin":
      return t("admin.statusAdmin");
    case "pro":
      return t("admin.statusPro");
    case "blocked":
      return t("admin.statusBlocked");
    default:
      return t("admin.statusFree");
  }
}

function statusBadgeVariant(
  kind: AdminUserStatusKind
): "default" | "success" | "destructive" | "muted" {
  switch (kind) {
    case "admin":
      return "default";
    case "pro":
      return "success";
    case "blocked":
      return "destructive";
    default:
      return "muted";
  }
}

export function AdminScreen() {
  const { locale, t } = useAppLocale();
  const state = useTelegramSession();
  const allowed = useIsProfileAdmin();
  const initData = useTelegramInitData();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [busyAction, setBusyAction] = useState<
    "block" | "unblock" | "extend_pro" | null
  >(null);

  const {
    data: usersData,
    error: usersError,
    isLoading: usersLoading,
    mutate: mutateUsers,
  } = useSWR<AdminUsersResponse>(
    allowed ? (["/api/admin/users", initData] as const) : null,
    jsonFetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 3000,
    }
  );

  const users = usersData?.users ?? [];
  const q = query.trim().toLowerCase();
  const filteredUsers = !q
    ? users
    : users.filter((u) => {
        const fields = [
          u.name ?? "",
          u.telegramUsername ?? "",
          u.telegramId ?? "",
          u.id,
          u.statusKind,
          u.subscription?.plan ?? "",
        ];
        return fields.some((f) => f.toLowerCase().includes(q));
      });

  const effectiveSelectedId =
    selectedUserId && users.some((u) => u.id === selectedUserId)
      ? selectedUserId
      : null;

  const selectedUser =
    users.find((u) => u.id === effectiveSelectedId) ?? null;

  const {
    data: paymentsData,
    isLoading: paymentsLoading,
    mutate: mutatePayments,
  } = useSWR<PaymentsResponse>(
    effectiveSelectedId
      ? ([`/api/admin/users/${effectiveSelectedId}/payments`, initData] as const)
      : null,
    jsonFetcher,
    { revalidateOnFocus: false }
  );

  async function performAction(
    userId: string,
    action: "block" | "unblock" | "extend_pro"
  ) {
    try {
      setBusyAction(action);
      const body =
        action === "extend_pro" ? { action, days: 30 } : { action };
      const fetchInit = adminFetchInit(initData);
      const res = await fetch(`/api/admin/users/${userId}/actions`, {
        method: "POST",
        credentials: fetchInit.credentials,
        headers: {
          ...fetchInit.headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "ACTION_FAILED");
      }
      await Promise.all([mutateUsers(), mutatePayments()]);
    } catch (e) {
      const message =
        e instanceof Error && e.message !== "ACTION_FAILED"
          ? e.message
          : t("admin.actionFailed");
      window.alert(message);
    } finally {
      setBusyAction(null);
    }
  }

  if (state.status === "loading") {
    return <AppPageSkeleton variant="profile" />;
  }

  if (!allowed) {
    return (
      <main className="mx-auto max-w-2xl space-y-4 px-4 pb-10 pt-8 text-center">
        <ShieldWarning
          className="mx-auto h-10 w-10 text-muted-foreground"
          weight="duotone"
          aria-hidden
        />
        <h1 className="text-lg font-semibold">{t("admin.noAccessTitle")}</h1>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          {t("admin.noAccessDesc")}
        </p>
        <Button asChild variant="outline">
          <Link href="/profile">{t("admin.toProfile")}</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 pb-10 pt-5">
      <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1.5">
        <Link href="/profile">
          <CaretLeft className="h-4 w-4 shrink-0" weight="fill" />
          {t("admin.back")}
        </Link>
      </Button>

      {usersError ? (
        <Card>
          <CardContent className="p-4 text-sm text-destructive">
            {formatAdminLoadError(usersError, t)}
          </CardContent>
        </Card>
      ) : null}

      <section className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<UsersThree className="h-5 w-5" weight="fill" />}
          label={t("admin.users")}
          value={String(usersData?.stats.totalUsers ?? 0)}
        />
        <StatCard
          icon={<ShieldCheck className="h-5 w-5" weight="fill" />}
          label={t("admin.admins")}
          value={String(usersData?.stats.adminUsers ?? 0)}
        />
        <StatCard
          icon={<Sparkle className="h-5 w-5" weight="fill" />}
          label={t("admin.pro")}
          value={String(usersData?.stats.proUsers ?? 0)}
        />
        <StatCard
          icon={<User className="h-5 w-5" weight="fill" />}
          label={t("admin.free")}
          value={String(usersData?.stats.freeUsers ?? 0)}
        />
        <StatCard
          icon={<LockKey className="h-5 w-5" weight="fill" />}
          label={t("admin.blocked")}
          value={String(usersData?.stats.blockedUsers ?? 0)}
          className="col-span-2"
        />
      </section>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("admin.searchPlaceholder")}
              className="h-10 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => void mutateUsers()}
              disabled={usersLoading}
              className="shrink-0"
            >
              {t("admin.refresh")}
            </Button>
          </div>

          <div className="space-y-2">
            {filteredUsers.map((u) => {
              const selected = effectiveSelectedId === u.id;
              const periodEnd = u.subscription?.currentPeriodEnd ?? null;
              return (
                <div
                  key={u.id}
                  className={cn(
                    "rounded-xl border border-border bg-card p-3 transition-colors",
                    selected && "border-primary/40 bg-muted/30"
                  )}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedUserId((prev) =>
                        prev === u.id ? null : u.id
                      )
                    }
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <div className="truncate font-medium">
                          {u.name ?? t("admin.noName")}
                        </div>
                        {u.telegramUsername ? (
                          <div className="truncate text-xs text-muted-foreground">
                            @{u.telegramUsername}
                          </div>
                        ) : null}
                        <div className="truncate text-xs text-muted-foreground">
                          {t("admin.telegramId")}: {u.telegramId ?? "—"}
                        </div>
                      </div>
                      <Badge
                        variant={statusBadgeVariant(u.statusKind)}
                        className="shrink-0 normal-case tracking-normal"
                      >
                        {statusLabel(u.statusKind, t)}
                      </Badge>
                    </div>
                    {u.statusKind === "pro" && periodEnd ? (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {t("admin.periodUntil", {
                          date: formatDate(periodEnd, localeIntlTag(locale)),
                        })}
                      </div>
                    ) : null}
                  </button>

                  {u.statusKind !== "admin" ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void performAction(u.id, "extend_pro")}
                        disabled={busyAction !== null}
                      >
                        {t("admin.extendPro")}
                      </Button>
                      {u.subscription?.status === "blocked" ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => void performAction(u.id, "unblock")}
                          disabled={busyAction !== null}
                        >
                          {t("admin.unblock")}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => void performAction(u.id, "block")}
                          disabled={busyAction !== null}
                        >
                          {t("admin.block")}
                        </Button>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}

            {!usersLoading && filteredUsers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                {users.length === 0
                  ? t("admin.usersEmpty")
                  : t("admin.usersNotFound")}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {selectedUser ? (
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {t("admin.paymentsTitle")}
              </h2>
              <div className="truncate text-xs text-muted-foreground">
                {selectedUser.name ??
                  (selectedUser.telegramUsername
                    ? `@${selectedUser.telegramUsername}`
                    : selectedUser.telegramId)}
              </div>
            </div>

            <div className="space-y-2">
              {paymentsData?.payments.map((p) => (
                <div
                  key={p.id}
                  className="rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="tabular-nums font-medium">
                      {p.amountRub} ₽
                    </span>
                    <Badge variant="muted" className="normal-case tracking-normal">
                      {p.status}
                    </Badge>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {formatDate(p.createdAt, localeIntlTag(locale))}
                  </div>
                  {p.description ? (
                    <div className="mt-1 truncate text-xs text-muted-foreground">
                      {p.description}
                    </div>
                  ) : null}
                </div>
              ))}
              {!paymentsLoading && (paymentsData?.payments.length ?? 0) === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  {t("admin.paymentsEmpty")}
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  className,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="text-lg font-semibold tabular-nums">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
