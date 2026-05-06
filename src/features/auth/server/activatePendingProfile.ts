import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/server/database";

/**
 * Activates a pending user record.
 * Marks the user's account status as "active".
 * Returns true if the user can be considered active.
 */
export async function activatePendingProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<boolean> {
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("status")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || profile === null) {
    return false;
  }

  if (profile.status === "active") {
    return true;
  }

  const { error: updateError } = await supabase
    .from("users")
    .update({
      status: "active",
    })
    .eq("id", userId)
    .eq("status", "pending");

  return updateError === null;
}
