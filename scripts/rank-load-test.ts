import { rankPosts, type RankablePost } from "@/lib/ranking/devlink-ranking";

const POST_COUNT = Number(process.argv[2] ?? 1000);
const BATCHES = Number(process.argv[3] ?? 5);

function synthesizePost(index: number): RankablePost {
  const createdAt = new Date(Date.now() - index * 1000 * 60);
  return {
    id: `post-${index}`,
    createdAt,
    content: `post content ${index % 25}`,
    userId: `user-${index % 50}`,
    userCreatedAt: new Date(Date.now() - index * 1000 * 60 * 60).toISOString(),
    followerCount: Math.max(0, Math.floor(Math.random() * 5000) - index),
    metrics: {
      likes: Math.floor(Math.random() * 50),
      replies: Math.floor(Math.random() * 10),
      reposts: Math.floor(Math.random() * 15),
      saves: Math.floor(Math.random() * 8),
    },
  };
}

function runBatch(batch: number) {
  const posts = Array.from({ length: POST_COUNT }, (_, idx) =>
    synthesizePost(batch * POST_COUNT + idx)
  );
  const start = Date.now();
  rankPosts(posts);
  const duration = Date.now() - start;
  // eslint-disable-next-line no-console
  console.log(
    `batch ${batch + 1}/${BATCHES} - posts=${POST_COUNT} duration=${duration}ms`
  );
  return duration;
}

const durations = Array.from({ length: BATCHES }, (_, idx) => runBatch(idx));
const avg =
  durations.reduce((sum, value) => sum + value, 0) / Math.max(1, durations.length);

// eslint-disable-next-line no-console
console.log(
  `avg duration ${avg.toFixed(2)}ms across ${BATCHES} batches (${POST_COUNT} posts each)`
);

