import { describe, expect, it } from "vitest";

import { parseApplicationStatus, validateApplicationStatusTransition } from "../application-status";

describe("parseApplicationStatus", () => {
  it("accepts known application statuses only", () => {
    expect(parseApplicationStatus("ACCEPTED")).toBe("ACCEPTED");
    expect(parseApplicationStatus("DECLINED")).toBe("DECLINED");
    expect(parseApplicationStatus("PENDING")).toBe("PENDING");
    expect(parseApplicationStatus("HIRED")).toBeNull();
    expect(parseApplicationStatus(null)).toBeNull();
  });
});

describe("validateApplicationStatusTransition", () => {
  it("allows pending applications to be accepted or declined", () => {
    expect(validateApplicationStatusTransition("PENDING", "ACCEPTED")).toEqual({
      ok: true,
      changed: true,
      status: "ACCEPTED",
    });
    expect(validateApplicationStatusTransition("PENDING", "DECLINED")).toEqual({
      ok: true,
      changed: true,
      status: "DECLINED",
    });
  });

  it("treats repeated updates as idempotent", () => {
    expect(validateApplicationStatusTransition("ACCEPTED", "ACCEPTED")).toEqual({
      ok: true,
      changed: false,
      status: "ACCEPTED",
    });
  });

  it("prevents reopening terminal applications", () => {
    expect(validateApplicationStatusTransition("DECLINED", "PENDING")).toEqual({
      ok: false,
      error: "This application is already declined.",
      statusCode: 409,
    });
  });

  it("does not treat pending-to-pending as a meaningful transition", () => {
    expect(validateApplicationStatusTransition("PENDING", "PENDING")).toEqual({
      ok: true,
      changed: false,
      status: "PENDING",
    });
  });
});
