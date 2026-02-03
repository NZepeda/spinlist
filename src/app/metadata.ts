import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thespinlist.com";

const name = "Spinlist";
const title = "Spinlist - Rate & Discover Music";
const description =
  "The music journal for obsessive listeners. Track your favorites, see what others are spinning, and build and share your taste profile.";

/**
 * Root metadata configuration for the application.
 * Defines SEO tags, Open Graph, and Twitter Card settings.
 *
 * Child pages can override these values by exporting their own `metadata`
 * or using `generateMetadata` for dynamic content.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: `%s | ${name}`,
  },
  description,
  keywords: [
    "music",
    "albums",
    "rating",
    "discovery",
    "music journal",
    "vinyl",
    "records",
    "music tracking",
  ],
  authors: [{ name: name }],
  creator: name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: name,
    title,
    description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Spinlist - Your music, remembered",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
    creator: "@thespinlist",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
