import { PayOS } from "@payos/node";

let client: PayOS | null = null;

export function getPayOS(): PayOS {
  if (!client) {
    const clientId = process.env.PAYOS_CLIENT_ID?.trim();
    const apiKey = process.env.PAYOS_API_KEY?.trim();
    const checksumKey = process.env.PAYOS_CHECKSUM_KEY?.trim();
    if (!clientId || !apiKey || !checksumKey) {
      throw new Error("PAYOS_NOT_CONFIGURED");
    }
    client = new PayOS({ clientId, apiKey, checksumKey });
  }
  return client;
}
