import { describe, it, expect } from "vitest";
import { loginReducer, loginInitialState, LoginState } from "./loginReducer";

describe("loginReducer", () => {
  describe("SET_EMAIL", () => {
    it("updates the email", () => {
      const state = loginReducer(loginInitialState, {
        type: "SET_EMAIL",
        payload: "user@example.com",
      });
      expect(state.email).toBe("user@example.com");
    });

    it("clears the email error", () => {
      const stateWithError: LoginState = {
        ...loginInitialState,
        errors: { email: "Email is required" },
      };
      const state = loginReducer(stateWithError, {
        type: "SET_EMAIL",
        payload: "user@example.com",
      });
      expect(state.errors.email).toBeUndefined();
    });
  });

  describe("SET_PASSWORD", () => {
    it("updates the password", () => {
      const state = loginReducer(loginInitialState, {
        type: "SET_PASSWORD",
        payload: "secret123",
      });
      expect(state.password).toBe("secret123");
    });

    it("clears the password error", () => {
      const stateWithError: LoginState = {
        ...loginInitialState,
        errors: { password: "Password is required" },
      };
      const state = loginReducer(stateWithError, {
        type: "SET_PASSWORD",
        payload: "secret123",
      });
      expect(state.errors.password).toBeUndefined();
    });
  });

  describe("SET_ERROR", () => {
    it("sets a specific error field", () => {
      const state = loginReducer(loginInitialState, {
        type: "SET_ERROR",
        field: "general",
        message: "Invalid credentials",
      });
      expect(state.errors.general).toBe("Invalid credentials");
    });

    it("preserves existing errors", () => {
      const stateWithError: LoginState = {
        ...loginInitialState,
        errors: { email: "Invalid email" },
      };
      const state = loginReducer(stateWithError, {
        type: "SET_ERROR",
        field: "password",
        message: "Too short",
      });
      expect(state.errors.email).toBe("Invalid email");
      expect(state.errors.password).toBe("Too short");
    });
  });

  describe("CLEAR_ERRORS", () => {
    it("clears all errors", () => {
      const stateWithErrors: LoginState = {
        ...loginInitialState,
        errors: { email: "Bad", password: "Bad", general: "Bad" },
      };
      const state = loginReducer(stateWithErrors, { type: "CLEAR_ERRORS" });
      expect(state.errors).toEqual({});
    });
  });

  describe("SET_LOADING", () => {
    it("sets loading to true", () => {
      const state = loginReducer(loginInitialState, {
        type: "SET_LOADING",
        payload: true,
      });
      expect(state.isLoading).toBe(true);
    });

    it("sets loading to false", () => {
      const loadingState: LoginState = {
        ...loginInitialState,
        isLoading: true,
      };
      const state = loginReducer(loadingState, {
        type: "SET_LOADING",
        payload: false,
      });
      expect(state.isLoading).toBe(false);
    });
  });

  describe("RESET", () => {
    it("resets to initial state", () => {
      const modifiedState: LoginState = {
        email: "user@example.com",
        password: "secret",
        errors: { general: "Error" },
        isLoading: true,
      };
      const state = loginReducer(modifiedState, { type: "RESET" });
      expect(state).toEqual(loginInitialState);
    });
  });
});
