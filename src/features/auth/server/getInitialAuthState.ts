import type { User } from "@supabase/supabase-js";
import { mapProfileRowToProfile } from "@/server/database/mappers/mapProfileRowToProfile";
import { logServerError } from "@/server/logging/serverLogger";
import { createClient } from "@/server/supabase/server";
import type { Profile } from "@/shared/types";

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
    logServerError({
      context: {
        workflow: "auth_bootstrap",
      },
      error: userError,
      event: "auth_bootstrap_user_failed",
    });
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
    .from("users")
    .select("id, username, status, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    logServerError({
      context: {
        userId: user.id,
        workflow: "auth_bootstrap",
      },
      error: profileError,
      event: "auth_bootstrap_profile_failed",
    });
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
