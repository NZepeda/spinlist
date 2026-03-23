import { SignUpForm } from "./SignUpForm";

/**
 * Sign-up page component for user registration.
 * Provides a form for new users to create an account with email, username, and password.
 */
export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="text-muted-foreground mt-2">Sign up to get started</p>
        </div>

        <SignUpForm />
      </div>
    </div>
  );
}
