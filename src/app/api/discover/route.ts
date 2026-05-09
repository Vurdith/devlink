import { getAuthSession } from "@/server/auth";
import { fetchDiscoverUsers, getFollowingStatus } from "@/server/discover/fetch-discover-users";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const profileType = searchParams.get("type") || "all";
    const cursor = searchParams.get("cursor") || undefined;
    const [session, result] = await Promise.all([
      getAuthSession(),
      fetchDiscoverUsers(profileType, cursor),
    ]);

    const followingSet = session?.user?.id
      ? await getFollowingStatus(session.user.id, result.users.map((user) => user.id))
      : new Set<string>();

    return NextResponse.json({
      ...result,
      users: result.users.map((user) => ({
        ...user,
        isFollowing: followingSet.has(user.id),
      })),
    });
  } catch (error) {
    console.error("Failed to fetch discover users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
