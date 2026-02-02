import { describe, it, expect } from "vitest";
import { getImageUrl } from "./getImageUrl";

interface TestImage {
  url: string;
  height: number;
  width: number;
}

const mockImages: TestImage[] = [
  { url: "https://example.com/large.jpg", height: 640, width: 640 },
  { url: "https://example.com/medium.jpg", height: 300, width: 300 },
  { url: "https://example.com/small.jpg", height: 64, width: 64 },
];

describe("getImageUrl", () => {
  it("should return the large image by default", () => {
    expect(getImageUrl(mockImages)).toBe("https://example.com/large.jpg");
  });

  it("should return the medium image when requested", () => {
    expect(getImageUrl(mockImages, "medium")).toBe(
      "https://example.com/medium.jpg",
    );
  });

  it("should return the small image when requested", () => {
    expect(getImageUrl(mockImages, "small")).toBe(
      "https://example.com/small.jpg",
    );
  });

  it("should return null for an empty array", () => {
    expect(getImageUrl([])).toBeNull();
  });

  it("should return null for undefined/null input", () => {
    expect(getImageUrl(null as unknown as TestImage[])).toBeNull();
  });

  it("should fall back to the first image if the requested size is missing", () => {
    const singleImage: TestImage[] = [
      { url: "https://example.com/only.jpg", height: 640, width: 640 },
    ];
    expect(getImageUrl(singleImage, "small")).toBe(
      "https://example.com/only.jpg",
    );
  });
});
