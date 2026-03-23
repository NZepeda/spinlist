import { Geist_Mono } from "next/font/google";
import { satoshi } from "./fonts";
import "./globals.css";
import { QueryClientProvider } from "@/components/contexts/QueryClientProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { Analytics } from "@vercel/analytics/next";
import { Navbar } from "@/components/Navbar";
import { getInitialAuthState } from "@/lib/auth/getInitialAuthState";

export { metadata } from "./metadata";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialAuthState = await getInitialAuthState();

  return (
    <html lang="en">
      <body className={`${satoshi.variable} ${geistMono.variable} antialiased`}>
        <QueryClientProvider>
          <AuthProvider
            initialProfile={initialAuthState.profile}
            initialUser={initialAuthState.user}
          >
            <Navbar />
            {children}
          </AuthProvider>
        </QueryClientProvider>
      </body>
      <Analytics />
    </html>
  );
}
