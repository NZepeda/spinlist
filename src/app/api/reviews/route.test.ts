import { describe, expect, it, vi, beforeEach } from "vitest";

const createClientMock = vi.hoisted(() => vi.fn());

vi.mock("@/server/supabase/server", () => ({
  createClient: createClientMock,
}));

import { DELETE, POST } from "./route";

/**
 * Creates a minimal authenticated Supabase client double for review route tests.
 */
function createMockSupabaseClient() {
  return {
    auth: {
      getUser: vi.fn(() =>
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
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() =>
            Promise.resolve({
              data: {
                status: "pending",
              },
              error: null,
            }),
          ),
        })),
      })),
    })),
  };
}

describe("reviews route participation guard", () => {
  beforeEach(() => {
    createClientMock.mockReset();
  });

  it("rejects pending profiles from saving reviews", async () => {
    createClientMock.mockResolvedValueOnce(createMockSupabaseClient());

    const response = await POST(
      new Request("http://127.0.0.1:3000/api/reviews", {
        body: JSON.stringify({
          albumId: "album-1",
          rating: 4,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      code: "EMAIL_CONFIRMATION_REQUIRED",
      message: "Please confirm your email before logging albums.",
    });
  });

  it("rejects pending profiles from deleting reviews", async () => {
    createClientMock.mockResolvedValueOnce(createMockSupabaseClient());

    const response = await DELETE(
      new Request("http://127.0.0.1:3000/api/reviews?reviewId=review-1", {
        method: "DELETE",
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      code: "EMAIL_CONFIRMATION_REQUIRED",
      message: "Please confirm your email before logging albums.",
    });
  });
});
