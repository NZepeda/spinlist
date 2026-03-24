import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@/shared/test/utils/render";

const useAuthMock = vi.hoisted(() => vi.fn());
const searchBarMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: useAuthMock,
}));

vi.mock("@/features/search/components/SearchBar", () => ({
  SearchBar: searchBarMock,
}));

import { Navbar } from "./Navbar";

describe("Navbar", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
    searchBarMock.mockImplementation(
      ({ variant = "compact" }: { variant?: "compact" | "hero" }) => {
        return <div data-testid={`search-bar-${variant}`}>{variant}</div>;
      },
    );
    useAuthMock.mockReturnValue({
      isLoading: false,
      logout: vi.fn(async () => {}),
      profile: null,
      user: null,
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows the mobile menu content when the user opens the menu", async () => {
    const user = userEvent.setup();

    render(<Navbar />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    expect(screen.getByText("Welcome to Spinlist")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Log in" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign up" })).toBeInTheDocument();
  });

  it("shows authenticated account content inside the mobile menu", async () => {
    const user = userEvent.setup();

    useAuthMock.mockReturnValue({
      isLoading: false,
      logout: vi.fn(async () => {}),
      profile: {
        username: "listener",
      },
      user: {
        id: "user-1",
      },
    });

    render(<Navbar />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    expect(screen.getByText("@listener")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument();
  });
});
