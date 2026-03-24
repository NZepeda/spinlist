import { describe, it, expect } from "vitest";
import { isId } from "./isId";

describe("isId", () => {
  describe("Spotify IDs", () => {
    it("should recognize a valid 22-char Spotify ID", () => {
      expect(isId("4Z8W4fKeB5YxbusRsdQVPb")).toBe(true);
    });

    it("should reject a string shorter than 22 characters", () => {
      expect(isId("4Z8W4fKeB5Yxbus")).toBe(false);
    });

    it("should reject a string longer than 22 characters", () => {
      expect(isId("4Z8W4fKeB5YxbusRsdQVPbX")).toBe(false);
    });

    it("should reject a 22-char string with special characters", () => {
      expect(isId("4Z8W4fKeB5Yxbus-sdQVPb")).toBe(false);
    });
  });

  describe("UUIDs", () => {
    it("should recognize a valid UUID", () => {
      expect(isId("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    });

    it("should recognize UUIDs with uppercase hex digits", () => {
      expect(isId("550E8400-E29B-41D4-A716-446655440000")).toBe(true);
    });

    it("should reject a malformed UUID", () => {
      expect(isId("550e8400-e29b-41d4-a716")).toBe(false);
    });
  });

  describe("slugs", () => {
    it("should return false for a simple slug", () => {
      expect(isId("turnstile")).toBe(false);
    });

    it("should return false for a slug with hyphens", () => {
      expect(isId("the-national")).toBe(false);
    });

    it("should return false for a slug with numbers", () => {
      expect(isId("blink-182")).toBe(false);
    });
  });
});
