/** Временный превью-режим Pro (localStorage + синхронизация между вкладками). */

export const DEV_PRO_PREVIEW_STORAGE_KEY = "delybet-dev-pro-preview";

const CHANGE_EVENT = "delybet-dev-pro-preview-change";

export function getDevProPreviewSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(DEV_PRO_PREVIEW_STORAGE_KEY) === "true";
}

export function setDevProPreview(value: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    DEV_PRO_PREVIEW_STORAGE_KEY,
    value ? "true" : "false"
  );
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeDevProPreview(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onCustom = () => onStoreChange();
  const onStorage = (e: StorageEvent) => {
    if (e.key === DEV_PRO_PREVIEW_STORAGE_KEY) onStoreChange();
  };
  window.addEventListener(CHANGE_EVENT, onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}
