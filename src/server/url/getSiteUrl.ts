import { headers } from "next/headers";

const LOCAL_SITE_URL = "http://127.0.0.1:3000";

/**
 * Resolves the canonical site origin for auth redirects across local and production environments.
 */
export async function getSiteUrl(): Promise<string> {
  const headersList = await headers();
  const origin = headersList.get("origin");

  if (origin) {
    return origin;
  }

  const forwardedHost = headersList.get("x-forwarded-host");
  const forwardedProto = headersList.get("x-forwarded-proto");

  if (forwardedHost) {
    return `${forwardedProto ?? "https"}://${forwardedHost}`;
  }

  const host = headersList.get("host");

  if (host) {
    return `http://${host}`;
  }

  return process.env.NEXT_PUBLIC_SITE_URL ?? LOCAL_SITE_URL;
}
