import { SignUp } from "@clerk/nextjs";

/**
 * Sign-up page using Clerk's pre-built authentication UI.
 *
 * The [[...sign-up]] catch-all route handles all sign-up related pages:
 * - /sign-up - Main sign-up page
 * - /sign-up/verify-email-address - Email verification
 * - /sign-up/verify-phone-number - Phone verification
 * - /sign-up/sso-callback - SSO callback handling
 *
 * Clerk automatically handles the routing between these pages and email verification flow.
 */
export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}
