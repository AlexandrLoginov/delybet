"use client";

import { useMemo, useSyncExternalStore } from "react";

import {
  getFreeRedeemedMatchIds,
  subscribeFreePreviewChange,
} from "@/lib/freemium";

function snapshotString(): string {
  return JSON.stringify(getFreeRedeemedMatchIds());
}

const SSR_SNAPSHOT = JSON.stringify({
  upcoming: null,
  live: null,
});

export function useFreePreviewRedeemedIds(): {
  upcoming: string | null;
  live: string | null;
} {
  const raw = useSyncExternalStore(
    subscribeFreePreviewChange,
    snapshotString,
    () => SSR_SNAPSHOT
  );

  return useMemo(() => {
    try {
      return JSON.parse(raw) as {
        upcoming: string | null;
        live: string | null;
      };
    } catch {
      return { upcoming: null, live: null };
    }
  }, [raw]);
}
