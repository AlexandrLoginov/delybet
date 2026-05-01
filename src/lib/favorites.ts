const STORAGE_KEY = "delybet-match-favorites";
export const FAVORITES_CHANGE_EVENT = "delybet-favorites-change";

export function getFavoriteMatchIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function persistFavoriteMatchIds(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
    window.dispatchEvent(new Event(FAVORITES_CHANGE_EVENT));
  } catch {
    /* quota / privacy mode */
  }
}

/** Переключает избранное; возвращает true, если матч теперь в избранном. */
export function toggleFavoriteMatchId(matchId: string): boolean {
  const ids = getFavoriteMatchIds();
  const next = new Set(ids);
  let nowFavorite: boolean;
  if (next.has(matchId)) {
    next.delete(matchId);
    nowFavorite = false;
  } else {
    next.add(matchId);
    nowFavorite = true;
  }
  persistFavoriteMatchIds(next);
  return nowFavorite;
}

export function isFavoriteMatchId(matchId: string): boolean {
  return getFavoriteMatchIds().has(matchId);
}

function snapshotFavoriteIdsJoined(): string {
  return [...getFavoriteMatchIds()].sort().join("\0");
}

const SSR_EMPTY_FAVORITES_SNAPSHOT = "";

export function subscribeFavoritesChange(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(FAVORITES_CHANGE_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(FAVORITES_CHANGE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export function getFavoriteMatchesSnapshot(): string {
  return snapshotFavoriteIdsJoined();
}

export function getFavoriteMatchesServerSnapshot(): string {
  return SSR_EMPTY_FAVORITES_SNAPSHOT;
}
