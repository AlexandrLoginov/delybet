/** Типичные интерактивные элементы; клики вне них не перехватываем (прокрутка и т.п.). */
export const TELEGRAM_GATE_INTERACTIVE_SELECTOR = [
  "a[href]",
  "button:not(:disabled)",
  '[role="button"]:not([aria-disabled="true"])',
  '[role="tab"]',
  '[role="switch"]',
  '[role="menuitem"]',
  '[role="link"]',
  '[role="checkbox"]',
  "input:not(:disabled)",
  "select:not(:disabled)",
  "textarea:not(:disabled)",
  "summary",
  "label",
].join(", ");

export function isTelegramExternalLinkElement(el: Element): boolean {
  const anchor = el.closest("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return false;
  try {
    const u = new URL(anchor.href, window.location.href);
    return u.hostname === "t.me" || u.hostname === "telegram.me";
  } catch {
    return false;
  }
}
