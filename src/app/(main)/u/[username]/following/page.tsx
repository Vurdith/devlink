import { getAuthSession } from "@/server/auth";
import { notFound } from "next/navigation";
import { NetworkPage } from "../NetworkPage";
import {
  formatNetworkDescription,
  getFollowingPage,
  getProfileIdentity,
  getViewerFollowingIds,
} from "../network-data";

export default async function FollowingPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const [session, user] = await Promise.all([getAuthSession(), getProfileIdentity(username)]);

  if (!user) notFound();

  const currentUserId = session?.user?.id;

  const following = await getFollowingPage(user.id);

  const ids = following.map((f) => f.following.id);
  const followingIds = await getViewerFollowingIds(currentUserId, ids);

  return (
      <NetworkPage
      title={`@${user.username} is following`}
      description={formatNetworkDescription(user._count.following, "profile", "profiles", "in this feed")}
      headerIcon={
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zm5 9v5m-2.5-2.5h5M2 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
        </svg>
      }
      emptyTitle="Not following anyone yet"
      emptyDescription="Profiles this user follows will appear here."
      emptyIcon={
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM2 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
        </svg>
      }
      users={following.map((follow) => follow.following)}
      currentUserId={currentUserId}
      followingIds={followingIds}
    />
  );
}
