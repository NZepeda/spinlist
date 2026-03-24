"use client";

import { useActionState } from "react";
import Link from "next/link";
import { PasswordInput } from "@/shared/ui/PasswordInput";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { loginAction } from "@/features/auth/actions/loginAction";
import { initialAuthActionState } from "@/features/auth/actionState";

/**
 * Renders the login form against the server action auth boundary.
 * Keeps only submit status and field rendering in the client layer.
 */
export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialAuthActionState,
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.formError ? (
        <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
          {state.formError}
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(state.fieldErrors.email)}
          disabled={pending}
          required
        />
        {state.fieldErrors.email ? (
          <p className="text-destructive text-sm">{state.fieldErrors.email}</p>
        ) : null}
      </div>

      <PasswordInput
        className="space-y-2"
        error={state.fieldErrors.password}
        id="login-password"
        isLoading={pending}
        label="Password"
        name="password"
      />

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </Button>

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
  );
}
