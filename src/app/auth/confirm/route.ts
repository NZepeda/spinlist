import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { activatePendingProfile } from "@/features/auth/server/activatePendingProfile";
import { createClient } from "@/server/supabase/server";

const INVALID_CONFIRMATION_STATUS = "invalid";

/**
 * Returns the pending-account screen URL for invalid or unusable confirmation links.
 */
function createInvalidConfirmationUrl(request: Request): URL {
  const requestUrl = new URL(request.url);
  const invalidUrl = new URL("/signup/confirm-email", request.url);
  invalidUrl.searchParams.set("status", INVALID_CONFIRMATION_STATUS);
  const email = requestUrl.searchParams.get("email");

  if (email) {
    invalidUrl.searchParams.set("email", email);
  }

  return invalidUrl;
}

/**
 * Returns the success destination used after a profile is activated.
 */
function createConfirmedHomeUrl(request: Request): URL {
  const confirmedUrl = new URL("/", request.url);
  confirmedUrl.searchParams.set("confirmed", "1");
  return confirmedUrl;
}

/**
 * Narrows the incoming auth type down to the email confirmation flow supported by this route.
 */
function isEmailConfirmationType(type: string | null): type is EmailOtpType {
  return type === "email";
}

/**
 * Completes email confirmation, activates the pending profile, and redirects into the app.
 *
 * If the user verification succeeds, the user is routed to the home page with a confirmed status.
 * Otherwise, they are sent back to the confirm email page with an invalid error.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  // The token has is derived from the email that is sent to the user.
  // The user clicks the link which contains the token hands and lands here.
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");

  if (!tokenHash || !isEmailConfirmationType(type)) {
    return NextResponse.redirect(createInvalidConfirmationUrl(request));
  }

  const supabase = await createClient();

  // Verifies the user in the Authentication table.
  const { data: verificationData, error: verificationError } =
    await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

  const verifiedUser = verificationData.user;

  if (verificationError || verifiedUser === null) {
    // If the verification failed, it's possible that the user has already been verified.
    // Check for verification.
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (currentUser) {
      const alreadyActive = await activatePendingProfile(
        supabase,
        currentUser.id,
      );

      if (alreadyActive) {
        return NextResponse.redirect(createConfirmedHomeUrl(request));
      }
    }

    return NextResponse.redirect(createInvalidConfirmationUrl(request));
  }

  // Mark the user profile as "active"
  const didActivateProfile = await activatePendingProfile(
    supabase,
    verifiedUser.id,
  );

  if (!didActivateProfile) {
    return NextResponse.redirect(createInvalidConfirmationUrl(request));
  }

  return NextResponse.redirect(createConfirmedHomeUrl(request));
}
