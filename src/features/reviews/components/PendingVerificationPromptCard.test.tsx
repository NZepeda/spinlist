import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/shared/test/utils/render";
import { PendingVerificationPromptCard } from "./PendingVerificationPromptCard";

describe("PendingVerificationPromptCard", () => {
  it("renders the verification message for pending listeners", () => {
    render(<PendingVerificationPromptCard email="listener@example.com" />);

    expect(
      screen.getByText("Confirm your email to rate this album"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Resend confirmation email" }),
    ).toBeInTheDocument();
  });
});
