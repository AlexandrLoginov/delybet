/** Демо-данные админки, когда в БД ещё нет пользователей — для проверки вёрстки. */

export const ADMIN_DESIGN_PREVIEW_USER_PREFIX = "demo-admin-";

export type AdminDemoUser = {
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

export type AdminDemoPaymentRow = {
  id: string;
  createdAt: string;
  amountRub: number;
  status: string;
  source: "stripe" | "demo";
  description: string;
};

const iso = (d: string) => new Date(d).toISOString();

const USERS: AdminDemoUser[] = [
  {
    id: `${ADMIN_DESIGN_PREVIEW_USER_PREFIX}1`,
    name: "Алексей Морозов",
    email: "alexey.morozov@example.com",
    telegramId: "1000123456",
    createdAt: iso("2026-01-08T14:22:00+03:00"),
    subscription: {
      plan: "PRO",
      status: "active",
      currentPeriodEnd: iso("2026-06-12T23:59:59+03:00"),
      stripeCustomerId: "cus_demo_7xK2mN",
      stripeSubscriptionId: "sub_demo_9pQr",
      updatedAt: iso("2026-05-10T09:15:00+03:00"),
      isBlocked: false,
    },
  },
  {
    id: `${ADMIN_DESIGN_PREVIEW_USER_PREFIX}2`,
    name: "Maria Schmidt",
    email: "maria.schmidt@design-preview.dev",
    telegramId: "1000987654",
    createdAt: iso("2026-02-14T11:05:00+03:00"),
    subscription: {
      plan: "PRO",
      status: "blocked",
      currentPeriodEnd: null,
      stripeCustomerId: "cus_demo_3bYt",
      stripeSubscriptionId: null,
      updatedAt: iso("2026-05-11T16:40:00+03:00"),
      isBlocked: true,
    },
  },
  {
    id: `${ADMIN_DESIGN_PREVIEW_USER_PREFIX}3`,
    name: null,
    email: "guest-list+long-email-placeholder@example.com",
    telegramId: null,
    createdAt: iso("2026-03-01T08:30:00+03:00"),
    subscription: {
      plan: "FREE",
      status: "active",
      currentPeriodEnd: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      updatedAt: iso("2026-03-01T08:30:00+03:00"),
      isBlocked: false,
    },
  },
  {
    id: `${ADMIN_DESIGN_PREVIEW_USER_PREFIX}4`,
    name: "Иван",
    email: "ivan.k@example.com",
    telegramId: "2000555011",
    createdAt: iso("2025-11-20T19:00:00+03:00"),
    subscription: {
      plan: "PRO",
      status: "past_due",
      currentPeriodEnd: iso("2026-04-28T12:00:00+03:00"),
      stripeCustomerId: "cus_demo_pastdue",
      stripeSubscriptionId: "sub_demo_pastdue",
      updatedAt: iso("2026-05-09T07:12:00+03:00"),
      isBlocked: false,
    },
  },
  {
    id: `${ADMIN_DESIGN_PREVIEW_USER_PREFIX}5`,
    name: "DelyBet QA",
    email: "qa@delybet.local",
    telegramId: "5000111222",
    createdAt: iso("2026-04-02T10:00:00+03:00"),
    subscription: {
      plan: "FREE",
      status: "canceled",
      currentPeriodEnd: iso("2026-03-15T23:59:59+03:00"),
      stripeCustomerId: "cus_demo_canceled",
      stripeSubscriptionId: null,
      updatedAt: iso("2026-03-16T08:00:00+03:00"),
      isBlocked: false,
    },
  },
  {
    id: `${ADMIN_DESIGN_PREVIEW_USER_PREFIX}6`,
    name: "Команда дизайна",
    email: "design@agency.studio",
    telegramId: "7770001122",
    createdAt: iso("2026-05-12T12:00:00+03:00"),
    subscription: {
      plan: "PRO",
      status: "active",
      currentPeriodEnd: iso("2026-07-01T00:00:00+03:00"),
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      updatedAt: iso("2026-05-12T12:00:00+03:00"),
      isBlocked: false,
    },
  },
];

export function isAdminDesignPreviewUserId(userId: string): boolean {
  return userId.startsWith(ADMIN_DESIGN_PREVIEW_USER_PREFIX);
}

export function getAdminDesignPreviewUsers(): AdminDemoUser[] {
  return USERS;
}

export function getAdminDesignPreviewStats(users: AdminDemoUser[]) {
  return {
    totalUsers: users.length,
    proUsers: users.filter((u) => u.subscription?.plan === "PRO").length,
    blockedUsers: users.filter((u) => u.subscription?.isBlocked).length,
    stripeLinkedUsers: users.filter((u) =>
      Boolean(u.subscription?.stripeCustomerId)
    ).length,
  };
}

export function getAdminDesignPreviewUserById(
  userId: string
): Pick<AdminDemoUser, "id" | "name" | "email" | "telegramId"> | null {
  const u = USERS.find((x) => x.id === userId);
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    telegramId: u.telegramId,
  };
}

export function getAdminDesignPreviewPayments(
  userId: string
): AdminDemoPaymentRow[] {
  const base = (suffix: string): AdminDemoPaymentRow[] => [
    {
      id: `demo-pay-${suffix}-a`,
      createdAt: iso("2026-05-10T14:30:00+03:00"),
      amountRub: 499,
      status: "paid",
      source: "stripe",
      description: "DelyBet Pro — месяц",
    },
    {
      id: `demo-pay-${suffix}-b`,
      createdAt: iso("2026-04-10T11:05:00+03:00"),
      amountRub: 499,
      status: "paid",
      source: "stripe",
      description: "DelyBet Pro — продление",
    },
    {
      id: `demo-pay-${suffix}-c`,
      createdAt: iso("2026-03-08T09:20:00+03:00"),
      amountRub: 499,
      status: "paid",
      source: "demo",
      description: "Тестовый период (ручное начисление)",
    },
  ];

  if (userId.endsWith("2")) {
    return [
      {
        id: "demo-pay-blocked-1",
        createdAt: iso("2026-04-01T10:00:00+03:00"),
        amountRub: 499,
        status: "paid",
        source: "stripe",
        description: "Pro до блокировки",
      },
    ];
  }
  if (userId.endsWith("3")) {
    return [];
  }
  if (userId.endsWith("4")) {
    return [
      ...base("past"),
      {
        id: "demo-pay-fail",
        createdAt: iso("2026-05-01T08:00:00+03:00"),
        amountRub: 499,
        status: "uncollectible",
        source: "stripe",
        description: "Не прошло списание — требуется обновление карты",
      },
    ];
  }
  if (userId.endsWith("5")) {
    return [
      {
        id: "demo-pay-old",
        createdAt: iso("2026-02-15T12:00:00+03:00"),
        amountRub: 499,
        status: "paid",
        source: "stripe",
        description: "Pro — отменённая подписка после периода",
      },
    ];
  }
  if (userId.endsWith("6")) {
    return [
      {
        id: "demo-pay-manual",
        createdAt: iso("2026-05-12T12:05:00+03:00"),
        amountRub: 0,
        status: "comped",
        source: "demo",
        description: "Компенсация / внутренний доступ без Stripe",
      },
    ];
  }
  return base("default");
}
