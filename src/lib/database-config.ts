/** Placeholder из .env.example — не реальное подключение. */
export function isPlaceholderDatabaseUrl(url: string | undefined): boolean {
  const value = url?.trim() ?? "";
  if (!value) return true;
  return (
    value.includes("USER:PASSWORD") ||
    value.includes("@HOST.") ||
    value.includes("user:password@localhost")
  );
}

export function isDatabaseUrlConfigured(): boolean {
  return !isPlaceholderDatabaseUrl(process.env.DATABASE_URL);
}

export type DatabaseErrorCode =
  | "DATABASE_URL_MISSING"
  | "DATABASE_CONNECTION_FAILED"
  | "DATABASE_SCHEMA_MISSING"
  | "DATABASE_UNAVAILABLE";

export function classifyDatabaseError(error: unknown): DatabaseErrorCode {
  if (!isDatabaseUrlConfigured()) {
    return "DATABASE_URL_MISSING";
  }

  const message = error instanceof Error ? error.message : String(error);
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: string }).code ?? "")
      : "";

  if (
    code === "P2021" ||
    /does not exist in the current database|relation .* does not exist/i.test(
      message
    )
  ) {
    return "DATABASE_SCHEMA_MISSING";
  }

  if (
    code === "P1001" ||
    code === "P1000" ||
    code === "P1017" ||
    /ECONNREFUSED|ENOTFOUND|timeout|Can't reach database|connection/i.test(
      message
    )
  ) {
    return "DATABASE_CONNECTION_FAILED";
  }

  return "DATABASE_UNAVAILABLE";
}
