import type { User } from "@supabase/supabase-js";
import { mapProfileRowToProfile } from "@/lib/mappers/db/mapProfileRowToProfile";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/**
 * Captures the server-derived auth state needed to bootstrap the app shell.
 */
export interface InitialAuthState {
  profile: Profile | null;
  user: User | null;
}

/**
 * Reads the current auth session and minimal profile data on the server.
 */
export async function getInitialAuthState(): Promise<InitialAuthState> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Error reading initial auth user:", userError);
    return {
      profile: null,
      user: null,
    };
  }

  if (user === null) {
    return {
      profile: null,
      user: null,
    };
  }

  const { data: profileRow, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Error reading initial auth profile:", profileError);
    return {
      profile: null,
      user,
    };
  }

  return {
    profile: profileRow ? mapProfileRowToProfile(profileRow) : null,
    user,
  };
}
