"use server";

import { redirect } from "next/navigation";
import type { AuthActionState } from "@/features/auth/actionState";
import { getFormDataString } from "@/features/auth/getFormDataString";
import {
  createUnexpectedAuthActionState,
  mapSignUpActionError,
} from "@/features/auth/mapAuthError";
import { validateSignUpActionInput } from "@/features/auth/schemas/signupSchema";
import { createClient } from "@/server/supabase/server";
import { getSiteUrl } from "@/server/url/getSiteUrl";

/**
 * Registers a new user to supabase.
 */
export async function signupAction(
  previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  // React's useActionState passes the previous form state as the first argument.
  // This action always returns a complete replacement state, so the current
  // previous value is intentionally unused.
  void previousState;

  const validatedInput = validateSignUpActionInput({
    email: getFormDataString(formData, "email"),
    username: getFormDataString(formData, "username"),
    password: getFormDataString(formData, "password"),
    confirmPassword: getFormDataString(formData, "confirmPassword"),
  });

  if (!validatedInput.success) {
    return validatedInput.state;
  }

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  try {
    console.log("Sign up with emailRedirectTo: ", siteUrl);
    const { error } = await supabase.auth.signUp({
      email: validatedInput.data.email,
      password: validatedInput.data.password,
      options: {
        data: {
          username: validatedInput.data.username,
        },
        emailRedirectTo: siteUrl,
      },
    });

    if (error) {
      return mapSignUpActionError(error);
    }
  } catch (error) {
    console.error("Error signing up:", error);
    return createUnexpectedAuthActionState();
  }

  redirect(
    `/signup/confirm-email?email=${encodeURIComponent(validatedInput.data.email)}`,
  );
}
