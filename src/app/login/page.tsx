"use client";

import Link from "next/link";
import { Button } from "@/components/ui-core/button";
import { Input } from "@/components/ui-core/input";
import { useLogin } from "@/hooks/useLogin";
import { PasswordInput } from "@/components/PasswordInput";

/**
 * Login page component for user authentication.
 * Provides a form for existing users to sign in to their account.
 */
export default function LoginPage() {
  const {
    email,
    password,
    errors,
    isLoading,
    setEmail,
    setPassword,
    handleLogin,
  } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleLogin();
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General error message */}
          {errors.general && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
              {errors.general}
            </div>
          )}

          {/* Email field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(errors.email)}
              disabled={isLoading}
              required
            />
            {errors.email && (
              <p className="text-destructive text-sm">{errors.email}</p>
            )}
          </div>

          {/* Password field */}
          <PasswordInput
            password={password}
            onPasswordChange={setPassword}
            isLoading={isLoading}
            error={errors.password}
            label="Password"
            className="space-y-2"
          />

          {/* Submit button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>

          {/* Link to signup page */}
          <p className="text-muted-foreground text-center text-sm">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
