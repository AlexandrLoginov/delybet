export function isPayosConfigured(): boolean {
  return Boolean(
    process.env.PAYOS_CLIENT_ID?.trim() &&
      process.env.PAYOS_API_KEY?.trim() &&
      process.env.PAYOS_CHECKSUM_KEY?.trim()
  );
}

export function payosReturnUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/subscription?checkout=success&provider=payos`;
}

export function payosCancelUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/subscription?checkout=cancel&provider=payos`;
}
