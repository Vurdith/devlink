import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/server/auth-options";
import { AnimatedHomeContent } from "@/components/feed/AnimatedHomeContent";
import { fetchHomeFeedPosts } from "@/server/feed/fetch-home-feed";

// Cache for 60 seconds - reduces database load significantly
export const revalidate = 60;

export default async function HomePage() {
  // Fetch session and posts in parallel - these are the only 2 required queries
  const [session, posts] = await Promise.all([
    getServerSession(authOptions),
    fetchHomeFeedPosts(20) // Reduced to 20 for faster load
  ]);

  // Redirect new OAuth users to set password
  if ((session?.user as any)?.needsPassword) {
    redirect("/complete-signup");
  }

  // Simple transform - no ranking, no extra queries
  // User interaction data will be fetched client-side on demand
  const postsWithViewCounts = posts.map(post => ({
    ...post,
    views: post._count?.views || 0,
    isLiked: false,
    isReposted: false,
    isSaved: false,
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

  // Minimal user profile - just what's needed for display
  const currentUserProfile = session?.user ? {
    id: (session.user as any).id,
    username: (session.user as any).username,
    name: session.user.name,
    profile: null,
    _count: { followers: 0, following: 0 }
  } : null;

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
