import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

import { logoutAction } from "./logoutAction";

interface MockAuthError {
  message: string;
}

/**
 * Builds a minimal auth client double for logout action tests.
 */
function createMockSupabaseClient() {
  return {
    auth: {
      signOut: vi.fn(() =>
        Promise.resolve({
          error: null as MockAuthError | null,
        }),
      ),
    },
  };
}

/**
 * Asserts that a server action completed via Next.js redirect.
 */
async function expectRedirect(
  actionPromise: Promise<void>,
  destination: string,
) {
  await expect(actionPromise).rejects.toThrow(`NEXT_REDIRECT:${destination}`);
  expect(redirectMock).toHaveBeenCalledWith(destination);
}

describe("logoutAction", () => {
  beforeEach(() => {
    createClientMock.mockReset();
    redirectMock.mockClear();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("redirects to the home page after a successful sign out", async () => {
    const supabaseClient = createMockSupabaseClient();

    createClientMock.mockResolvedValueOnce(supabaseClient);

    await expectRedirect(logoutAction(), "/");

    expect(supabaseClient.auth.signOut).toHaveBeenCalledTimes(1);
  });

  it("throws a stable error when sign out fails", async () => {
    const supabaseClient = createMockSupabaseClient();

    supabaseClient.auth.signOut.mockResolvedValueOnce({
      error: {
        message: "Unable to sign out",
      },
    });
    createClientMock.mockResolvedValueOnce(supabaseClient);

    await expect(logoutAction()).rejects.toThrow("Failed to sign out.");
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
