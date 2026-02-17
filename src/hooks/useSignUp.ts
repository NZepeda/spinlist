import { useReducer } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { signUpReducer, signUpInitialState } from "./signUpReducer";

/**
 * Hook for managing sign-up form state and logic.
 * Handles user registration with email/password and profile creation.
 */

export function useSignUp() {
  const [state, dispatch] = useReducer(signUpReducer, signUpInitialState);
  const router = useRouter();
  const supabase = createClient();

  const setEmail = (email: string) =>
    dispatch({ type: "SET_EMAIL", payload: email });

  const setUsername = (username: string) =>
    dispatch({ type: "SET_USERNAME", payload: username });

  const setPassword = (password: string) =>
    dispatch({ type: "SET_PASSWORD", payload: password });

  const setConfirmPassword = (confirmPassword: string) =>
    dispatch({ type: "SET_CONFIRM_PASSWORD", payload: confirmPassword });

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

    // Username validation
    if (!state.username) {
      dispatch({
        type: "SET_ERROR",
        field: "username",
        message: "Username is required",
      });
      isValid = false;
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(state.username)) {
      dispatch({
        type: "SET_ERROR",
        field: "username",
        message:
          "Username must be 3-20 characters (letters, numbers, underscores only)",
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
    } else if (state.password.length < 8) {
      dispatch({
        type: "SET_ERROR",
        field: "password",
        message: "Password must be at least 8 characters",
      });
      isValid = false;
    }

    // Confirm password validation
    if (!state.confirmPassword) {
      dispatch({
        type: "SET_ERROR",
        field: "confirmPassword",
        message: "Please confirm your password",
      });
      isValid = false;
    } else if (state.password !== state.confirmPassword) {
      dispatch({
        type: "SET_ERROR",
        field: "confirmPassword",
        message: "Passwords do not match",
      });
      isValid = false;
    }

    return isValid;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });

    try {
      // Sign up the user with username in metadata
      // The database trigger will automatically create the profile
      const { error: authError } = await supabase.auth.signUp({
        email: state.email,
        password: state.password,
        options: {
          data: {
            username: state.username,
          },
        },
      });

      if (authError) {
        // Handle specific auth errors
        if (authError.message.includes("already registered")) {
          dispatch({
            type: "SET_ERROR",
            field: "email",
            message: "An account with this email already exists",
          });
        } else if (authError.message.includes("Username already taken")) {
          dispatch({
            type: "SET_ERROR",
            field: "username",
            message: "This username is already taken",
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

      // Redirect to home page (user is automatically logged in)
      router.push("/");
    } catch (error) {
      console.log({ error });
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
    username: state.username,
    password: state.password,
    confirmPassword: state.confirmPassword,
    errors: state.errors,
    isLoading: state.isLoading,
    setEmail,
    setUsername,
    setPassword,
    setConfirmPassword,
    handleSignUp,
  };
}
