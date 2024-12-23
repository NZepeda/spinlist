import { Metadata } from "next";
import SignUpForm from "./SignUpForm";
import { Disc3 } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign Up | The Spinlist",
  description: "Create your Spinlist account",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="flex flex-col items-center space-y-2">
          <Disc3 className="h-12 w-12 text-primary" />
          <h2 className="mt-6 text-3xl font-bold text-center">
            Create an account
          </h2>
          <p className="text-sm text-muted-foreground text-center">
            Sign up to start rating and reviewing albums
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
}
