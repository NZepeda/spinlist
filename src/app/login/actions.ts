"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createServerClient } from "@/lib/auth/server";

export async function login(formData: FormData) {
  const supabase = await createServerClient();

  // Todo: Validate inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createServerClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const result = await supabase.auth.signUp(data);

  const { error } = result;

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}
