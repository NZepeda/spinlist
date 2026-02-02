export interface LoginState {
  email: string;
  password: string;
  errors: {
    email?: string;
    password?: string;
    general?: string;
  };
  isLoading: boolean;
}

export type LoginAction =
  | { type: "SET_EMAIL"; payload: string }
  | { type: "SET_PASSWORD"; payload: string }
  | { type: "SET_ERROR"; field: keyof LoginState["errors"]; message: string }
  | { type: "CLEAR_ERRORS" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "RESET" };

export const loginInitialState: LoginState = {
  email: "",
  password: "",
  errors: {},
  isLoading: false,
};

/**
 * State reducer for managing login form state.
 */
export function loginReducer(state: LoginState, action: LoginAction): LoginState {
  switch (action.type) {
    case "SET_EMAIL":
      return {
        ...state,
        email: action.payload,
        errors: { ...state.errors, email: undefined },
      };
    case "SET_PASSWORD":
      return {
        ...state,
        password: action.payload,
        errors: { ...state.errors, password: undefined },
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
      return loginInitialState;
    default:
      return state;
  }
}
