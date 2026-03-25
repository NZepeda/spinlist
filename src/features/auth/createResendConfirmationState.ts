export interface ResendConfirmationState {
  formError?: string;
  formSuccess?: string;
}

/**
 * Provides the empty action state used before a resend request is attempted.
 */
export const initialResendConfirmationState: ResendConfirmationState = {};

/**
 * Normalizes resend confirmation results into a stable action-state shape.
 */
export function createResendConfirmationState(
  values: ResendConfirmationState,
): ResendConfirmationState {
  return values;
}
