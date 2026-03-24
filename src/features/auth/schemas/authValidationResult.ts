import type { AuthActionState } from "../actionState";

interface AuthValidationSuccess<T> {
  data: T;
  success: true;
}

interface AuthValidationFailure {
  state: AuthActionState;
  success: false;
}

export type AuthValidationResult<T> =
  | AuthValidationSuccess<T>
  | AuthValidationFailure;
