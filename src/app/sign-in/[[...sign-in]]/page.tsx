import { SignIn } from "@clerk/nextjs";

/**
 * Sign-in page using Clerk's pre-built authentication UI.
 *
 * The [[...sign-in]] catch-all route handles all sign-in related pages:
 * - /sign-in - Main sign-in page
 * - /sign-in/factor-one - First factor authentication
 * - /sign-in/factor-two - Two-factor authentication
 * - /sign-in/sso-callback - SSO callback handling
 *
 * Clerk automatically handles the routing between these pages.
 */
export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
