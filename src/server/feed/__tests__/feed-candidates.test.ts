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

  it("can merge multiple secondary candidate pools without duplicates", () => {
    const result = mergeUniqueFeedCandidates(
      [{ id: "global-1", source: "global" }],
      [
        { id: "followed-1", source: "followed" },
        { id: "shared", source: "followed" },
      ],
      [
        { id: "shared", source: "interest" },
        { id: "interest-1", source: "interest" },
      ]
    );

    expect(result).toEqual([
      { id: "global-1", source: "global" },
      { id: "followed-1", source: "followed" },
      { id: "shared", source: "followed" },
      { id: "interest-1", source: "interest" },
    ]);
  });
});
