import { describe, it, expect } from "vitest";
import { generateSlug } from "./generateSlug";

describe("generateSlug", () => {
  it("should convert a simple name to a slug", () => {
    expect(generateSlug("The National")).toBe("the-national");
  });

  it("should handle special characters", () => {
    expect(generateSlug("AC/DC")).toBe("acdc");
  });

  it("should remove diacritics", () => {
    expect(generateSlug("Björk")).toBe("bjork");
  });

  it("should handle accented characters", () => {
    expect(generateSlug("Café del Mar")).toBe("cafe-del-mar");
  });

  it("should collapse multiple spaces into a single hyphen", () => {
    expect(generateSlug("The   National")).toBe("the-national");
  });

  it("should collapse multiple hyphens", () => {
    expect(generateSlug("rock--and---roll")).toBe("rock-and-roll");
  });

  it("should trim leading and trailing hyphens", () => {
    expect(generateSlug("-hello-")).toBe("hello");
  });

  it("should handle names with numbers", () => {
    expect(generateSlug("Blink 182")).toBe("blink-182");
  });

  it("should handle unicode characters like ñ", () => {
    expect(generateSlug("Año Nuevo")).toBe("ano-nuevo");
  });

  it("should handle empty string", () => {
    expect(generateSlug("")).toBe("");
  });

  it("should handle ampersands and parentheses", () => {
    expect(generateSlug("Simon & Garfunkel (Live)")).toBe(
      "simon-garfunkel-live",
    );
  });
});
