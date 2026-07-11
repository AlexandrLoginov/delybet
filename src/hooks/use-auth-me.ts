"use client";

import useSWR from "swr";

export type AuthMeResponse =
  | {
      authenticated: true;
      user: {
        id: string;
        name: string | null;
        telegramId: string | null;
      };
      isPro: boolean;
      subscription: {
        plan: string;
        status: string;
        currentPeriodEnd: string | null;
        stripeSubscriptionId: string | null;
        stripeCustomerId: string | null;
      } | null;
    }
  | {
      authenticated: false;
      user: null;
      isPro: false;
      subscription: null;
    };

async function fetcher(url: string): Promise<AuthMeResponse> {
  const res = await fetch(url, { credentials: "include" });
  const data = (await res.json()) as AuthMeResponse & { error?: string };
  if (!res.ok) {
    throw new Error(data?.error ?? "AUTH_ME_FAILED");
  }
  return data as AuthMeResponse;
}

type UseAuthMeOptions = {
  /** Опрос после Stripe Checkout, пока вебхук не выставил Pro */
  pollUntilPro?: boolean;
};

export function useAuthMe(options?: UseAuthMeOptions) {
  const pollUntilPro = options?.pollUntilPro === true;

  return useSWR<AuthMeResponse>("/api/auth/me", fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: pollUntilPro ? 0 : 4000,
    refreshInterval: (latest) => {
      if (!pollUntilPro) return 0;
      if (latest?.isPro) return 0;
      return 3000;
    },
  });
}
