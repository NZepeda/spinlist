"use client";

import { useActionState } from "react";
import { resendSignupConfirmationAction } from "@/features/auth/actions/resendSignupConfirmationAction";
import { initialResendConfirmationState } from "@/features/auth/createResendConfirmationState";
import { Button } from "@/shared/ui/button";

interface ResendConfirmationButtonProps {
  email: string;
}

/**
 * Renders a button allowing the user to resend a confirmation email to themselves.
 */
export function ResendConfirmationButton({
  email,
}: ResendConfirmationButtonProps) {
  const [state, formAction, pending] = useActionState(
    resendSignupConfirmationAction,
    initialResendConfirmationState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="email" value={email} />
      <Button type="submit" variant="outline" className="sm:min-w-56">
        {pending ? "Sending again..." : "Resend confirmation email"}
      </Button>
      {state.formSuccess ? (
        <p className="text-center text-sm text-foreground-muted" role="status">
          {state.formSuccess}
        </p>
      ) : null}
      {state.formError ? (
        <p className="text-center text-sm text-destructive" role="alert">
          {state.formError}
        </p>
      ) : null}
    </form>
  );
}
