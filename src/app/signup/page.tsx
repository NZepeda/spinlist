import { SignUpForm } from "@/features/auth/components/SignUpForm";
import { AppPage } from "@/shared/ui/AppPage";

/**
 * Sign-up page component for user registration.
 * Provides a form for new users to create an account with email, username, and password.
 */
export default function SignUpPage() {
  return (
    <AppPage className="flex min-h-[calc(100dvh-var(--header-height))] justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="text-muted-foreground mt-2">Sign up to get started</p>
        </div>

        <SignUpForm />
      </div>
    </AppPage>
  );
}
