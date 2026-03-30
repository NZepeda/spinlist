"use server";

import { getFormDataString } from "@/features/auth/getFormDataString";
import {
  createResendConfirmationState,
  type ResendConfirmationState,
} from "@/features/auth/createResendConfirmationState";
import { createClient } from "@/server/supabase/server";
import { getSiteUrl } from "@/server/url/getSiteUrl";

const GENERIC_RESEND_SUCCESS_MESSAGE =
  "We sent a fresh confirmation email if that account is still pending.";

/**
 * Resends the signup confirmation email.
 */
export async function resendSignupConfirmationAction(
  previousState: ResendConfirmationState,
  formData: FormData,
): Promise<ResendConfirmationState> {
  void previousState;

  const email = getFormDataString(formData, "email").trim();

  if (email.length === 0) {
    return createResendConfirmationState({
      formError: "We could not determine which email to resend to.",
    });
  }

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  try {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: siteUrl,
      },
    });

    if (error) {
      console.error("Error resending signup confirmation:", error);
      return createResendConfirmationState({
        formError: "Something went wrong. Please try again.",
      });
    }
  } catch (error) {
    console.error("Error resending signup confirmation:", error);
    return createResendConfirmationState({
      formError: "Something went wrong. Please try again.",
    });
  }

  return createResendConfirmationState({
    formSuccess: GENERIC_RESEND_SUCCESS_MESSAGE,
  });
}
