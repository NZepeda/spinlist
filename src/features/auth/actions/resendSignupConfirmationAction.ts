"use server";

import { getFormDataString } from "@/features/auth/getFormDataString";
import {
  createResendConfirmationState,
  type ResendConfirmationState,
} from "@/features/auth/createResendConfirmationState";
import { logWorkflow } from "@/server/logging/logWorkflow";
import { logServerError } from "@/server/logging/serverLogger";
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
    logWorkflow({
      context: {
        reason: "missing_email",
      },
      event: "auth_resend_confirmation",
      stage: "rejected",
      workflow: "auth_resend_confirmation",
    });

    return createResendConfirmationState({
      formError: "We could not determine which email to resend to.",
    });
  }

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  try {
    logWorkflow({
      event: "auth_resend_confirmation",
      stage: "started",
      workflow: "auth_resend_confirmation",
    });

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: siteUrl,
      },
    });

    if (error) {
      logServerError({
        context: {
          workflow: "auth_resend_confirmation",
        },
        error,
        event: "auth_resend_confirmation_failed",
      });
      return createResendConfirmationState({
        formError: "Something went wrong. Please try again.",
      });
    }
  } catch (error) {
    logServerError({
      context: {
        workflow: "auth_resend_confirmation",
      },
      error,
      event: "auth_resend_confirmation_failed",
    });
    return createResendConfirmationState({
      formError: "Something went wrong. Please try again.",
    });
  }

  logWorkflow({
    event: "auth_resend_confirmation",
    stage: "succeeded",
    workflow: "auth_resend_confirmation",
  });

  return createResendConfirmationState({
    formSuccess: GENERIC_RESEND_SUCCESS_MESSAGE,
  });
}
