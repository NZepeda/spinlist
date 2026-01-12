import { useReducer } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface LoginState {
  email: string;
  password: string;
  errors: {
    email?: string;
    password?: string;
    general?: string;
  };
  isLoading: boolean;
}

type LoginAction =
  | { type: "SET_EMAIL"; payload: string }
  | { type: "SET_PASSWORD"; payload: string }
  | { type: "SET_ERROR"; field: keyof LoginState["errors"]; message: string }
  | { type: "CLEAR_ERRORS" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "RESET" };

const initialState: LoginState = {
  email: "",
  password: "",
  errors: {},
  isLoading: false,
};

function loginReducer(state: LoginState, action: LoginAction): LoginState {
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
      return initialState;
    default:
      return state;
  }
}

/**
 * Hook for managing login form state and logic.
 * Handles user authentication with email and password.
 */

export function useLogin() {
  const [state, dispatch] = useReducer(loginReducer, initialState);
  const router = useRouter();
  const supabase = createClient();

  const setEmail = (email: string) =>
    dispatch({ type: "SET_EMAIL", payload: email });

  const setPassword = (password: string) =>
    dispatch({ type: "SET_PASSWORD", payload: password });

  const validateForm = (): boolean => {
    dispatch({ type: "CLEAR_ERRORS" });
    let isValid = true;

    // Email validation
    if (!state.email) {
      dispatch({
        type: "SET_ERROR",
        field: "email",
        message: "Email is required",
      });
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
      dispatch({
        type: "SET_ERROR",
        field: "email",
        message: "Please enter a valid email",
      });
      isValid = false;
    }

    // Password validation
    if (!state.password) {
      dispatch({
        type: "SET_ERROR",
        field: "password",
        message: "Password is required",
      });
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: state.email,
        password: state.password,
      });

      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
          dispatch({
            type: "SET_ERROR",
            field: "general",
            message: "Invalid email or password",
          });
        } else {
          dispatch({
            type: "SET_ERROR",
            field: "general",
            message: authError.message,
          });
        }
        return;
      }

      router.push("/");
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        field: "general",
        message: "Something went wrong. Please try again.",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  return {
    email: state.email,
    password: state.password,
    errors: state.errors,
    isLoading: state.isLoading,
    setEmail,
    setPassword,
    handleLogin,
  };
}
