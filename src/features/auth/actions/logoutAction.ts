"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/server/supabase/server";

/**
 * Signs a user out.
 */
export async function logoutAction(): Promise<void> {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error signing out:", error);
    throw new Error("Failed to sign out.", { cause: error });
  }

  redirect("/");
}
