import type { MetadataRoute } from "next";

/**
 * Generates the sitemap.xml for search engine discovery.
 * Currently includes static pages. Expand with dynamic routes
 * (albums, artists) once those pages are publicly accessible.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thespinlist.com";

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/waitlist`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
