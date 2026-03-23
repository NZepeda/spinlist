import { z } from "zod";

const waitlistEmailSchema = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .email("Please enter a valid email address.")
  .transform((value) => value.toLowerCase());

export type WaitlistEmailValidationResult =
  | {
      success: true;
      email: string;
    }
  | {
      success: false;
      error: string;
    };

/**
 * Keeps waitlist email validation consistent across client and server boundaries.
 */
export function validateWaitlistEmail(
  value: string,
): WaitlistEmailValidationResult {
  const parsedEmail = waitlistEmailSchema.safeParse(value);

  if (!parsedEmail.success) {
    return {
      success: false,
      error:
        parsedEmail.error.issues[0]?.message ??
        "Please enter a valid email address.",
    };
  }

  return {
    success: true,
    email: parsedEmail.data,
  };
}
