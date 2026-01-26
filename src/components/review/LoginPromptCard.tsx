import Link from "next/link";
import { Button } from "@/components/ui-core/button";

/**
 * Card component prompting unauthenticated users to log in or sign up to leave a review.
 * Displays call-to-action buttons linking to authentication pages.
 */
export function LoginPromptCard() {
  return (
    <div className="border rounded-lg p-8 bg-card text-center space-y-4">
      <p className="text-lg font-medium">Login or Sign up to review</p>
      <div className="flex gap-3 justify-center">
        <Button variant="outline" asChild>
          <Link href="/login">Log in</Link>
        </Button>
        <Button asChild>
          <Link href="/signup">Sign up</Link>Å
        </Button>
      </div>
    </div>
  );
}
