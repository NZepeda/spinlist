import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";

import { createServerClient } from "@/lib/auth/server";
import { redirect } from "next/navigation";

const isEmailOtpType = (type: string | null): type is EmailOtpType => {
  switch (type) {
    case "signup":
    case "invite":
    case "magiclink":
    case "recovery":
    case "invite":
    case "email_change":
    case "email":
      return true;
    default:
      return false;
  }
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/";

  if (token_hash && isEmailOtpType(type)) {
    const supabase = await createServerClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      // Redirect user to specified redirect URL or root of app
      redirect(next);
    }
  }

  // Redirect the user to an error page with some instructions
  redirect("/error");
}
