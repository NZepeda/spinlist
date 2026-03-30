import { headers } from "next/headers";

const LOCAL_HOSTNAMES = new Set(["127.0.0.1", "localhost"]);

/**
 * Removes trailing slashes so redirect URLs do not generate double-slash paths.
 */
function normalizeSiteUrl(siteUrl: string): string {
  if (siteUrl.endsWith("/")) {
    return siteUrl.slice(0, -1);
  }

  return siteUrl;
}

/**
 * Distinguishes production-only behavior from local and preview environments.
 */
function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Detects local-only site URLs that should never be used for production auth emails.
 */
function isLocalSiteUrl(siteUrl: string): boolean {
  try {
    const normalizedSiteUrl = normalizeSiteUrl(siteUrl);
    const parsedSiteUrl = new URL(normalizedSiteUrl);

    return LOCAL_HOSTNAMES.has(parsedSiteUrl.hostname);
  } catch {
    return false;
  }
}

/**
 * Ensures production traffic always uses an explicitly configured public origin.
 */
function getConfiguredProductionSiteUrl(): string {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!configuredSiteUrl) {
    throw new Error(
      "A valid canonical site URL must be configured in production.",
    );
  }

  const normalizedSiteUrl = normalizeSiteUrl(configuredSiteUrl);

  if (isLocalSiteUrl(normalizedSiteUrl)) {
    throw new Error(
      "A valid canonical site URL must be configured in production.",
    );
  }

  return normalizedSiteUrl;
}

/**
 * Preserves plain HTTP for local development hosts while keeping production redirects secure.
 */
function createSiteUrlFromHost(
  host: string,
  forwardedProto: string | null,
): string {
  const hostname = host.split(":")[0];
  const protocol =
    forwardedProto ?? (LOCAL_HOSTNAMES.has(hostname) ? "http" : "https");

  return `${protocol}://${host}`;
}

/**
 * Resolves the canonical site origin from deployment config or the current request.
 */
export async function getSiteUrl(): Promise<string> {
  if (isProductionEnvironment()) {
    return getConfiguredProductionSiteUrl();
  }

  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (configuredSiteUrl) {
    return normalizeSiteUrl(configuredSiteUrl);
  }

  const headersList = await headers();
  const origin = headersList.get("origin");

  if (origin) {
    return normalizeSiteUrl(origin);
  }

  const forwardedHost = headersList.get("x-forwarded-host");
  const forwardedProto = headersList.get("x-forwarded-proto");

  if (forwardedHost) {
    return createSiteUrlFromHost(forwardedHost, forwardedProto);
  }

  const host = headersList.get("host");

  if (host) {
    return createSiteUrlFromHost(host, forwardedProto);
  }

  throw new Error(
    "A canonical site URL could not be resolved from configuration or request headers.",
  );
}
