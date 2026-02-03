import type { MetadataRoute } from "next";

/**
 * Generates robots.txt to guide search engine crawlers.
 * Currently allows all crawlers access to all public pages.
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thespinlist.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
