import { Geist_Mono } from "next/font/google";
import { satoshi } from "./fonts";
import "./globals.css";
import { QueryClientProvider } from "@/components/contexts/QueryClientProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { Analytics } from "@vercel/analytics/next";
import { Navbar } from "@/components/Navbar";

export { metadata } from "./metadata";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isProduction = process.env.NODE_ENV === "production";
  return (
    <html lang="en">
      <body className={`${satoshi.variable} ${geistMono.variable} antialiased`}>
        <QueryClientProvider>
          <AuthProvider>
            {isProduction ? null : <Navbar />}
            {children}
          </AuthProvider>
        </QueryClientProvider>
      </body>
      {isProduction && <Analytics />}
    </html>
  );
}
