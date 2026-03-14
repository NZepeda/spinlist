import Link from "next/link";
import { Button } from "@/components/ui-core/button";

/**
 * Prompts unauthenticated listeners to sign in before creating an album log.
 */
export function LoginPromptCard() {
  return (
    <div className="space-y-4 rounded-[1.5rem] border border-border/70 bg-card/90 p-6 text-left shadow-[0_18px_50px_oklch(0.15_0.005_50/8%)]">
      <div className="space-y-2">
        <p className="text-lg font-semibold">Log in to rate this album</p>
        <p className="text-sm text-muted-foreground">
          Pick a favorite song, leave a short note, and add your take to the
          community snapshot.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" asChild>
          <Link href="/login">Log in</Link>
        </Button>
        <Button variant="brand" asChild>
          <Link href="/signup">Sign up</Link>
        </Button>
      </div>
    </div>
  );
}
