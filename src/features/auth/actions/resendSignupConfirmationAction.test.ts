import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initialResendConfirmationState } from "@/features/auth/createResendConfirmationState";

const createClientMock = vi.hoisted(() => vi.fn());

vi.mock("@/server/supabase/server", () => ({
  createClient: createClientMock,
}));

vi.mock("@/server/url/getSiteUrl", () => ({
  getSiteUrl: vi.fn(() => Promise.resolve("https://spinlist.example")),
}));

import { resendSignupConfirmationAction } from "./resendSignupConfirmationAction";

/**
 * Builds the auth client contract needed by the resend action.
 */
function createMockSupabaseClient() {
  return {
    auth: {
      resend: vi.fn(() =>
        Promise.resolve({
          error: null,
        }),
      ),
    },
  };
}

/**
 * Creates form data for resend action test cases.
 */
function createFormData(entries: Record<string, string>): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }

  return formData;
}

describe("resendSignupConfirmationAction", () => {
  beforeEach(() => {
    createClientMock.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a form error when the email is missing", async () => {
    const state = await resendSignupConfirmationAction(
      initialResendConfirmationState,
      createFormData({
        email: "",
      }),
    );

    expect(state).toEqual({
      formError: "We could not determine which email to resend to.",
    });
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("returns a generic success message after resending", async () => {
    const supabaseClient = createMockSupabaseClient();

    createClientMock.mockResolvedValueOnce(supabaseClient);

    const state = await resendSignupConfirmationAction(
      initialResendConfirmationState,
      createFormData({
        email: "listener@example.com",
      }),
    );

    expect(supabaseClient.auth.resend).toHaveBeenCalledWith({
      type: "signup",
      email: "listener@example.com",
      options: {
        emailRedirectTo: "https://spinlist.example",
      },
    });
    expect(state).toEqual({
      formSuccess:
        "We sent a fresh confirmation email if that account is still pending.",
    });
  });

  it("returns a generic form error when resend throws unexpectedly", async () => {
    const supabaseClient = createMockSupabaseClient();

    supabaseClient.auth.resend.mockRejectedValueOnce(new Error("Network down"));
    createClientMock.mockResolvedValueOnce(supabaseClient);

    const state = await resendSignupConfirmationAction(
      initialResendConfirmationState,
      createFormData({
        email: "listener@example.com",
      }),
    );

    expect(state).toEqual({
      formError: "Something went wrong. Please try again.",
    });
  });
});
