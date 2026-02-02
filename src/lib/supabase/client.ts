import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "../types/database.types";

/**
 * Creates a Supabase client for use in Client Components.
 * This client automatically handles authentication state and session management.
 *
 * @returns Supabase client instance for browser/client-side use
 *
 * @example
 * ```tsx
 * "use client"
 * import { createClient } from "@/lib/supabase/client"
 *
 * export function MyComponent() {
 *   const supabase = createClient()
 *   // Use supabase client...
 * }
 * ```
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
