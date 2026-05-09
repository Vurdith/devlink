import { getAuthSession } from "@/server/auth";
import { notFound } from "next/navigation";
import { NetworkPage } from "../NetworkPage";
import {
  formatNetworkDescription,
  getFollowersPage,
  getProfileIdentity,
  getViewerFollowingIds,
} from "../network-data";

export default async function FollowersPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const [session, user] = await Promise.all([getAuthSession(), getProfileIdentity(username)]);

  if (!user) notFound();

  const currentUserId = session?.user?.id;

  const followers = await getFollowersPage(user.id);

  const ids = followers.map((f) => f.follower.id);
  const followingIds = await getViewerFollowingIds(currentUserId, ids);

  return (
      <NetworkPage
      title={`Followers of @${user.username}`}
      description={formatNetworkDescription(user._count.followers, "person follows", "people follow", "this profile")}
      headerIcon={
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 2a2 2 0 11-4 0 2 2 0 014 0zM7 9a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      }
      emptyTitle="No followers yet"
      emptyDescription="People who follow this profile will appear here."
      emptyIcon={
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      }
      users={followers.map((follower) => follower.follower)}
      currentUserId={currentUserId}
      followingIds={followingIds}
    />
  );
}
