import { prismaRead } from "@/server/db-read";
import {
  attachPostEngagement,
  getPostPollIds,
  type PostEngagementSummary,
} from "./post-engagement-shape";

export { attachPostEngagement, getPostPollIds, type PostEngagementSummary };

async function getPostViewCountMap(postIds: string[]): Promise<Map<string, number>> {
  const viewCountMap = new Map(postIds.map((postId) => [postId, 0]));
  if (postIds.length === 0) {
    return viewCountMap;
  }

  const viewCounts = await prismaRead.postView.groupBy({
    by: ["postId"],
    where: {
      postId: { in: postIds },
      userId: { not: null },
    },
    _count: { userId: true },
  });

  for (const item of viewCounts) {
    viewCountMap.set(item.postId, item._count.userId);
  }

  return viewCountMap;
}

export async function fetchPostEngagementSummary(
  postIds: string[],
  currentUserId?: string,
  pollIds: string[] = []
): Promise<PostEngagementSummary> {
  const uniquePostIds = [...new Set(postIds)];
  const uniquePollIds = [...new Set(pollIds)];

  const [viewCountMap, userLikes, userReposts, userSaves, userPollVotes] = await Promise.all([
    getPostViewCountMap(uniquePostIds),
    currentUserId && uniquePostIds.length > 0
      ? prismaRead.postLike.findMany({
          where: { postId: { in: uniquePostIds }, userId: currentUserId },
          select: { postId: true },
        })
      : Promise.resolve([]),
    currentUserId && uniquePostIds.length > 0
      ? prismaRead.postRepost.findMany({
          where: { postId: { in: uniquePostIds }, userId: currentUserId },
          select: { postId: true },
        })
      : Promise.resolve([]),
    currentUserId && uniquePostIds.length > 0
      ? prismaRead.savedPost.findMany({
          where: { postId: { in: uniquePostIds }, userId: currentUserId },
          select: { postId: true },
        })
      : Promise.resolve([]),
    currentUserId && uniquePollIds.length > 0
      ? prismaRead.pollVote.findMany({
          where: { pollId: { in: uniquePollIds }, userId: currentUserId },
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
