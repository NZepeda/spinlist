import { Metadata } from "next";
import LoginForm from "./LoginForm";
import { Disc3 } from "lucide-react";

export const metadata: Metadata = {
  title: "Login | AlbumPulse",
  description: "Log in to your AlbumPulse account",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="flex flex-col items-center space-y-2">
          <Disc3 className="h-12 w-12 text-primary" />
          <h2 className="mt-6 text-3xl font-bold text-center">Welcome back</h2>
          <p className="text-sm text-muted-foreground text-center">
            Enter your email to sign in to your account
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
