/** Превью «Admin User» vs обычный пользователь (localStorage). */

export const ADMIN_USER_PREVIEW_STORAGE_KEY = "delybet-admin-user-preview";

const CHANGE_EVENT = "delybet-admin-user-preview-change";

export function getAdminUserPreviewSnapshot(): boolean {
  if (typeof window === "undefined") return true;
  const raw = window.localStorage.getItem(ADMIN_USER_PREVIEW_STORAGE_KEY);
  if (raw === null) return true;
  return raw === "true";
}

export function setAdminUserPreview(value: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    ADMIN_USER_PREVIEW_STORAGE_KEY,
    value ? "true" : "false"
  );
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeAdminUserPreview(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onCustom = () => onStoreChange();
  const onStorage = (e: StorageEvent) => {
    if (e.key === ADMIN_USER_PREVIEW_STORAGE_KEY) onStoreChange();
  };
  window.addEventListener(CHANGE_EVENT, onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}
