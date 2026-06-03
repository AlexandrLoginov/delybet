/** Предпросмотр источника данных для админов (localStorage). */

import type { AdminDataSourceMode } from "@/lib/admin-data-source";

export const ADMIN_DATA_SOURCE_STORAGE_KEY = "delybet-admin-data-source";

const CHANGE_EVENT = "delybet-admin-data-source-change";

export function getDefaultAdminDataSource(): AdminDataSourceMode {
  return "api";
}

export function getAdminDataSourceSnapshot(): AdminDataSourceMode {
  if (typeof window === "undefined") return getDefaultAdminDataSource();
  const raw = window.localStorage.getItem(ADMIN_DATA_SOURCE_STORAGE_KEY);
  return raw === "mock" || raw === "api" ? raw : getDefaultAdminDataSource();
}

export function setAdminDataSource(value: AdminDataSourceMode): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_DATA_SOURCE_STORAGE_KEY, value);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeAdminDataSource(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onCustom = () => onStoreChange();
  const onStorage = (e: StorageEvent) => {
    if (e.key === ADMIN_DATA_SOURCE_STORAGE_KEY) onStoreChange();
  };
  window.addEventListener(CHANGE_EVENT, onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}
