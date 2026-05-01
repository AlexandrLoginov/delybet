import { MOCK_MATCHES } from "@/lib/mock-data";
import type { Match, SportSlug } from "@/types/match";

/** Легаси: один общий слот до разделения на Live / Предстоящие. */
const LEGACY_COMBINED_PREVIEW_KEY = "sportai-free-preview-match-id";

/** Текущие ключи хранилища. */
const FREE_PREVIEW_STORAGE_KEY_UPCOMING = "delybet-free-preview-upcoming-id";
const FREE_PREVIEW_STORAGE_KEY_LIVE = "delybet-free-preview-live-id";

const LEGACY_PREVIEW_KEY_UPCOMING = "sportai-free-preview-upcoming-id";
const LEGACY_PREVIEW_KEY_LIVE = "sportai-free-preview-live-id";

const FREE_PREVIEW_CHANGE_EVENT = "delybet-free-preview-change";

export type FreePreviewKind = "upcoming" | "live";

let legacyMigrated = false;

function dispatchFreePreviewChange(): void {
  window.dispatchEvent(new Event(FREE_PREVIEW_CHANGE_EVENT));
}

function migrateLegacyFreePreviewOnce(): void {
  if (typeof window === "undefined" || legacyMigrated) return;

  try {
    let changed = false;

    const migratePair = (legacyKey: string, modernKey: string): void => {
      const legacyVal = window.localStorage.getItem(legacyKey);
      if (!legacyVal) {
        window.localStorage.removeItem(legacyKey);
        return;
      }
      if (!window.localStorage.getItem(modernKey)) {
        window.localStorage.setItem(modernKey, legacyVal);
        changed = true;
      }
      window.localStorage.removeItem(legacyKey);
    };

    migratePair(
      LEGACY_PREVIEW_KEY_UPCOMING,
      FREE_PREVIEW_STORAGE_KEY_UPCOMING
    );
    migratePair(LEGACY_PREVIEW_KEY_LIVE, FREE_PREVIEW_STORAGE_KEY_LIVE);

    const combined = window.localStorage.getItem(LEGACY_COMBINED_PREVIEW_KEY);
    if (combined) {
      const match = MOCK_MATCHES.find((m) => m.id === combined);
      const kind: FreePreviewKind =
        match?.status === "live" ? "live" : "upcoming";
      const key =
        kind === "live"
          ? FREE_PREVIEW_STORAGE_KEY_LIVE
          : FREE_PREVIEW_STORAGE_KEY_UPCOMING;
      if (!window.localStorage.getItem(key)) {
        window.localStorage.setItem(key, combined);
        changed = true;
      }
      window.localStorage.removeItem(LEGACY_COMBINED_PREVIEW_KEY);
      changed = true;
    }

    legacyMigrated = true;
    if (changed) {
      dispatchFreePreviewChange();
    }
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

/**
 * Единственный доступный без Pro матч во вкладке Live — самый ранний по kickoff
 * среди всех live в моках (независимо от фильтра вида спорта на экране).
 */
export function getFreeLivePreviewEligibleId(): string | null {
  const live = MOCK_MATCHES.filter((m) => m.status === "live");
  if (!live.length) return null;
  const sorted = [...live].sort(
    (a, b) =>
      new Date(a.kickoffISO).getTime() - new Date(b.kickoffISO).getTime()
  );
  return sorted[0]?.id ?? null;
}

/** По возрастанию kickoffISO: один id на каждый sport среди переданных матчей (вкладка «Предстоящие»). */
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
  if (kind === "live") {
    return match.id === getFreeLivePreviewEligibleId();
  }
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
    dispatchFreePreviewChange();
  } catch {
    /* quota / privacy mode */
  }
}

export function subscribeFreePreviewChange(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("storage", listener);
  window.addEventListener(FREE_PREVIEW_CHANGE_EVENT, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(FREE_PREVIEW_CHANGE_EVENT, listener);
  };
}
