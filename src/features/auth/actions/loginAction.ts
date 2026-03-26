"use server";

import { redirect } from "next/navigation";
import type { AuthActionState } from "@/features/auth/actionState";
import { getFormDataString } from "@/features/auth/getFormDataString";
import {
  createUnexpectedAuthActionState,
  mapLoginActionError,
} from "@/features/auth/mapAuthError";
import { validateLoginActionInput } from "@/features/auth/schemas/loginSchema";
import { createClient } from "@/server/supabase/server";

/**
 * Returns whether the auth provider rejected login because the email is unconfirmed.
 */
function isUnconfirmedEmailError(message: string): boolean {
  const normalizedMessage = message.toLowerCase();

  return (
    normalizedMessage.includes("email not confirmed") ||
    normalizedMessage.includes("email_not_confirmed")
  );
}

/**
 * A server action to sign in a user.
 */
export async function loginAction(
  previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  // React's useActionState passes the previous form state as the first argument.
  // This action always returns a complete replacement state, so the current previous value is intentionally unused.
  void previousState;

  const validatedInput = validateLoginActionInput({
    email: getFormDataString(formData, "email"),
    password: getFormDataString(formData, "password"),
  });

  if (!validatedInput.success) {
    return validatedInput.state;
  }

  const supabase = await createClient();
  let redirectDestination: string | null = null;

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: validatedInput.data.email,
      password: validatedInput.data.password,
    });

    if (error) {
      if (isUnconfirmedEmailError(error.message)) {
        redirectDestination = `/signup/confirm-email?status=login&email=${encodeURIComponent(validatedInput.data.email)}`;
      } else {
        return mapLoginActionError(error);
      }
    }
  } catch (error) {
    console.error("Error signing in:", error);
    return createUnexpectedAuthActionState();
  }

  if (redirectDestination) {
    redirect(redirectDestination);
  }

  redirect("/");
}
