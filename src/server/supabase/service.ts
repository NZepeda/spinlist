import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/server/database";

/**
 * Creates a Supabase client using the service role key.
 * This client bypasses Row Level Security and is intended for trusted server-side
 * operations that run outside of a user request context, such as background jobs.
 */
export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
