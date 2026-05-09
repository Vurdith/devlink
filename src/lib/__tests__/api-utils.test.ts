import { describe, expect, it } from "vitest";
import { apiErrorResponse, parseJsonBody, parseJsonObjectBody } from "../api-utils";

describe("parseJsonBody", () => {
  it("returns parsed JSON data", async () => {
    const request = new Request("https://devlink.test/api", {
      method: "POST",
      body: JSON.stringify({ title: "Hello" }),
    });

    const result = await parseJsonBody<{ title: string }>(request);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.title).toBe("Hello");
    }
  });

  it("returns a 400 response for invalid JSON", async () => {
    const request = new Request("https://devlink.test/api", {
      method: "POST",
      body: "{bad json",
    });

    const result = await parseJsonBody(request);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(400);
      await expect(result.response.json()).resolves.toEqual({ error: "Invalid JSON body" });
    }
  });
});

describe("parseJsonObjectBody", () => {
  it("returns parsed object data", async () => {
    const request = new Request("https://devlink.test/api", {
      method: "POST",
      body: JSON.stringify({ allowFrom: "FOLLOWING" }),
    });

    const result = await parseJsonObjectBody<{ allowFrom: string }>(request);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.allowFrom).toBe("FOLLOWING");
    }
  });

  it("rejects JSON arrays", async () => {
    const request = new Request("https://devlink.test/api", {
      method: "POST",
      body: JSON.stringify(["FOLLOWING"]),
    });

    const result = await parseJsonObjectBody(request);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(400);
      await expect(result.response.json()).resolves.toEqual({
        error: "Request body must be a JSON object",
      });
    }
  });
});

describe("apiErrorResponse", () => {
  it("builds the shared error payload shape", async () => {
    const response = apiErrorResponse("Missing postId", 400);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Missing postId" });
  });
});
