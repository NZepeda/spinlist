import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const headersMock = vi.hoisted(() => vi.fn());

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

import { getSiteUrl } from "./getSiteUrl";

/**
 * Builds a request header collection for URL resolution tests.
 */
function createHeaders(entries: Record<string, string>): Headers {
  const requestHeaders = new Headers();

  for (const [key, value] of Object.entries(entries)) {
    requestHeaders.set(key, value);
  }

  return requestHeaders;
}

describe("getSiteUrl", () => {
  beforeEach(() => {
    headersMock.mockReset();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("prefers the configured canonical site URL over request headers", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://thespinlist.com/");

    const siteUrl = await getSiteUrl();

    expect(siteUrl).toBe("https://thespinlist.com");
    expect(headersMock).not.toHaveBeenCalled();
  });

  it("uses the request origin when the canonical site URL is not configured", async () => {
    headersMock.mockResolvedValueOnce(
      createHeaders({
        origin: "https://spinlist-preview.vercel.app",
      }),
    );

    const siteUrl = await getSiteUrl();

    expect(siteUrl).toBe("https://spinlist-preview.vercel.app");
  });

  it("builds a secure site URL from forwarded proxy headers", async () => {
    headersMock.mockResolvedValueOnce(
      createHeaders({
        "x-forwarded-host": "thespinlist.com",
        "x-forwarded-proto": "https",
      }),
    );

    const siteUrl = await getSiteUrl();

    expect(siteUrl).toBe("https://thespinlist.com");
  });

  it("keeps localhost hosts on plain HTTP for local development", async () => {
    headersMock.mockResolvedValueOnce(
      createHeaders({
        host: "127.0.0.1:3000",
      }),
    );

    const siteUrl = await getSiteUrl();

    expect(siteUrl).toBe("http://127.0.0.1:3000");
  });

  it("throws when no environment or request context exists", async () => {
    headersMock.mockResolvedValueOnce(createHeaders({}));

    await expect(getSiteUrl()).rejects.toThrow(
      "A canonical site URL could not be resolved from configuration or request headers.",
    );
  });

  it("requires an explicit production site URL", async () => {
    vi.stubEnv("NODE_ENV", "production");

    await expect(getSiteUrl()).rejects.toThrow(
      "A valid canonical site URL must be configured in production.",
    );
    expect(headersMock).not.toHaveBeenCalled();
  });

  it("rejects localhost as the production site URL", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://127.0.0.1:3000");

    await expect(getSiteUrl()).rejects.toThrow(
      "A valid canonical site URL must be configured in production.",
    );
    expect(headersMock).not.toHaveBeenCalled();
  });

  it("uses the configured canonical site URL in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://thespinlist.com/");

    const siteUrl = await getSiteUrl();

    expect(siteUrl).toBe("https://thespinlist.com");
    expect(headersMock).not.toHaveBeenCalled();
  });
});
