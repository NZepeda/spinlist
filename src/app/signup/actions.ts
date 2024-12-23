"use server";

import { createServerClient } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcrypt";

const SignUpSchema = z
  .object({
    email: z.string().email(),
    username: z.string().min(3),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Server action for signing up a new user.
 *
 * @param formData - The form data from the sign up form.
 * @throws {Error} If the sign up data is invalid or the sign up fails.
 */
export async function signUp(formData: FormData) {
  const supabase = await createServerClient();

  const parsedSignUpData = SignUpSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!parsedSignUpData.success) {
    throw new Error("Invalid sign up data");
  }

  const { email, password, username } = parsedSignUpData.data;

  const hashedPassword = await bcrypt.hash(password, 10);

  const { error: authError } = await supabase.auth.signUp({
    email,
    password: hashedPassword,
    options: {
      data: {
        username,
      },
    },
  });

  if (authError) {
    throw new Error("Failed to sign up");
  }

  revalidatePath("/");
  redirect("/");
}
