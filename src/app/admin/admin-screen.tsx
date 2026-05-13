"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import useSWR from "swr";
import {
  CalendarDots,
  LockKey,
  ShieldWarning,
  Sparkle,
  UsersThree,
} from "@phosphor-icons/react";

import { AppPageSkeleton } from "@/components/layout/app-page-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isProfileAdminTelegramUsername } from "@/lib/telegram/profile-admin-eligible";
import { isAdminDesignPreviewUserId } from "@/lib/admin-demo-data";
import { useTelegramSession } from "@/lib/telegram/use-telegram-session";

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  telegramId: string | null;
  createdAt: string;
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
    proUsers: number;
    blockedUsers: number;
    stripeLinkedUsers: number;
  };
  generatedAt: string;
  /** БД без пользователей — только демо-набор */
  designPreview?: boolean;
  /** К ответу из БД добавлены демо-строки в конец списка */
  demoRowsAppended?: boolean;
};

type PaymentRow = {
  id: string;
  createdAt: string;
  amountRub: number;
  status: string;
  source: "stripe" | "demo";
  description: string;
};

type PaymentsResponse = {
  user: {
    id: string;
    name: string | null;
    email: string;
    telegramId: string | null;
  };
  payments: PaymentRow[];
};

async function jsonFetcher<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? "REQUEST_FAILED");
  return data as T;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminScreen() {
  const state = useTelegramSession();
  const allowed =
    state.status === "telegram" &&
    isProfileAdminTelegramUsername(state.user.username);
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
  } = useSWR<AdminUsersResponse>(allowed ? "/api/admin/users?includeDemo=1" : null, jsonFetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 3000,
  });

  const users = usersData?.users ?? [];
  const designPreview = usersData?.designPreview === true;
  const demoRowsAppended = usersData?.demoRowsAppended === true;
  const q = query.trim().toLowerCase();
  const filteredUsers = !q
    ? users
    : users.filter((u) => {
        const fields = [
          u.name ?? "",
          u.email,
          u.telegramId ?? "",
          u.id,
          u.subscription?.status ?? "",
          u.subscription?.plan ?? "",
        ];
        return fields.some((f) => f.toLowerCase().includes(q));
      });

  const effectiveSelectedId =
    selectedUserId && users.some((u) => u.id === selectedUserId)
      ? selectedUserId
      : users[0]?.id ?? null;

  const selectedUser =
    users.find((u) => u.id === effectiveSelectedId) ?? null;

  const {
    data: paymentsData,
    isLoading: paymentsLoading,
    mutate: mutatePayments,
  } = useSWR<PaymentsResponse>(
    effectiveSelectedId
      ? `/api/admin/users/${effectiveSelectedId}/payments`
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
        action === "extend_pro"
          ? { action, days: 30 }
          : { action };
      const res = await fetch(`/api/admin/users/${userId}/actions`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "ACTION_FAILED");
      }
      await Promise.all([mutateUsers(), mutatePayments()]);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Не удалось выполнить действие";
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
    <main className="mx-auto max-w-5xl space-y-4 px-4 pb-10 pt-6">
      <h1 className="text-[26px] font-semibold tracking-tight">Админка</h1>
      <p className="text-sm text-muted-foreground">Пользователи, подписки, оплаты и ручные действия.</p>

      {designPreview ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-3 text-sm text-muted-foreground">
            Показаны демо-пользователи и платежи: в базе ещё нет записей. Действия
            «+30d / Блок» отключены. После появления реальных пользователей таблица
            подставит их автоматически.
          </CardContent>
        </Card>
      ) : null}

      {demoRowsAppended && !designPreview ? (
        <Card className="border-border bg-muted/20">
          <CardContent className="p-3 text-sm text-muted-foreground">
            В конец списка добавлены демо-пользователи для проверки вёрстки. Для
            строк с меткой «Демо» действия отключены; реальные записи можно
            редактировать как обычно.
          </CardContent>
        </Card>
      ) : null}

      {usersError ? (
        <Card>
          <CardContent className="p-4 text-sm text-danger">
            Не удалось загрузить данные: {usersError.message}
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<UsersThree className="h-5 w-5" weight="fill" />}
          label="Пользователи"
          value={String(usersData?.stats.totalUsers ?? 0)}
        />
        <StatCard
          icon={<Sparkle className="h-5 w-5" weight="fill" />}
          label="PRO"
          value={String(usersData?.stats.proUsers ?? 0)}
        />
        <StatCard
          icon={<LockKey className="h-5 w-5" weight="fill" />}
          label="Заблокированы"
          value={String(usersData?.stats.blockedUsers ?? 0)}
        />
        <StatCard
          icon={<CalendarDots className="h-5 w-5" weight="fill" />}
          label="Связаны со Stripe"
          value={String(usersData?.stats.stripeLinkedUsers ?? 0)}
        />
      </section>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск: имя, telegramId, email, статус..."
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => void mutateUsers()}
              disabled={usersLoading}
            >
              Обновить
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Пользователь</th>
                  <th className="px-3 py-2 text-left font-medium">Telegram ID</th>
                  <th className="px-3 py-2 text-left font-medium">План</th>
                  <th className="px-3 py-2 text-left font-medium">Статус</th>
                  <th className="px-3 py-2 text-left font-medium">До</th>
                  <th className="px-3 py-2 text-left font-medium">Stripe</th>
                  <th className="px-3 py-2 text-left font-medium">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className={
                      effectiveSelectedId === u.id
                        ? "bg-muted/30"
                        : "hover:bg-muted/20"
                    }
                  >
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => setSelectedUserId(u.id)}
                        className="text-left"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{u.name ?? "Без имени"}</span>
                          {isAdminDesignPreviewUserId(u.id) ? (
                            <Badge variant="muted" className="text-[10px]">
                              Демо
                            </Badge>
                          ) : null}
                        </div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </button>
                    </td>
                    <td className="px-3 py-2">{u.telegramId ?? "—"}</td>
                    <td className="px-3 py-2">
                      <Badge variant={u.subscription?.plan === "PRO" ? "success" : "muted"}>
                        {u.subscription?.plan ?? "FREE"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <Badge
                        variant={
                          u.subscription?.status === "blocked"
                            ? "destructive"
                            : u.subscription?.status === "active"
                              ? "success"
                              : "muted"
                        }
                      >
                        {u.subscription?.status ?? "no_subscription"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">{formatDate(u.subscription?.currentPeriodEnd ?? null)}</td>
                    <td className="px-3 py-2">
                      {u.subscription?.stripeCustomerId ? "connected" : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => void performAction(u.id, "extend_pro")}
                          disabled={
                            busyAction !== null ||
                            designPreview ||
                            isAdminDesignPreviewUserId(u.id)
                          }
                        >
                          +30d
                        </Button>
                        {u.subscription?.status === "blocked" ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void performAction(u.id, "unblock")}
                            disabled={
                              busyAction !== null ||
                              designPreview ||
                              isAdminDesignPreviewUserId(u.id)
                            }
                          >
                            Разблок
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void performAction(u.id, "block")}
                            disabled={
                              busyAction !== null ||
                              designPreview ||
                              isAdminDesignPreviewUserId(u.id)
                            }
                          >
                            Блок
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!usersLoading && filteredUsers.length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-center text-muted-foreground" colSpan={7}>
                      Пользователи не найдены.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              История оплат
            </h2>
            {selectedUser ? (
              <div className="text-xs text-muted-foreground">
                {selectedUser.name ?? selectedUser.email}
              </div>
            ) : null}
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Дата</th>
                  <th className="px-3 py-2 text-left font-medium">Сумма</th>
                  <th className="px-3 py-2 text-left font-medium">Статус</th>
                  <th className="px-3 py-2 text-left font-medium">Источник</th>
                  <th className="px-3 py-2 text-left font-medium">Описание</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paymentsData?.payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-3 py-2">{formatDate(p.createdAt)}</td>
                    <td className="px-3 py-2 tabular-nums">{p.amountRub} ₽</td>
                    <td className="px-3 py-2">{p.status}</td>
                    <td className="px-3 py-2">
                      <Badge variant={p.source === "stripe" ? "success" : "muted"}>
                        {p.source}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">{p.description}</td>
                  </tr>
                ))}
                {!paymentsLoading && (paymentsData?.payments.length ?? 0) === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-center text-muted-foreground" colSpan={5}>
                      Нет платежей для выбранного пользователя.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground">
            Если Stripe history недоступна, подставляется временный demo history для проверки UI.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-foreground">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="text-lg font-semibold tabular-nums">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
