import localFont from "next/font/local";

/**
 * Satoshi font from Fontshare (https://www.fontshare.com/fonts/satoshi)
 *
 * A modern sans-serif typeface with geometric sensibilities and a warm touch.
 * Used as the primary font throughout the application.
 *
 * Weights available:
 * - 300: Light
 * - 400: Regular (body text)
 * - 500: Medium
 * - 700: Bold
 * - 900: Black (headings, emphasis)
 *
 * @see https://www.fontshare.com/fonts/satoshi
 */
export const satoshi = localFont({
  src: "./Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  display: "swap",
  weight: "300 900",
});
