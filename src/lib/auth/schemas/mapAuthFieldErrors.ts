import type { AuthFieldErrors } from "../actionState";

/**
 * Normalizes auth field errors down to the first message per field.
 */
export function mapAuthFieldErrors(fieldErrors: {
  email?: string[];
  username?: string[];
  password?: string[];
  confirmPassword?: string[];
}): AuthFieldErrors {
  return {
    email: fieldErrors.email?.[0],
    username: fieldErrors.username?.[0],
    password: fieldErrors.password?.[0],
    confirmPassword: fieldErrors.confirmPassword?.[0],
  };
}
