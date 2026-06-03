import type { AdminDataSourceMode } from "@/lib/admin-data-source";

const INIT_DATA_HEADER = "x-telegram-init-data";

export function withAdminDataSourceParam(
  url: string,
  mode: AdminDataSourceMode,
  isAdmin: boolean
): string {
  if (!isAdmin) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}dataSource=${encodeURIComponent(mode)}`;
}

export function adminFetchInit(initData: string | null): RequestInit {
  const headers: Record<string, string> = {};
  if (initData?.trim()) {
    headers[INIT_DATA_HEADER] = initData.trim();
  }
  return {
    credentials: "include",
    headers: Object.keys(headers).length > 0 ? headers : undefined,
  };
}
