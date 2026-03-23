"use client";

import type { User } from "@supabase/supabase-js";
import { cleanup, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DesktopNavMenu } from "@/components/DesktopNavMenu";
import type { Profile } from "@/lib/types";
import { AuthProvider } from "./useAuth";
import { render } from "@/test/utils/render";

const createClientMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase/client", () => ({
  createClient: createClientMock,
}));

/**
 * Builds a canonical authenticated user for provider bootstrap tests.
 */
function createUser(): User {
  return {
    app_metadata: {
      provider: "email",
      providers: ["email"],
    },
    aud: "authenticated",
    created_at: "2026-03-23T00:00:00.000Z",
    email: "listener@example.com",
    id: "user-1",
    phone: "",
    role: "authenticated",
    updated_at: "2026-03-23T00:00:00.000Z",
    user_metadata: {},
  } as User;
}

/**
 * Builds the profile record required by the auth shell.
 */
function createProfile(): Profile {
  return {
    avatarUrl: null,
    createdAt: "2026-03-23T00:00:00.000Z",
    id: "user-1",
    updatedAt: "2026-03-23T00:00:00.000Z",
    username: "listener",
  };
}

/**
 * Creates the minimal browser auth client used by the provider tests.
 */
function createMockSupabaseClient() {
  return {
    auth: {
      getSession: vi.fn(() =>
        Promise.resolve({
          data: {
            session: null,
          },
          error: null,
        }),
      ),
      onAuthStateChange: vi.fn(() => ({
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      })),
      signOut: vi.fn(() =>
        Promise.resolve({
          error: null,
        }),
      ),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({
              data: null,
              error: null,
            }),
          ),
        })),
      })),
    })),
  };
}

/**
 * Renders a representative auth-aware shell with bootstrap state.
 */
function renderDesktopNav(options?: {
  initialProfile?: Profile | null;
  initialUser?: User | null;
}) {
  return render(
    <AuthProvider
      initialProfile={options?.initialProfile}
      initialUser={options?.initialUser}
    >
      <DesktopNavMenu />
    </AuthProvider>,
  );
}

describe("AuthProvider bootstrap", () => {
  beforeEach(() => {
    createClientMock.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders the authenticated desktop nav immediately from bootstrap state", () => {
    const supabaseClient = createMockSupabaseClient();

    createClientMock.mockReturnValue(supabaseClient);

    renderDesktopNav({
      initialProfile: createProfile(),
      initialUser: createUser(),
    });

    expect(
      screen.getByRole("button", { name: "listener" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Log in" }),
    ).not.toBeInTheDocument();
    expect(supabaseClient.from).not.toHaveBeenCalled();
  });

  it("renders the anonymous desktop nav immediately when no bootstrap user exists", () => {
    const supabaseClient = createMockSupabaseClient();

    createClientMock.mockReturnValue(supabaseClient);

    renderDesktopNav();

    expect(screen.getByRole("link", { name: "Log in" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign up" })).toBeInTheDocument();
  });
});
