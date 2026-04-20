import Link from "next/link";
import { ResendConfirmationButton } from "@/features/auth/components/ResendConfirmationButton";
import { AppPage } from "@/shared/ui/AppPage";
import { Button } from "@/shared/ui/button";

interface ConfirmEmailPageProps {
  searchParams: Promise<{
    email?: string;
    status?: string;
  }>;
}

type ConfirmationPageStatus = "invalid" | "login" | undefined;

/**
 * Returns whether the page should show the invalid-link recovery state.
 */
function isInvalidConfirmationState(status?: ConfirmationPageStatus): boolean {
  return status === "invalid";
}

/**
 * Returns whether the page was reached because login was blocked on email confirmation.
 */
function isLoginRecoveryState(status?: ConfirmationPageStatus): boolean {
  return status === "login";
}

/**
 * Displays the email confirmation page with a:
 * - message to check email if the user is not confirmed
 * - user friendly error message if the email link they clicked is no longer valid.
 */
export default async function ConfirmEmailPage({
  searchParams,
}: ConfirmEmailPageProps) {
  const resolvedSearchParams = await searchParams;
  const email = resolvedSearchParams.email;
  const status =
    resolvedSearchParams.status === "invalid" ||
    resolvedSearchParams.status === "login"
      ? resolvedSearchParams.status
      : undefined;
  const showInvalidState = isInvalidConfirmationState(status);
  const showLoginRecoveryState = isLoginRecoveryState(status);
  const initialCooldownSeconds = showInvalidState || showLoginRecoveryState ? 0 : 60;

  return (
    <AppPage className="flex min-h-[calc(100dvh-var(--header-height))] justify-center">
      <div className="w-full max-w-xl space-y-8 rounded-[2rem] border border-border/70 bg-surface/95 p-8 shadow-[0_24px_80px_var(--brand-shadow-soft)] backdrop-blur md:p-10">
        <div className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-foreground-muted">
            Welcome to Spinlist
          </p>
          <div className="space-y-3">
            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              {showInvalidState
                ? "That confirmation link is no longer valid"
                : showLoginRecoveryState
                  ? "Confirm your email before you log in"
                : "Check your email to finish creating your account"}
            </h1>
            <p className="text-base leading-7 text-muted-foreground">
              {showLoginRecoveryState
                ? "Your account is still waiting on email confirmation. We can resend the link so you can finish setting up Spinlist."
                : !showInvalidState &&
                "We just sent you a welcome email with a link to confirm your email address."}
            </p>
            {!showInvalidState && !showLoginRecoveryState ? (
              <p className="text-base leading-7 text-muted-foreground">
                Don&apos;t worry, we promise not to spam you. This is just for
                security.
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:items-center">
          {email ? (
            <ResendConfirmationButton
              email={email}
              initialCooldownSeconds={initialCooldownSeconds}
            />
          ) : null}
          <Button asChild className="sm:min-w-56">
            <Link href="/login">Go to log in</Link>
          </Button>
        </div>

        {!showInvalidState && !showLoginRecoveryState ? (
          <p className="text-center text-sm text-muted-foreground">
            If you do not see the message in a few minutes, check your spam or
            promotions folder.
          </p>
        ) : null}
      </div>
    </AppPage>
  );
}
