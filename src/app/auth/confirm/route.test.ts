import { describe, expect, it, vi, beforeEach, Mock } from "vitest";

const createClientMock = vi.hoisted(() => vi.fn());
const activatePendingProfileMock = vi.hoisted(() => vi.fn());

vi.mock("@/server/supabase/server", () => ({
  createClient: createClientMock,
}));

vi.mock("@/features/auth/server/activatePendingProfile", () => ({
  activatePendingProfile: activatePendingProfileMock,
}));

import { GET } from "./route";

interface AuthVerificationResponse {
  data: { user: { id: string } | null };
  error?: Error | null;
}

/**
 * Builds the auth client contract needed by the confirmation route.
 */
function createMockSupabaseClient(): {
  auth: {
    getUser: Mock<() => Promise<AuthVerificationResponse>>;
    verifyOtp: Mock<() => Promise<AuthVerificationResponse>>;
  };
} {
  return {
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({
          data: {
            user: null,
          },
        }),
      ),
      verifyOtp: vi.fn(() =>
        Promise.resolve({
          data: {
            user: {
              id: "user-1",
            },
          },
          error: null,
        }),
      ),
    },
  };
}

describe("auth confirm route", () => {
  beforeEach(() => {
    createClientMock.mockReset();
    activatePendingProfileMock.mockReset();
  });

  it("redirects to the invalid state when the token is missing", async () => {
    const response = await GET(
      new Request("http://127.0.0.1:3000/auth/confirm"),
    );

    expect(response.headers.get("location")).toBe(
      "http://127.0.0.1:3000/signup/confirm-email?status=invalid",
    );
  });

  it("activates the profile and redirects home when verification succeeds", async () => {
    const supabaseClient = createMockSupabaseClient();

    createClientMock.mockResolvedValueOnce(supabaseClient);
    activatePendingProfileMock.mockResolvedValueOnce(true);

    const response = await GET(
      new Request(
        "http://127.0.0.1:3000/auth/confirm?token_hash=abc123&type=email",
      ),
    );

    expect(supabaseClient.auth.verifyOtp).toHaveBeenCalledWith({
      token_hash: "abc123",
      type: "email",
    });
    expect(activatePendingProfileMock).toHaveBeenCalledWith(
      supabaseClient,
      "user-1",
    );
    expect(response.headers.get("location")).toBe(
      "http://127.0.0.1:3000/?confirmed=1",
    );
  });

  it("falls back to the current authenticated user for repeat confirmation clicks", async () => {
    const supabaseClient = createMockSupabaseClient();

    supabaseClient.auth.verifyOtp.mockResolvedValueOnce({
      data: {
        user: null,
      },
      error: new Error("Token has expired or is invalid"),
    });
    supabaseClient.auth.getUser.mockResolvedValueOnce({
      data: {
        user: {
          id: "user-1",
        },
      },
    });
    createClientMock.mockResolvedValueOnce(supabaseClient);
    activatePendingProfileMock.mockResolvedValueOnce(true);

    const response = await GET(
      new Request(
        "http://127.0.0.1:3000/auth/confirm?token_hash=abc123&type=email",
      ),
    );

    expect(response.headers.get("location")).toBe(
      "http://127.0.0.1:3000/?confirmed=1",
    );
  });

  it("redirects to the invalid state when activation cannot complete", async () => {
    const supabaseClient = createMockSupabaseClient();

    createClientMock.mockResolvedValueOnce(supabaseClient);
    activatePendingProfileMock.mockResolvedValueOnce(false);

    const response = await GET(
      new Request(
        "http://127.0.0.1:3000/auth/confirm?token_hash=abc123&type=email",
      ),
    );

    expect(response.headers.get("location")).toBe(
      "http://127.0.0.1:3000/signup/confirm-email?status=invalid",
    );
  });

  it("preserves the email address when redirecting to the invalid state", async () => {
    const response = await GET(
      new Request(
        "http://127.0.0.1:3000/auth/confirm?email=listener%40example.com",
      ),
    );

    expect(response.headers.get("location")).toBe(
      "http://127.0.0.1:3000/signup/confirm-email?status=invalid&email=listener%40example.com",
    );
  });
});
