"use client";

import Link from "next/link";
import { Button } from "@/components/ui-core/button";
import { Input } from "@/components/ui-core/input";
import { useSignUp } from "@/hooks/useSignUp";
import { PasswordInput } from "@/components/PasswordInput";

/**
 * Sign-up page component for user registration.
 * Provides a form for new users to create an account with email, username, and password.
 */
export default function SignUpPage() {
  const {
    email,
    username,
    password,
    confirmPassword,
    errors,
    isLoading,
    setEmail,
    setUsername,
    setPassword,
    setConfirmPassword,
    handleSignUp,
  } = useSignUp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleSignUp();
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="text-muted-foreground mt-2">Sign up to get started</p>
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
              aria-invalid={!!errors.email}
              disabled={isLoading}
              required
            />
            {errors.email && (
              <p className="text-destructive text-sm">{errors.email}</p>
            )}
          </div>

          {/* Username field */}
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>
            <Input
              id="username"
              type="text"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              aria-invalid={!!errors.username}
              disabled={isLoading}
              required
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_]+"
            />
            {errors.username && (
              <p className="text-destructive text-sm">{errors.username}</p>
            )}
            <p className="text-muted-foreground text-xs">
              3-20 characters, letters, numbers, and underscores only
            </p>
          </div>

          {/* Password field */}
          <PasswordInput
            password={password}
            onPasswordChange={setPassword}
            isLoading={isLoading}
            error={errors.password}
            label={"Password"}
            className="space-y-2"
          />

          {/* Confirm password field */}
          <PasswordInput
            password={confirmPassword}
            onPasswordChange={setConfirmPassword}
            isLoading={isLoading}
            label={"Confirm Password"}
            error={errors.confirmPassword}
          />
          {/* Submit button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Sign up"}
          </Button>

          {/* Link to login page */}
          <p className="text-muted-foreground text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
