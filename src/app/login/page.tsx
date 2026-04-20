import { LoginForm } from "@/features/auth/components/LoginForm";
import { AppPage } from "@/shared/ui/AppPage";

/**
 * Login page component for user authentication.
 * Provides a form for existing users to sign in to their account.
 */
export default function LoginPage() {
  return (
    <AppPage className="flex min-h-[calc(100dvh-var(--header-height))] justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>

        <LoginForm />
      </div>
    </AppPage>
  );
}
