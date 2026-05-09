import { getAuthSession } from "@/server/auth";
import {
  fetchDiscoverUsers,
  getFollowingStatus,
  normalizeDiscoverCursor,
  normalizeDiscoverProfileType,
} from "@/server/discover/fetch-discover-users";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const profileType = normalizeDiscoverProfileType(searchParams.get("type"));
    const cursor = normalizeDiscoverCursor(searchParams.get("cursor"));
    const [session, result] = await Promise.all([
      getAuthSession(),
      fetchDiscoverUsers(profileType, cursor),
    ]);

    const followingSet = session?.user?.id
      ? await getFollowingStatus(session.user.id, result.users.map((user) => user.id))
      : new Set<string>();

    const response = NextResponse.json({
      ...result,
      users: result.users.map((user) => ({
        ...user,
        isFollowing: followingSet.has(user.id),
      })),
    });
    response.headers.set(
      "Cache-Control",
      session?.user?.id ? "private, no-store" : "public, max-age=30, stale-while-revalidate=60"
    );
    response.headers.set("Vary", "Cookie");
    return response;
  } catch (error) {
    console.error("Failed to fetch discover users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
