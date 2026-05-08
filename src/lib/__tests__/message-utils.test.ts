import { describe, expect, it } from "vitest";
import { isMediaUrl } from "../message-utils";

describe("isMediaUrl", () => {
  it("detects supported media URLs", () => {
    expect(isMediaUrl("https://cdn.devlink.ink/uploads/image.webp")).toBe(true);
    expect(isMediaUrl("https://media.tenor.com/example")).toBe(true);
    expect(isMediaUrl("https://example.com/clip.mp4?token=abc")).toBe(true);
  });

  it("rejects plain text and non-media URLs", () => {
    expect(isMediaUrl("hello world")).toBe(false);
    expect(isMediaUrl("https://example.com/page")).toBe(false);
  });
});
