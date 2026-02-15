import type { RankablePost } from "./devlink-ranking";

export interface FeedPostForRanking {
  id: string;
  userId: string;
  content?: string | null;
  createdAt: Date | string;
  user?: {
    id: string;
    createdAt: Date | string;
    _count?: {
      followers: number;
    };
  };
  // Partial arrays (sampled)
  likes?: Array<{ userId: string | null } | null>;
  reposts?: Array<{ userId: string | null } | null>;
  savedBy?: Array<{ userId: string | null } | null>;
  replies?: Array<{ user?: { id?: string | null } } | null>;
  
  // Total counts
  _count?: {
    likes?: number;
    reposts?: number;
    savedBy?: number; // Prisma often names this matching the relation
    replies?: number;
  };
}

/**
 * Converts a feed post into the normalized `RankablePost` shape.
 * efficiently handling both small and large (viral) posts by using
 * statistical extrapolation for unique engager counts.
 */
export function buildRankablePost(post: FeedPostForRanking): RankablePost {
  const followerCount = post.user?._count?.followers ?? 0;
  
  const likesCount = post._count?.likes ?? post.likes?.length ?? 0;
  const repliesCount = post._count?.replies ?? post.replies?.length ?? 0;
  const repostsCount = post._count?.reposts ?? post.reposts?.length ?? 0;
  const savesCount = post._count?.savedBy ?? post.savedBy?.length ?? 0;

  const uniqueEngagers = estimateUniqueEngagers(post, {
    likes: likesCount,
    replies: repliesCount,
    reposts: repostsCount,
    saves: savesCount
  });

  const engagementRatioOverride =
    followerCount === 0 ? uniqueEngagers : uniqueEngagers / followerCount;

  return {
    id: post.id,
    userId: post.userId,
    createdAt: post.createdAt,
    content: post.content ?? "",
    userCreatedAt: post.user?.createdAt ?? post.createdAt,
    followerCount,
    metrics: {
      likes: likesCount,
      replies: repliesCount,
      reposts: repostsCount,
      saves: savesCount,
      uniqueEngagers,
    },
    engagementRatioOverride,
  };
}

/**
 * Returns a breakdown of raw engagement counts for UI analytics.
 */
export function getEngagementSnapshot(post: FeedPostForRanking) {
  const likesCount = post._count?.likes ?? post.likes?.length ?? 0;
  const repliesCount = post._count?.replies ?? post.replies?.length ?? 0;
  const repostsCount = post._count?.reposts ?? post.reposts?.length ?? 0;
  const savesCount = post._count?.savedBy ?? post.savedBy?.length ?? 0;

  return {
    likes: likesCount,
    replies: repliesCount,
    reposts: repostsCount,
    saves: savesCount,
    uniqueEngagers: estimateUniqueEngagers(post, {
      likes: likesCount,
      replies: repliesCount,
      reposts: repostsCount,
      saves: savesCount
    }),
  };
}

function estimateUniqueEngagers(
  post: FeedPostForRanking, 
  totalCounts: { likes: number; replies: number; reposts: number; saves: number }
): number {
  // 1. Collect all visible user IDs from the sampled arrays
  const uniqueUsersInSample = new Set<string>();
  let sampleSize = 0;

  const processSample = (arr: Array<Record<string, unknown>> | undefined, getUserId: (item: Record<string, unknown>) => string | null | undefined) => {
    if (!arr) return;
    arr.forEach(item => {
      if (!item) return; // Skip null/undefined items (placeholder arrays)
      const uid = getUserId(item);
      if (uid) {
        uniqueUsersInSample.add(uid);
        sampleSize++;
      }
    });
  };

  processSample(post.likes as Record<string, unknown>[] | undefined, l => l.userId as string | null | undefined);
  processSample(post.reposts as Record<string, unknown>[] | undefined, r => r.userId as string | null | undefined);
  processSample(post.savedBy as Record<string, unknown>[] | undefined, s => s.userId as string | null | undefined);
  processSample(post.replies as Record<string, unknown>[] | undefined, r => (r.user as { id?: string } | undefined)?.id);

  // 2. Calculate total raw interactions
  const totalInteractions = totalCounts.likes + totalCounts.replies + totalCounts.reposts + totalCounts.saves;

  // 3. If we have no interactions, 0
  if (totalInteractions === 0) return 0;

  // 4. If we haven't exceeded the sample limits (i.e., we fetched everything), 
  //    then the Set size is the exact unique count.
  //    We know we fetched everything if sampleSize == totalInteractions.
  if (sampleSize === totalInteractions) {
    return uniqueUsersInSample.size;
  }

  // 5. Extrapolation:
  //    Calculate the "uniqueness ratio" of the sample.
  //    If 100 interactions come from 80 people (ratio 0.8), assume the remaining interactions follow a similar distribution.
  //    (This is a heuristic; viral posts often have HIGHER uniqueness than small group chats, but this is a safe lower bound).
  const uniquenessRatio = sampleSize > 0 ? uniqueUsersInSample.size / sampleSize : 1;

  return Math.round(totalInteractions * uniquenessRatio);
}
