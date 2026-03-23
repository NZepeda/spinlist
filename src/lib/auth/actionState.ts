/**
 * Describes the field-level errors surfaced by auth form actions.
 */
export interface AuthFieldErrors {
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
}

/**
 * Describes the stable action-state contract returned by auth form actions.
 */
export interface AuthActionState {
  fieldErrors: AuthFieldErrors;
  formError?: string;
}

/**
 * Provides the empty action state used by auth forms before submission.
 */
export const initialAuthActionState: AuthActionState = {
  fieldErrors: {},
};

/**
 * Creates a normalized auth action state from field and form-level failures.
 */
export function createAuthActionState(
  fieldErrors: AuthFieldErrors = {},
  formError?: string,
): AuthActionState {
  if (typeof formError === "string") {
    return {
      fieldErrors,
      formError,
    };
  }

  return {
    fieldErrors,
  };
}
