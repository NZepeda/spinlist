import { describe, expect, it } from "vitest";
import { redactLog } from "@/monitoring/sentry/redactLog";

describe("redactLog", () => {
  it("redacts sensitive log messages and attributes before they are sent", () => {
    const redactedLog = redactLog({
      attributes: {
        email: "listener@example.com",
        nested: {
          password: "secret123",
        },
        requestId: "req_123",
      },
      level: "info",
      message: "listener@example.com signed in",
    });

    expect(redactedLog).toEqual({
      attributes: {
        email: "[REDACTED]",
        nested: {
          password: "[REDACTED]",
        },
        requestId: "req_123",
      },
      level: "info",
      message: "[REDACTED] signed in",
    });
  });
});
