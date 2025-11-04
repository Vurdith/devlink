import { prisma } from "@/server/db";
import { notFound } from "next/navigation";
import { PostFeed } from "@/components/feed/PostFeed";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";

export default async function HashtagPage(props: { params: Promise<{ hashtag: string }> }) {
  const session = await getServerSession(authOptions);
  const { hashtag } = await props.params;

  // Fetch posts with this hashtag
  const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3457'}/api/hashtags/${hashtag}`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    notFound();
  }

  const data = await response.json();
  const { posts, hashtag: hashtagData } = data;

  if (!hashtagData) {
    notFound();
  }

  const currentUserProfile = session?.user?.username ? await prisma.user.findUnique({
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
          location: true
        } 
      }
    }
  }) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hashtag Header */}
        <div className="glass rounded-2xl p-8 mb-8 border border-white/10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-3xl">#</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">#{hashtagData.name}</h1>
              <p className="text-gray-400 mt-1">
                {hashtagData.postCount} {hashtagData.postCount === 1 ? 'post' : 'posts'}
              </p>
            </div>
          </div>
          <p className="text-gray-300">
            Explore posts tagged with #{hashtagData.name}
          </p>
        </div>

        {/* Posts Feed */}
        {posts.length > 0 ? (
          <PostFeed 
            posts={posts} 
            currentUserId={currentUserProfile?.id}
            hidePinnedIndicator={true}
          />
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-white mb-2">No posts found</h3>
            <p className="text-gray-400">
              No posts have been tagged with #{hashtagData.name} yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}



