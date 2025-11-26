import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";
import { AnimatedHomeContent } from "@/components/feed/AnimatedHomeContent";
import { fetchHomeFeedPosts } from "@/server/feed/fetch-home-feed";

// Cache for 30 seconds
export const revalidate = 30;

export default async function HomePage() {
  // Fetch session and posts in parallel
  const [session, posts] = await Promise.all([
    getServerSession(authOptions),
    fetchHomeFeedPosts(25)
  ]);

  // Redirect new OAuth users to set password
  if ((session?.user as any)?.needsPassword) {
    redirect("/complete-signup");
  }

  const currentUserId = (session?.user as any)?.id;
  const postIds = posts.map(p => p.id);

  // Only fetch user interactions if logged in - in parallel
  const [userLikes, userReposts, userSaves] = currentUserId ? await Promise.all([
    prisma.postLike.findMany({
      where: { postId: { in: postIds }, userId: currentUserId },
      select: { postId: true }
    }),
    prisma.postRepost.findMany({
      where: { postId: { in: postIds }, userId: currentUserId },
      select: { postId: true }
    }),
    prisma.savedPost.findMany({
      where: { postId: { in: postIds }, userId: currentUserId },
      select: { postId: true }
    })
  ]) : [[], [], []];

  const likedPostIds = new Set(userLikes.map(l => l.postId));
  const repostedPostIds = new Set(userReposts.map(r => r.postId));
  const savedPostIds = new Set(userSaves.map(s => s.postId));

  // Transform posts with engagement data
  const postsWithViewCounts = posts.map(post => ({
    ...post,
    views: post.views || 0,
    isLiked: likedPostIds.has(post.id),
    isReposted: repostedPostIds.has(post.id),
    isSaved: savedPostIds.has(post.id),
    poll: post.poll ? {
      id: post.poll.id,
      question: post.poll.question,
      options: post.poll.options?.map(opt => ({
        id: opt.id,
        text: opt.text,
        votes: opt.votes?.length || 0,
        isSelected: false
      })) || [],
      totalVotes: post.poll.options?.reduce((sum, opt) => sum + (opt.votes?.length || 0), 0) || 0,
      isMultiple: post.poll.isMultiple,
      expiresAt: post.poll.expiresAt
    } : undefined
  }));

  // Get user profile if logged in
  const currentUserProfile = session?.user?.username 
    ? await prisma.user.findUnique({
        where: { username: session.user.username },
        select: { 
          id: true,
          username: true,
          name: true,
          profile: { 
            select: { 
              avatarUrl: true,
              bannerUrl: true,
              profileType: true,
              verified: true,
              bio: true,
              website: true,
              location: true,
            } 
          },
          _count: {
            select: {
              followers: true,
              following: true,
            }
          }
        }
      }) 
    : null;

  return (
    <div className="min-h-screen pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedHomeContent 
          session={session}
          currentUserProfile={currentUserProfile as any}
          postsWithViewCounts={postsWithViewCounts as any}
        />
      </div>
    </div>
  );
}
