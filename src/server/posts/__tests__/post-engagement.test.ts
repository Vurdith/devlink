import { describe, expect, it } from "vitest";
import { attachPostEngagement, type PostEngagementSummary } from "../post-engagement-shape";

function makeSummary(): PostEngagementSummary {
  return {
    viewCountMap: new Map([["post-1", 42]]),
    likedPostIds: new Set(["post-1"]),
    repostedPostIds: new Set(),
    savedPostIds: new Set(["post-1"]),
    votedOptionIds: new Set(["option-2"]),
  };
}

describe("attachPostEngagement", () => {
  it("adds shared engagement flags and normalized poll data", () => {
    const post = {
      id: "post-1",
      content: "What should I build next?",
      poll: {
        id: "poll-1",
        question: "Pick one",
        expiresAt: null,
        isMultiple: false,
        options: [
          { id: "option-1", text: "Plugin", _count: { votes: 2 } },
          { id: "option-2", text: "Game", _count: { votes: 5 } },
        ],
      },
      _count: { replies: 3 },
    };

    expect(attachPostEngagement(post, makeSummary())).toMatchObject({
      views: 42,
      isLiked: true,
      isReposted: false,
      isSaved: true,
      likes: [],
      reposts: [],
      savedBy: [],
      replies: [null, null, null],
      poll: {
        id: "poll-1",
        totalVotes: 7,
        options: [
          { id: "option-1", text: "Plugin", votes: 2, isSelected: false },
          { id: "option-2", text: "Game", votes: 5, isSelected: true },
        ],
      },
    });
  });
});
