"use server";

import { createClient } from "@/lib/supabase/server";
import { validateWaitlistEmail } from "@/lib/waitlist/validateWaitlistEmail";

interface JoinWaitlistResult {
  success: boolean;
  error?: string;
}

/**
 * Server action to add an email to the waitlist.
 * Handles duplicate emails gracefully by returning success.
 *
 * @param email - The email address to add to the waitlist
 * @returns Object indicating success or failure with optional error message
 */
export async function joinWaitlist(email: string): Promise<JoinWaitlistResult> {
  const validatedEmail = validateWaitlistEmail(email);

  if (!validatedEmail.success) {
    return { success: false, error: validatedEmail.error };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("waitlist").insert({
    email: validatedEmail.email,
  });

  if (error) {
    // Handle unique constraint violation (email already exists)
    if (error.code === "23505") {
      return { success: true };
    }

    console.error("Waitlist insert error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }

  return { success: true };
}
