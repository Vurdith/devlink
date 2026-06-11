import { describe, expect, it } from "vitest";

import { mergeUniqueFeedCandidates } from "../feed-candidates";

describe("mergeUniqueFeedCandidates", () => {
  it("keeps primary candidates first and appends unique secondary candidates", () => {
    const result = mergeUniqueFeedCandidates(
      [
        { id: "global-1", source: "global" },
        { id: "shared", source: "global" },
      ],
      [
        { id: "shared", source: "followed" },
        { id: "followed-1", source: "followed" },
      ]
    );

    expect(result).toEqual([
      { id: "global-1", source: "global" },
      { id: "shared", source: "global" },
      { id: "followed-1", source: "followed" },
    ]);
  });
});
