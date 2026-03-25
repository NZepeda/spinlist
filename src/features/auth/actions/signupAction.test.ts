import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initialAuthActionState } from "@/features/auth/actionState";
import type { AuthActionState } from "@/features/auth/actionState";

const createClientMock = vi.hoisted(() => vi.fn());
const redirectMock = vi.hoisted(() =>
  vi.fn((path: string): never => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
);

vi.mock("@/server/supabase/server", () => ({
  createClient: createClientMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

import { signupAction } from "./signupAction";

interface MockAuthError {
  message: string;
}

/**
 * Builds a minimal auth client double for signup action tests.
 */
function createMockSupabaseClient() {
  return {
    auth: {
      signUp: vi.fn(() =>
        Promise.resolve({
          error: null as MockAuthError | null,
        }),
      ),
    },
  };
}

/**
 * Creates form data for action test cases.
 */
function createFormData(entries: Record<string, string>): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }

  return formData;
}

/**
 * Asserts that a server action completed via Next.js redirect.
 */
async function expectRedirect(
  actionPromise: Promise<AuthActionState>,
  destination: string,
) {
  await expect(actionPromise).rejects.toThrow(`NEXT_REDIRECT:${destination}`);
  expect(redirectMock).toHaveBeenCalledWith(destination);
}

describe("signupAction", () => {
  beforeEach(() => {
    createClientMock.mockReset();
    redirectMock.mockClear();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns field errors when the signup form input is invalid", async () => {
    const state = await signupAction(
      initialAuthActionState,
      createFormData({
        confirmPassword: "mismatch",
        email: "not-an-email",
        password: "short",
        username: "x",
      }),
    );

    expect(state).toEqual({
      fieldErrors: {
        confirmPassword: "Passwords do not match",
        email: "Please enter a valid email",
        password: "Password must be at least 8 characters",
        username:
          "Username must be 3-20 characters (letters, numbers, underscores only)",
      },
    });
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("maps duplicate email failures to the email field", async () => {
    const supabaseClient = createMockSupabaseClient();

    supabaseClient.auth.signUp.mockResolvedValueOnce({
      error: {
        message: "User already registered",
      },
    });
    createClientMock.mockResolvedValueOnce(supabaseClient);

    const state = await signupAction(
      initialAuthActionState,
      createFormData({
        confirmPassword: "secret123",
        email: "user@example.com",
        password: "secret123",
        username: "new_user",
      }),
    );

    expect(state).toEqual({
      fieldErrors: {
        email: "An account with this email already exists",
      },
    });
  });

  it("maps duplicate username failures to the username field", async () => {
    const supabaseClient = createMockSupabaseClient();

    supabaseClient.auth.signUp.mockResolvedValueOnce({
      error: {
        message: "Username already taken",
      },
    });
    createClientMock.mockResolvedValueOnce(supabaseClient);

    const state = await signupAction(
      initialAuthActionState,
      createFormData({
        confirmPassword: "secret123",
        email: "user@example.com",
        password: "secret123",
        username: "new_user",
      }),
    );

    expect(state).toEqual({
      fieldErrors: {
        username: "This username is already taken",
      },
    });
  });

  it("returns a generic form error when sign up throws unexpectedly", async () => {
    const supabaseClient = createMockSupabaseClient();

    supabaseClient.auth.signUp.mockRejectedValueOnce(new Error("Network down"));
    createClientMock.mockResolvedValueOnce(supabaseClient);

    const state = await signupAction(
      initialAuthActionState,
      createFormData({
        confirmPassword: "secret123",
        email: "user@example.com",
        password: "secret123",
        username: "new_user",
      }),
    );

    expect(state).toEqual({
      fieldErrors: {},
      formError: "Something went wrong. Please try again.",
    });
  });

  it("redirects to the confirmation screen after a successful sign up", async () => {
    const supabaseClient = createMockSupabaseClient();

    createClientMock.mockResolvedValueOnce(supabaseClient);

    await expectRedirect(
      signupAction(
        initialAuthActionState,
        createFormData({
          confirmPassword: "secret123",
          email: "user@example.com",
          password: "secret123",
          username: "new_user",
        }),
      ),
      "/signup/confirm-email",
    );

    expect(supabaseClient.auth.signUp).toHaveBeenCalledWith({
      email: "user@example.com",
      options: {
        data: {
          username: "new_user",
        },
      },
      password: "secret123",
    });
  });
});
