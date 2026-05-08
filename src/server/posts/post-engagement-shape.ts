interface PollOptionWithVoteCount {
  id: string;
  text: string;
  votes?: unknown[];
  _count?: {
    votes?: number;
  };
}

interface PollWithVoteCounts {
  id: string;
  question: string;
  expiresAt: Date | null;
  isMultiple: boolean;
  options: PollOptionWithVoteCount[];
}

export interface PostWithEngagementCounts {
  id: string;
  _count?: {
    replies?: number;
  };
  poll?: PollWithVoteCounts | null;
}

export interface PostEngagementSummary {
  viewCountMap: Map<string, number>;
  likedPostIds: Set<string>;
  repostedPostIds: Set<string>;
  savedPostIds: Set<string>;
  votedOptionIds: Set<string>;
}

export function getPostPollIds(posts: PostWithEngagementCounts[]) {
  return posts
    .map((post) => post.poll?.id)
    .filter((id): id is string => Boolean(id));
}

export function attachPostEngagement<TPost extends PostWithEngagementCounts>(
  post: TPost,
  summary: PostEngagementSummary
) {
  const getOptionVoteCount = (option: PollOptionWithVoteCount) =>
    option._count?.votes ?? (Array.isArray(option.votes) ? option.votes.length : 0);

  const poll =
    post.poll === undefined
      ? undefined
      : post.poll
        ? {
            ...post.poll,
            options: post.poll.options.map((option) => ({
              id: option.id,
              text: option.text,
              votes: getOptionVoteCount(option),
              isSelected: summary.votedOptionIds.has(option.id),
            })),
            totalVotes: post.poll.options.reduce(
              (sum, option) => sum + getOptionVoteCount(option),
              0
            ),
          }
        : null;

  return {
    ...post,
    views: summary.viewCountMap.get(post.id) || 0,
    isLiked: summary.likedPostIds.has(post.id),
    isReposted: summary.repostedPostIds.has(post.id),
    isSaved: summary.savedPostIds.has(post.id),
    likes: [],
    reposts: [],
    savedBy: [],
    replies: Array(post._count?.replies || 0).fill(null),
    ...(poll !== undefined ? { poll } : {}),
  };
}
