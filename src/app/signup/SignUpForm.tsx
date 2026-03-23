"use client";

import { useActionState } from "react";
import Link from "next/link";
import { PasswordInput } from "@/components/PasswordInput";
import { Button } from "@/components/ui-core/button";
import { Input } from "@/components/ui-core/input";
import { signupAction } from "@/app/actions/signupAction";
import { initialAuthActionState } from "@/lib/auth/actionState";

/**
 * Renders the sign-up form against the server action auth boundary.
 * Keeps only submit status and field rendering in the client layer.
 */
export function SignUpForm() {
  const [state, formAction, pending] = useActionState(
    signupAction,
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

      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-medium">
          Username
        </label>
        <Input
          id="username"
          name="username"
          type="text"
          placeholder="johndoe"
          aria-invalid={Boolean(state.fieldErrors.username)}
          disabled={pending}
          required
          minLength={3}
          maxLength={20}
          pattern="[a-zA-Z0-9_]+"
        />
        {state.fieldErrors.username ? (
          <p className="text-destructive text-sm">
            {state.fieldErrors.username}
          </p>
        ) : null}
        <p className="text-muted-foreground text-xs">
          3-20 characters, letters, numbers, and underscores only
        </p>
      </div>

      <PasswordInput
        className="space-y-2"
        error={state.fieldErrors.password}
        id="signup-password"
        isLoading={pending}
        label="Password"
        name="password"
      />

      <PasswordInput
        error={state.fieldErrors.confirmPassword}
        id="signup-confirm-password"
        isLoading={pending}
        label="Confirm Password"
        name="confirmPassword"
      />

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating account..." : "Sign up"}
      </Button>

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
  );
}
