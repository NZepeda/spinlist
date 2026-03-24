import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@/shared/test/utils/render";

const useAuthMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: useAuthMock,
}));

import { DesktopNavMenu } from "@/features/navigation/components/DesktopNavMenu";

describe("DesktopNavMenu", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("invokes logout when the authenticated user selects log out", async () => {
    const user = userEvent.setup();
    const logoutMock = vi.fn(async () => {});

    useAuthMock.mockReturnValue({
      isLoading: false,
      logout: logoutMock,
      profile: {
        avatarUrl: null,
        createdAt: "2026-03-23T00:00:00.000Z",
        id: "user-1",
        updatedAt: "2026-03-23T00:00:00.000Z",
        username: "listener",
      },
      user: {
        id: "user-1",
      },
    });

    render(<DesktopNavMenu />);

    await user.click(screen.getByRole("button", { name: "listener" }));
    await user.click(screen.getByText("Log out"));

    expect(logoutMock).toHaveBeenCalledTimes(1);
  });
});
