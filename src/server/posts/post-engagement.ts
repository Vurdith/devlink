import { getUniqueViewCounts } from "@/lib/view-utils";
import { prisma } from "@/server/db";
import {
  attachPostEngagement,
  getPostPollIds,
  type PostEngagementSummary,
} from "./post-engagement-shape";

export { attachPostEngagement, getPostPollIds, type PostEngagementSummary };

export async function fetchPostEngagementSummary(
  postIds: string[],
  currentUserId?: string,
  pollIds: string[] = []
): Promise<PostEngagementSummary> {
  const [viewCountMap, userLikes, userReposts, userSaves, userPollVotes] = await Promise.all([
    getUniqueViewCounts(postIds),
    currentUserId
      ? prisma.postLike.findMany({
          where: { postId: { in: postIds }, userId: currentUserId },
          select: { postId: true },
        })
      : Promise.resolve([]),
    currentUserId
      ? prisma.postRepost.findMany({
          where: { postId: { in: postIds }, userId: currentUserId },
          select: { postId: true },
        })
      : Promise.resolve([]),
    currentUserId
      ? prisma.savedPost.findMany({
          where: { postId: { in: postIds }, userId: currentUserId },
          select: { postId: true },
        })
      : Promise.resolve([]),
    currentUserId && pollIds.length > 0
      ? prisma.pollVote.findMany({
          where: { pollId: { in: pollIds }, userId: currentUserId },
          select: { optionId: true },
        })
      : Promise.resolve([]),
  ]);

  return {
    viewCountMap,
    likedPostIds: new Set(userLikes.map((like) => like.postId)),
    repostedPostIds: new Set(userReposts.map((repost) => repost.postId)),
    savedPostIds: new Set(userSaves.map((save) => save.postId)),
    votedOptionIds: new Set(userPollVotes.map((vote) => vote.optionId)),
  };
}
