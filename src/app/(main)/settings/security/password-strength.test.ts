import { describe, expect, it } from "vitest";
import { getPasswordStrength } from "./password-strength";

describe("getPasswordStrength", () => {
  it("scores password complexity from weak to strong", () => {
    expect(getPasswordStrength("")).toBe(0);
    expect(getPasswordStrength("password")).toBe(2);
    expect(getPasswordStrength("Password1")).toBe(4);
    expect(getPasswordStrength("Password1!")).toBe(5);
  });
});
