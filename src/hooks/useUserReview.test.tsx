import { Suspense } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUserReview } from "./useUserReview";

const mockFrom = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "user-123" },
    profile: null,
    isLoading: false,
    logout: vi.fn(),
  }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={null}>{children}</Suspense>
      </QueryClientProvider>
    );
  };
}

function mockSupabaseChain(data: unknown, error: unknown) {
  return {
    single: vi.fn().mockResolvedValue({ data, error }),
    eq: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({ data, error }),
    }),
  };
}

describe("useUserReview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return review data when a review exists", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === "albums") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue(
              mockSupabaseChain({ id: "internal-album-id" }, null),
            ),
          }),
        };
      }

      // table === "reviews"
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue(
              mockSupabaseChain(
                {
                  id: "review-1",
                  user_id: "user-123",
                  album_id: "internal-album-id",
                  rating: 4,
                  review_text: "Great",
                  favorite_track_id: null,
                  created_at: "2024-01-01",
                  updated_at: "2024-01-01",
                },
                null,
              ),
            ),
          }),
        }),
      };
    });

    const { result } = renderHook(
      () => useUserReview({ spotifyAlbumId: "spotify-123" }),
      { wrapper: createWrapper() },
    );

    await vi.waitFor(() => {
      expect(result.current).not.toBeNull();
      expect(result.current.review).toBeDefined();
    });

    expect(result.current.review).toMatchObject({
      id: "review-1",
      rating: 4,
      review_text: "Great",
    });
  });
});
