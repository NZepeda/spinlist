import { createAuthActionState, type AuthActionState } from "./actionState";

interface SupabaseAuthErrorDetails {
  message: string;
}

const GENERIC_AUTH_ERROR_MESSAGE =
  "Something went wrong. Please try again.";

/**
 * Maps provider login failures into the stable auth action-state contract.
 */
export function mapLoginActionError(
  error: SupabaseAuthErrorDetails,
): AuthActionState {
  if (error.message.includes("Invalid login credentials")) {
    return createAuthActionState({}, "Invalid email or password");
  }

  return createAuthActionState({}, error.message);
}

/**
 * Maps provider signup failures into the stable auth action-state contract.
 */
export function mapSignUpActionError(
  error: SupabaseAuthErrorDetails,
): AuthActionState {
  if (error.message.includes("already registered")) {
    return createAuthActionState({
      email: "An account with this email already exists",
    });
  }

  if (error.message.includes("Username already taken")) {
    return createAuthActionState({
      username: "This username is already taken",
    });
  }

  return createAuthActionState({}, error.message);
}

/**
 * Provides the generic fallback used when auth actions fail unexpectedly.
 */
export function createUnexpectedAuthActionState(): AuthActionState {
  return createAuthActionState({}, GENERIC_AUTH_ERROR_MESSAGE);
}
