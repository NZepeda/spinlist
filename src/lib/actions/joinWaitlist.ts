"use server";

import { validate as validateEmail } from "email-validator";
import { createClient } from "@/lib/supabase/server";

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
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedEmail) {
    return { success: false, error: "Email is required." };
  }

  if (!validateEmail(trimmedEmail)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("waitlist").insert({
    email: trimmedEmail,
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
