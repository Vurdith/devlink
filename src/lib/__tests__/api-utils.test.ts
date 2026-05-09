import { describe, expect, it } from "vitest";
import { parseJsonBody } from "../api-utils";

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
