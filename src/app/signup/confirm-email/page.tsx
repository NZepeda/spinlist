import Link from "next/link";
import { Button } from "@/shared/ui/button";

/**
 * Explains the pending-account state after sign-up so listeners know to
 * confirm their email before they can participate.
 */
export default function ConfirmEmailPage() {
  return (
    <div className="app-shell flex min-h-[calc(100dvh-var(--header-height))] justify-center py-8 md:py-14">
      <div className="w-full max-w-xl space-y-8 rounded-[2rem] border border-border/70 bg-surface/95 p-8 shadow-[0_24px_80px_var(--brand-shadow-soft)] backdrop-blur md:p-10">
        <div className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-foreground-muted">
            Welcome to Spinlist
          </p>
          <div className="space-y-3">
            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              Check your email to finish creating your account
            </h1>
            <p className="text-base leading-7 text-muted-foreground">
              We just sent you a welcome email with a link to confirm your
              email address.
            </p>
            <p className="text-base leading-7 text-muted-foreground">
              Don&apos;t worry, we promise not to spam you. This is just for
              security.
            </p>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-border/70 bg-background/70 p-5">
          <p className="text-sm leading-6 text-muted-foreground">
            Once you confirm your email, your Spinlist account will be ready to
            log ratings and reviews. Until then, you can still browse the app.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="sm:min-w-44">
            <Link href="/login">Go to log in</Link>
          </Button>
          <Button asChild variant="outline" className="sm:min-w-44">
            <Link href="/signup">Create another account</Link>
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          If you do not see the message in a few minutes, check your spam or
          promotions folder.
        </p>
      </div>
    </div>
  );
}
