import { describe, it, expect } from "vitest";
import { imagesToJson } from "./imagesToJson";

interface TestImage {
  url: string;
  height: number;
  width: number;
}

describe("imagesToJson", () => {
  it("should return the same array reference cast as Json", () => {
    const images: TestImage[] = [
      { url: "https://example.com/img.jpg", height: 640, width: 640 },
    ];
    const result = imagesToJson(images);
    expect(result).toBe(images);
  });

  it("should handle an empty array", () => {
    const result = imagesToJson([]);
    expect(result).toEqual([]);
  });
});
