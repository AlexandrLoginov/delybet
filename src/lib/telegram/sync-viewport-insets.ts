/** Платформы Telegram Desktop — фиксированный pt-[96px] давал лишний отступ. */
const DESKTOP_PLATFORMS = new Set([
  "macos",
  "tdesktop",
  "web",
  "weba",
  "unigram",
  "unknown",
]);

type InsetBox = { top: number; bottom: number; left: number; right: number };

type WebAppInsets = {
  platform?: string;
  contentSafeAreaInset?: InsetBox;
  safeAreaInset?: InsetBox;
};

function readCssInsetTop(): number {
  const root = document.documentElement;
  const raw =
    getComputedStyle(root).getPropertyValue("--tg-content-safe-area-inset-top").trim() ||
    getComputedStyle(root).getPropertyValue("--tg-safe-area-inset-top").trim();
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function syncTelegramViewportInsets(webApp: WebAppInsets): void {
  const platform = webApp.platform ?? "unknown";
  const contentTop = webApp.contentSafeAreaInset?.top;
  const safeTop = webApp.safeAreaInset?.top;

  let top = 0;
  if (typeof contentTop === "number" && Number.isFinite(contentTop)) {
    top = contentTop;
  } else if (typeof safeTop === "number" && Number.isFinite(safeTop)) {
    top = safeTop;
  }

  if (top <= 0) {
    top = readCssInsetTop();
  }

  if (top <= 0 && DESKTOP_PLATFORMS.has(platform)) {
    top = 0;
  }

  document.documentElement.style.setProperty("--app-inset-top", `${top}px`);
}

export function clearViewportInsets(): void {
  document.documentElement.style.setProperty("--app-inset-top", "0px");
}

export function bindTelegramViewportInsetEvents(
  webApp: WebAppInsets & {
    onEvent?: (event: string, handler: () => void) => void;
    offEvent?: (event: string, handler: () => void) => void;
  }
): () => void {
  const handler = () => syncTelegramViewportInsets(webApp);
  syncTelegramViewportInsets(webApp);

  webApp.onEvent?.("contentSafeAreaChanged", handler);
  webApp.onEvent?.("safeAreaChanged", handler);

  return () => {
    webApp.offEvent?.("contentSafeAreaChanged", handler);
    webApp.offEvent?.("safeAreaChanged", handler);
  };
}
