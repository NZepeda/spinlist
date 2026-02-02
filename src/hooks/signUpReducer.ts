export interface SignUpState {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  errors: {
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  };
  isLoading: boolean;
}

export type SignUpAction =
  | { type: "SET_EMAIL"; payload: string }
  | { type: "SET_USERNAME"; payload: string }
  | { type: "SET_PASSWORD"; payload: string }
  | { type: "SET_CONFIRM_PASSWORD"; payload: string }
  | { type: "SET_ERROR"; field: keyof SignUpState["errors"]; message: string }
  | { type: "CLEAR_ERRORS" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "RESET" };

export const signUpInitialState: SignUpState = {
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
  errors: {},
  isLoading: false,
};

/**
 * State reducer for managing sign-up form state.
 */
export function signUpReducer(state: SignUpState, action: SignUpAction): SignUpState {
  switch (action.type) {
    case "SET_EMAIL":
      return {
        ...state,
        email: action.payload,
        errors: { ...state.errors, email: undefined },
      };
    case "SET_USERNAME":
      return {
        ...state,
        username: action.payload,
        errors: { ...state.errors, username: undefined },
      };
    case "SET_PASSWORD":
      return {
        ...state,
        password: action.payload,
        errors: { ...state.errors, password: undefined },
      };
    case "SET_CONFIRM_PASSWORD":
      return {
        ...state,
        confirmPassword: action.payload,
        errors: { ...state.errors, confirmPassword: undefined },
      };
    case "SET_ERROR":
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.message },
      };
    case "CLEAR_ERRORS":
      return { ...state, errors: {} };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "RESET":
      return signUpInitialState;
    default:
      return state;
  }
}
