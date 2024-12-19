import { Button } from "@/components/ui/button";
import { login } from "./actions";

export default function LoginForm() {
  return (
    <form action={login} className="space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          required
          autoComplete="email"
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>

      <Button className="w-full flex justify-center" type="submit">
        Sign In
      </Button>
      <div className="text-sm text-center">
        <a href="/forgot-password" className="text-primary hover:underline">
          Forgot your password?
        </a>
      </div>
      <div className="text-sm text-center">
        Don&apos;t have an account?{" "}
        <a href="/signup" className="text-primary hover:underline">
          Sign up
        </a>
      </div>
    </form>
  );
}
