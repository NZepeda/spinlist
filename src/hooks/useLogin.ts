import { useReducer } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { loginReducer, loginInitialState } from "./loginReducer";

/**
 * Hook for managing login form state and logic.
 * Handles user authentication with email and password.
 */

export function useLogin() {
  const [state, dispatch] = useReducer(loginReducer, loginInitialState);
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
