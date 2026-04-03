"use server";

import { redirect } from "next/navigation";
import { logWorkflow } from "@/server/logging/logWorkflow";
import { logServerError } from "@/server/logging/serverLogger";
import { createClient } from "@/server/supabase/server";

/**
 * Signs a user out.
 */
export async function logoutAction(): Promise<void> {
  const supabase = await createClient();

  try {
    logWorkflow({
      event: "auth_logout",
      stage: "started",
      workflow: "auth_logout",
    });

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  } catch (error) {
    logServerError({
      context: {
        workflow: "auth_logout",
      },
      error,
      event: "auth_logout_failed",
    });
    throw new Error("Failed to sign out.", { cause: error });
  }

  logWorkflow({
    event: "auth_logout",
    stage: "succeeded",
    workflow: "auth_logout",
  });

  redirect("/");
}
