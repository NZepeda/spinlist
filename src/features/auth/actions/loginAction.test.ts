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

import { loginAction } from "./loginAction";

interface MockAuthError {
  message: string;
}

/**
 * Builds a minimal auth client double for login action tests.
 */
function createMockSupabaseClient() {
  return {
    auth: {
      signInWithPassword: vi.fn(() =>
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

describe("loginAction", () => {
  beforeEach(() => {
    createClientMock.mockReset();
    redirectMock.mockClear();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns field errors when the form input is invalid", async () => {
    const state = await loginAction(
      initialAuthActionState,
      createFormData({
        email: "",
        password: "",
      }),
    );

    expect(state).toEqual({
      fieldErrors: {
        email: "Email is required",
        password: "Password is required",
      },
    });
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("maps invalid credentials to a safe form error", async () => {
    const supabaseClient = createMockSupabaseClient();

    supabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
      error: {
        message: "Invalid login credentials",
      },
    });
    createClientMock.mockResolvedValueOnce(supabaseClient);

    const state = await loginAction(
      initialAuthActionState,
      createFormData({
        email: "user@example.com",
        password: "secret123",
      }),
    );

    expect(state).toEqual({
      fieldErrors: {},
      formError: "Invalid email or password",
    });
  });

  it("returns a generic form error when sign in throws unexpectedly", async () => {
    const supabaseClient = createMockSupabaseClient();

    supabaseClient.auth.signInWithPassword.mockRejectedValueOnce(
      new Error("Network down"),
    );
    createClientMock.mockResolvedValueOnce(supabaseClient);

    const state = await loginAction(
      initialAuthActionState,
      createFormData({
        email: "user@example.com",
        password: "secret123",
      }),
    );

    expect(state).toEqual({
      fieldErrors: {},
      formError: "Something went wrong. Please try again.",
    });
  });

  it("redirects to the home page after a successful sign in", async () => {
    const supabaseClient = createMockSupabaseClient();

    createClientMock.mockResolvedValueOnce(supabaseClient);

    await expectRedirect(
      loginAction(
        initialAuthActionState,
        createFormData({
          email: "user@example.com",
          password: "secret123",
        }),
      ),
      "/",
    );

    expect(supabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "secret123",
    });
  });
});
