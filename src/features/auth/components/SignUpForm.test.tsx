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

vi.mock("@/features/auth/actions/signupAction", () => ({
  signupAction: vi.fn(),
}));

import { SignUpForm } from "./SignUpForm";

describe("SignUpForm", () => {
  beforeEach(() => {
    useActionStateMock.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders returned signup field errors", () => {
    useActionStateMock.mockReturnValue([
      {
        fieldErrors: {
          confirmPassword: "Passwords do not match",
          username: "This username is already taken",
        },
      },
      vi.fn(),
      false,
    ]);

    render(<SignUpForm />);

    expect(screen.getByText("This username is already taken")).toBeInTheDocument();
    expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
  });

  it("renders a pending submit state while the action is in flight", () => {
    useActionStateMock.mockReturnValue([
      {
        fieldErrors: {},
      },
      vi.fn(),
      true,
    ]);

    render(<SignUpForm />);

    expect(
      screen.getByRole("button", { name: "Creating account..." }),
    ).toBeDisabled();
    expect(screen.getAllByLabelText("Show password")).toHaveLength(2);
    expect(screen.getAllByLabelText("Show password")[0]).toBeDisabled();
    expect(screen.getAllByLabelText("Show password")[1]).toBeDisabled();
  });
});
