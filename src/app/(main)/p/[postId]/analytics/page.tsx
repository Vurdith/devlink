import { notFound } from "next/navigation";
import { PostAnalyticsClient } from "./PostAnalyticsClient";
import { prisma } from "@/server/db";
import { computeAnalyticsWithRust } from "@/server/services/hotpath-client";
import { getUniqueViewCounts } from "@/lib/view-utils";

interface AnalyticsPageParams {
  params: Promise<{
    postId: string;
  }>;
}

export async function generateMetadata({ params }: AnalyticsPageParams) {
  const { postId } = await params;
  
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      content: true,
      user: { select: { username: true, name: true } },
    },
  });
  
  if (!post) {
    return { title: "Post Not Found" };
  }
  
  const preview = post.content?.slice(0, 50) || "Post";
  return {
    title: `Analytics for @${post.user.username}'s post`,
    description: `Detailed performance metrics and ranking breakdown for "${preview}..."`,
  };
}

export default async function AnalyticsPage({ params }: AnalyticsPageParams) {
  const { postId } = await params;
  
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      content: true,
      createdAt: true,
      userId: true,
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          createdAt: true,
          _count: { select: { followers: true } },
        },
      },
      _count: {
        select: {
          likes: true,
          replies: true,
          reposts: true,
          savedBy: true,
        },
      },
    },
  });
  
  if (!post) {
    notFound();
  }
  
  const viewCountMap = await getUniqueViewCounts([postId]);
  const viewCount = viewCountMap.get(postId) || 0;
  
  const engagement = {
    likes: post._count.likes,
    replies: post._count.replies,
    reposts: post._count.reposts,
    saves: post._count.savedBy,
  };
  
  // Call Rust Analytics Service
  const rustAnalytics = await computeAnalyticsWithRust({
    postId: post.id,
    createdAt: post.createdAt.toISOString(),
    userId: post.userId,
    userCreatedAt: post.user.createdAt.toISOString(),
    followerCount: post.user._count.followers,
    viewCount: viewCount,
    content: post.content || "",
    metrics: {
      likes: engagement.likes,
      replies: engagement.replies,
      reposts: engagement.reposts,
      saves: engagement.saves,
      uniqueEngagers: engagement.likes + engagement.replies + engagement.reposts + engagement.saves,
    }
  });
  
  return (
    <PostAnalyticsClient
      postId={post.id}
      content={post.content || ""}
      createdAt={post.createdAt.toISOString()}
      author={{
        username: post.user.username,
        name: post.user.name,
      }}
      followerCount={post.user._count.followers}
      viewCount={viewCount}
      engagement={engagement}
      accountCreatedAt={post.user.createdAt.toISOString()}
      rustBreakdown={rustAnalytics?.score_breakdown || null}
      recommendations={rustAnalytics?.recommendations || []}
    />
  );
}