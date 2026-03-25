import Link from "next/link";
import { ResendConfirmationButton } from "@/features/auth/components/ResendConfirmationButton";
import { Button } from "@/shared/ui/button";

interface ConfirmEmailPageProps {
  searchParams: Promise<{
    email?: string;
    status?: string;
  }>;
}

/**
 * Returns whether the page should show the invalid-link recovery state.
 */
function isInvalidConfirmationState(status?: string): boolean {
  return status === "invalid";
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
  const showInvalidState = isInvalidConfirmationState(
    resolvedSearchParams.status,
  );

  return (
    <div className="app-shell flex min-h-[calc(100dvh-var(--header-height))] justify-center py-8 md:py-14">
      <div className="w-full max-w-xl space-y-8 rounded-[2rem] border border-border/70 bg-surface/95 p-8 shadow-[0_24px_80px_var(--brand-shadow-soft)] backdrop-blur md:p-10">
        <div className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-foreground-muted">
            Welcome to Spinlist
          </p>
          <div className="space-y-3">
            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              {showInvalidState
                ? "That confirmation link is no longer valid"
                : "Check your email to finish creating your account"}
            </h1>
            <p className="text-base leading-7 text-muted-foreground">
              {!showInvalidState &&
                "We just sent you a welcome email with a link to confirm your email address."}
            </p>
            {!showInvalidState ? (
              <p className="text-base leading-7 text-muted-foreground">
                Don&apos;t worry, we promise not to spam you. This is just for
                security.
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:items-center">
          {email ? <ResendConfirmationButton email={email} /> : null}
          <Button asChild className="sm:min-w-56">
            <Link href="/login">Go to log in</Link>
          </Button>
        </div>

        {!showInvalidState ? (
          <p className="text-center text-sm text-muted-foreground">
            If you do not see the message in a few minutes, check your spam or
            promotions folder.
          </p>
        ) : null}
      </div>
    </div>
  );
}
