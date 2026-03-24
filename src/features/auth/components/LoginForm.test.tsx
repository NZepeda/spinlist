import { cleanup, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@/shared/test/utils/render";

const useActionStateMock = vi.hoisted(() => vi.fn());

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");

  return {
    ...actual,
    useActionState: useActionStateMock,
  };
});

vi.mock("@/features/auth/actions/loginAction", () => ({
  loginAction: vi.fn(),
}));

import { LoginForm } from "./LoginForm";

describe("LoginForm", () => {
  beforeEach(() => {
    useActionStateMock.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders returned field and form errors", () => {
    useActionStateMock.mockReturnValue([
      {
        fieldErrors: {
          email: "Please enter a valid email",
          password: "Password is required",
        },
        formError: "Invalid email or password",
      },
      vi.fn(),
      false,
    ]);

    render(<LoginForm />);

    expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
    expect(screen.getByText("Please enter a valid email")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("renders a pending submit state while the action is in flight", () => {
    useActionStateMock.mockReturnValue([
      {
        fieldErrors: {},
      },
      vi.fn(),
      true,
    ]);

    render(<LoginForm />);

    expect(
      screen.getByRole("button", { name: "Signing in..." }),
    ).toBeDisabled();
    expect(screen.getByLabelText("Show password")).toBeDisabled();
  });
});
