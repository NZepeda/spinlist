"use client";

import { useActionState, useEffect } from "react";
import { resendSignupConfirmationAction } from "@/features/auth/actions/resendSignupConfirmationAction";
import { initialResendConfirmationState } from "@/features/auth/createResendConfirmationState";
import { useCountdown } from "@/shared/hooks/useCountdown";
import { Button } from "@/shared/ui/button";

interface ResendConfirmationButtonProps {
  email: string;
  initialCooldownSeconds?: number;
}

const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Renders a button allowing the user to resend a confirmation email to themselves.
 */
export function ResendConfirmationButton({
  email,
  initialCooldownSeconds = 0,
}: ResendConfirmationButtonProps) {
  const [state, formAction, pending] = useActionState(
    resendSignupConfirmationAction,
    initialResendConfirmationState,
  );
  const { reset, secondsRemaining, start } = useCountdown(
    initialCooldownSeconds,
  );

  useEffect(() => {
    reset(initialCooldownSeconds);
  }, [initialCooldownSeconds]);

  useEffect(() => {
    if (!state.formSuccess) {
      return;
    }

    start(RESEND_COOLDOWN_SECONDS);
  }, [state.formSuccess]);

  const isCountdownRunning = secondsRemaining > 0;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="email" value={email} />
      <Button
        type="submit"
        variant="outline"
        className="sm:min-w-56"
        disabled={pending || isCountdownRunning}
      >
        {pending
          ? "Sending again..."
          : isCountdownRunning
            ? `Resend available in ${secondsRemaining}s`
            : "Resend confirmation email"}
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
