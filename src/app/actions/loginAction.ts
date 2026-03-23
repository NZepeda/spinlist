"use server";

import { redirect } from "next/navigation";
import type { AuthActionState } from "@/lib/auth/actionState";
import { getFormDataString } from "@/lib/auth/getFormDataString";
import {
  createUnexpectedAuthActionState,
  mapLoginActionError,
} from "@/lib/auth/mapAuthError";
import { validateLoginActionInput } from "@/lib/auth/schemas/loginSchema";
import { createClient } from "@/lib/supabase/server";

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

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: validatedInput.data.email,
      password: validatedInput.data.password,
    });

    if (error) {
      return mapLoginActionError(error);
    }
  } catch (error) {
    console.error("Error signing in:", error);
    return createUnexpectedAuthActionState();
  }

  redirect("/");
}
