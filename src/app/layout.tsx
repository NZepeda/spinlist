import { Geist_Mono } from "next/font/google";
import { satoshi } from "./fonts";
import "./globals.css";
import { QueryClientProvider } from "@/shared/providers/QueryClientProvider";
import { AuthProvider } from "@/features/auth/hooks/useAuth";
import { Analytics } from "@vercel/analytics/next";
import { Navbar } from "@/features/navigation/components/Navbar";
import { getInitialAuthState } from "@/features/auth/server/getInitialAuthState";
import { Toaster } from "sonner";

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
      <body
        className={`${satoshi.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <QueryClientProvider>
          <AuthProvider
            initialProfile={initialAuthState.profile}
            initialUser={initialAuthState.user}
          >
            <Navbar />
            {children}
            <Toaster position="top-center" richColors />
          </AuthProvider>
        </QueryClientProvider>
      </body>
      <Analytics />
    </html>
  );
}
