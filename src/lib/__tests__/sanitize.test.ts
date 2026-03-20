import { describe, it, expect } from "vitest";
import { sanitizeContent, sanitizePlainText, sanitizeLocation } from "../sanitize";

describe("sanitizeContent", () => {
  it("allows basic formatting tags", () => {
    const input = "<b>bold</b> and <i>italic</i> text";
    const result = sanitizeContent(input);
    expect(result).toContain("<b>bold</b>");
    expect(result).toContain("<i>italic</i>");
  });

  it("allows links with safe attributes", () => {
    const input = '<a href="https://example.com">link</a>';
    const result = sanitizeContent(input);
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain("link");
  });

  it("removes script tags", () => {
    const input = '<script>alert("xss")</script><p>safe</p>';
    const result = sanitizeContent(input);
    expect(result).not.toContain("script");
    expect(result).toContain("<p>safe</p>");
  });

  it("removes javascript: URLs", () => {
    const input = '<a href="javascript:alert(1)">click</a>';
    const result = sanitizeContent(input);
    expect(result).not.toContain("javascript:");
  });

  it("removes dangerous event handlers", () => {
    const input = '<div onclick="alert(1)">test</div>';
    const result = sanitizeContent(input);
    expect(result).not.toContain("onclick");
  });

  it("removes dangerous tags like iframe", () => {
    const input = '<iframe src="evil.com"></iframe><p>safe</p>';
    const result = sanitizeContent(input);
    expect(result).not.toContain("iframe");
  });
});

describe("sanitizePlainText", () => {
  it("removes all HTML tags", () => {
    const input = "<p>hello</p><b>world</b>";
    const result = sanitizePlainText(input);
    expect(result).toBe("helloworld");
  });
});

describe("sanitizeLocation", () => {
  it("removes HTML and trims whitespace", () => {
    const input = "  <b>New York</b>  ";
    const result = sanitizeLocation(input);
    expect(result).toBe("New York");
  });
});
