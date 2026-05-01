import { MOCK_MATCHES } from "@/lib/mock-data";
import type { Match, SportSlug } from "@/types/match";

/** Легаси: один общий слот до разделения на Live / Предстоящие. */
export const FREE_PREVIEW_STORAGE_KEY = "sportai-free-preview-match-id";

const FREE_PREVIEW_STORAGE_KEY_UPCOMING = "sportai-free-preview-upcoming-id";
const FREE_PREVIEW_STORAGE_KEY_LIVE = "sportai-free-preview-live-id";

export type FreePreviewKind = "upcoming" | "live";

let legacyMigrated = false;

function migrateLegacyFreePreviewOnce(): void {
  if (typeof window === "undefined" || legacyMigrated) return;

  try {
    const legacy = window.localStorage.getItem(FREE_PREVIEW_STORAGE_KEY);
    if (!legacy) {
      legacyMigrated = true;
      return;
    }

    const match = MOCK_MATCHES.find((m) => m.id === legacy);
    const kind: FreePreviewKind =
      match?.status === "live" ? "live" : "upcoming";
    const key =
      kind === "live"
        ? FREE_PREVIEW_STORAGE_KEY_LIVE
        : FREE_PREVIEW_STORAGE_KEY_UPCOMING;

    if (!window.localStorage.getItem(key)) {
      window.localStorage.setItem(key, legacy);
    }
    window.localStorage.removeItem(FREE_PREVIEW_STORAGE_KEY);
    window.dispatchEvent(new Event("sportai-free-preview-change"));
    legacyMigrated = true;
  } catch {
    /* allow retry next read */
  }
}

export function freePreviewKindForMatch(match: Pick<Match, "status">): FreePreviewKind {
  return match.status === "live" ? "live" : "upcoming";
}

function storageKeyForKind(kind: FreePreviewKind): string {
  return kind === "live"
    ? FREE_PREVIEW_STORAGE_KEY_LIVE
    : FREE_PREVIEW_STORAGE_KEY_UPCOMING;
}

/** По возрастанию kickoffISO: один id на каждый sport среди переданных матчей. */
export function computeEligibleMatchIds(
  matches: Pick<Match, "id" | "sport" | "kickoffISO">[]
): Set<string> {
  const sorted = [...matches].sort(
    (a, b) =>
      new Date(a.kickoffISO).getTime() - new Date(b.kickoffISO).getTime()
  );

  const ids = new Set<string>();
  const seenSports = new Set<SportSlug>();

  for (const m of sorted) {
    if (!seenSports.has(m.sport)) {
      seenSports.add(m.sport);
      ids.add(m.id);
    }
  }

  return ids;
}

export function getTabMatchesFromMock(tab: "upcoming" | "live"): Match[] {
  return MOCK_MATCHES.filter((m) =>
    tab === "live" ? m.status === "live" : m.status === "upcoming"
  );
}

/** Совпадает со списком при фильтре «все виды спорта» для вкладки матча. */
export function isMatchGloballyEligibleForFreePreview(match: Match): boolean {
  const kind = freePreviewKindForMatch(match);
  const eligible = computeEligibleMatchIds(getTabMatchesFromMock(kind));
  return eligible.has(match.id);
}

export function getFreeRedeemedMatchId(kind: FreePreviewKind): string | null {
  if (typeof window === "undefined") return null;
  try {
    migrateLegacyFreePreviewOnce();
    return window.localStorage.getItem(storageKeyForKind(kind));
  } catch {
    return null;
  }
}

export function getFreeRedeemedMatchIds(): {
  upcoming: string | null;
  live: string | null;
} {
  if (typeof window === "undefined") {
    return { upcoming: null, live: null };
  }
  try {
    migrateLegacyFreePreviewOnce();
    return {
      upcoming: window.localStorage.getItem(FREE_PREVIEW_STORAGE_KEY_UPCOMING),
      live: window.localStorage.getItem(FREE_PREVIEW_STORAGE_KEY_LIVE),
    };
  } catch {
    return { upcoming: null, live: null };
  }
}

export function redeemFreePreview(
  matchId: string,
  kind: FreePreviewKind
): void {
  if (typeof window === "undefined") return;
  try {
    migrateLegacyFreePreviewOnce();
    window.localStorage.setItem(storageKeyForKind(kind), matchId);
    window.dispatchEvent(new Event("sportai-free-preview-change"));
  } catch {
    /* quota / privacy mode */
  }
}

export function subscribeFreePreviewChange(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("storage", listener);
  window.addEventListener("sportai-free-preview-change", listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener("sportai-free-preview-change", listener);
  };
}
