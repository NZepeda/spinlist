import { ResendConfirmationButton } from "@/features/auth/components/ResendConfirmationButton";

interface PendingVerificationPromptCardProps {
  email?: string;
}

/**
 * Explains that email confirmation is required before a listener can add to the community log.
 */
export function PendingVerificationPromptCard({
  email,
}: PendingVerificationPromptCardProps) {
  return (
    <div className="space-y-4 rounded-[1.5rem] border border-border/70 bg-card/95 p-6 text-left shadow-[0_18px_50px_var(--brand-shadow-soft)]">
      <div className="space-y-2">
        <p className="text-lg font-semibold">
          Confirm your email to rate this album
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          Your account is almost ready.
          Verify your email address first, then come back to log ratings,
          favorite songs, and short notes.
        </p>
      </div>
      {email ? (
        <ResendConfirmationButton email={email} initialCooldownSeconds={0} />
      ) : null}
    </div>
  );
}
