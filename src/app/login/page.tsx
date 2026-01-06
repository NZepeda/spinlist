import Link from "next/link";

/**
 * Login page component for user authentication.
 * Provides a form for existing users to sign in to their account.
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to your account
          </p>
        </div>

        <div className="space-y-6">
          {/* Login form will be implemented here */}
          <p className="text-muted-foreground text-center">
            Login functionality coming soon...
          </p>

          {/* Link to signup page */}
          <p className="text-muted-foreground text-center text-sm">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
