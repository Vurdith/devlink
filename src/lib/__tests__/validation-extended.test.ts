import { describe, it, expect } from "vitest";
import { validateUsername, validateEmail, validatePassword, validateId, validateRating } from "../validation";

describe("validateUsername", () => {
  it("accepts valid usernames", () => {
    const result = validateUsername("validuser123");
    expect(result.isValid).toBe(true);
  });

  it("rejects usernames that are too short", () => {
    const result = validateUsername("ab");
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("rejects usernames that are too long", () => {
    const result = validateUsername("a".repeat(31));
    expect(result.isValid).toBe(false);
  });

  it("rejects usernames with special characters", () => {
    const result = validateUsername("user@name");
    expect(result.isValid).toBe(false);
  });

  it("rejects empty usernames", () => {
    const result = validateUsername("");
    expect(result.isValid).toBe(false);
  });
});

describe("validateEmail", () => {
  it("accepts valid emails", () => {
    const result = validateEmail("test@example.com");
    expect(result.isValid).toBe(true);
  });

  it("rejects invalid emails", () => {
    const invalidEmails = ["notanemail", "missing@domain", "@nodomain.com", "spaces in@email.com"];
    for (const email of invalidEmails) {
      const result = validateEmail(email);
      expect(result.isValid).toBe(false);
    }
  });
});

describe("validatePassword", () => {
  it("accepts strong passwords", () => {
    const result = validatePassword("StrongP@ss123");
    expect(result.isValid).toBe(true);
  });

  it("rejects short passwords", () => {
    const result = validatePassword("Short1!");
    expect(result.isValid).toBe(false);
  });

  it("rejects passwords without complexity", () => {
    const result = validatePassword("alllowercase");
    expect(result.isValid).toBe(false);
  });
});

describe("validateId", () => {
  it("accepts valid CUIDs", () => {
    const result = validateId("clh1234567890abcdef");
    expect(result.isValid).toBe(true);
  });

  it("rejects empty IDs", () => {
    const result = validateId("");
    expect(result.isValid).toBe(false);
  });
});

describe("validateRating", () => {
  it("accepts ratings 1-5", () => {
    for (let i = 1; i <= 5; i++) {
      const result = validateRating(i);
      expect(result.isValid).toBe(true);
    }
  });

  it("rejects ratings outside range", () => {
    expect(validateRating(0).isValid).toBe(false);
    expect(validateRating(6).isValid).toBe(false);
    expect(validateRating(-1).isValid).toBe(false);
  });
});
