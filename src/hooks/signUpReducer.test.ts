import { describe, it, expect } from "vitest";
import {
  signUpReducer,
  signUpInitialState,
  SignUpState,
} from "./signUpReducer";

describe("signUpReducer", () => {
  describe("SET_EMAIL", () => {
    it("updates the email and clears the email error", () => {
      const stateWithError: SignUpState = {
        ...signUpInitialState,
        errors: { email: "Required" },
      };
      const state = signUpReducer(stateWithError, {
        type: "SET_EMAIL",
        payload: "user@example.com",
      });
      expect(state.email).toBe("user@example.com");
      expect(state.errors.email).toBeUndefined();
    });
  });

  describe("SET_USERNAME", () => {
    it("updates the username and clears the username error", () => {
      const stateWithError: SignUpState = {
        ...signUpInitialState,
        errors: { username: "Required" },
      };
      const state = signUpReducer(stateWithError, {
        type: "SET_USERNAME",
        payload: "john_doe",
      });
      expect(state.username).toBe("john_doe");
      expect(state.errors.username).toBeUndefined();
    });
  });

  describe("SET_PASSWORD", () => {
    it("updates the password and clears the password error", () => {
      const stateWithError: SignUpState = {
        ...signUpInitialState,
        errors: { password: "Too short" },
      };
      const state = signUpReducer(stateWithError, {
        type: "SET_PASSWORD",
        payload: "newpassword123",
      });
      expect(state.password).toBe("newpassword123");
      expect(state.errors.password).toBeUndefined();
    });
  });

  describe("SET_CONFIRM_PASSWORD", () => {
    it("updates confirmPassword and clears its error", () => {
      const stateWithError: SignUpState = {
        ...signUpInitialState,
        errors: { confirmPassword: "Passwords do not match" },
      };
      const state = signUpReducer(stateWithError, {
        type: "SET_CONFIRM_PASSWORD",
        payload: "newpassword123",
      });
      expect(state.confirmPassword).toBe("newpassword123");
      expect(state.errors.confirmPassword).toBeUndefined();
    });
  });

  describe("SET_ERROR", () => {
    it("sets a specific error and preserves others", () => {
      const stateWithError: SignUpState = {
        ...signUpInitialState,
        errors: { email: "Invalid" },
      };
      const state = signUpReducer(stateWithError, {
        type: "SET_ERROR",
        field: "username",
        message: "Already taken",
      });
      expect(state.errors.email).toBe("Invalid");
      expect(state.errors.username).toBe("Already taken");
    });
  });

  describe("CLEAR_ERRORS", () => {
    it("clears all errors", () => {
      const stateWithErrors: SignUpState = {
        ...signUpInitialState,
        errors: {
          email: "Bad",
          username: "Bad",
          password: "Bad",
          confirmPassword: "Bad",
          general: "Bad",
        },
      };
      const state = signUpReducer(stateWithErrors, { type: "CLEAR_ERRORS" });
      expect(state.errors).toEqual({});
    });
  });

  describe("SET_LOADING", () => {
    it("sets loading to true and false", () => {
      const state = signUpReducer(signUpInitialState, {
        type: "SET_LOADING",
        payload: true,
      });
      expect(state.isLoading).toBe(true);

      const stateOff = signUpReducer(state, {
        type: "SET_LOADING",
        payload: false,
      });
      expect(stateOff.isLoading).toBe(false);
    });
  });

  describe("RESET", () => {
    it("resets to initial state", () => {
      const modifiedState: SignUpState = {
        email: "user@example.com",
        username: "john",
        password: "secret",
        confirmPassword: "secret",
        errors: { general: "Error" },
        isLoading: true,
      };
      const state = signUpReducer(modifiedState, { type: "RESET" });
      expect(state).toEqual(signUpInitialState);
    });
  });
});
