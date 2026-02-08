import { prisma } from "@/server/db";
import { getAuthSession } from "@/server/auth";
import { NextRequest, NextResponse } from "next/server";
import { responseCache } from "@/lib/cache";

const PAGE_SIZE = 24; // 24 = nice grid (divisible by 2, 3, 4)
const CACHE_TTL = 60; // Cache for 60 seconds

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    const { searchParams } = new URL(req.url);
    const profileType = searchParams.get("type") || "all";
    const cursor = searchParams.get("cursor") || ""; // For pagination
    
    // Create cache key based on parameters (not user-specific for public data)
    const cacheKey = `discover:${profileType}:${cursor}`;
    
    // Try to get from cache first
    const cached = await responseCache.get<{
      users: any[];
      nextCursor: string | null;
      hasMore: boolean;
    }>(cacheKey);
    
    if (cached) {
      // If cached, just add user-specific isFollowing data
      if (session?.user?.id) {
        const userIds = cached.users.map(u => u.id);
        const following = await prisma.follower.findMany({
          where: {
            followerId: session.user.id,
            followingId: { in: userIds }
          },
          select: { followingId: true }
        });
        const followingSet = new Set(following.map(f => f.followingId));
        cached.users = cached.users.map(user => ({
          ...user,
          isFollowing: followingSet.has(user.id)
        }));
      }
      return NextResponse.json(cached);
    }
    
    // Build the where clause
    const where: any = {};
    
    if (profileType && profileType !== "all") {
      where.profile = {
        profileType: profileType
      };
    }
    
    // Fetch users with the specified profile type (without isFollowing - we'll add that separately)
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        name: true,
        createdAt: true,
        profile: {
          select: {
            avatarUrl: true,
            bannerUrl: true,
            profileType: true,
            verified: true,
            bio: true,
          }
        },
        _count: {
          select: {
            followers: true,
            following: true,
          }
        },
      },
      orderBy: [
        // Verified users first
        { profile: { verified: "desc" } },
        // Then by follower count
        { followers: { _count: "desc" } },
        // Then by creation date
        { createdAt: "desc" }
      ],
      take: PAGE_SIZE + 1, // Fetch one extra to check if there's more
      ...(cursor && {
        skip: 1, // Skip the cursor
        cursor: { id: cursor }
      })
    });
    
    // Check if there are more results
    const hasMore = users.length > PAGE_SIZE;
    const usersToReturn = hasMore ? users.slice(0, PAGE_SIZE) : users;
    const nextCursor = hasMore ? usersToReturn[usersToReturn.length - 1].id : null;
    
    // Transform users (without isFollowing - cached version)
    const transformedUsers = usersToReturn.map(user => ({
      id: user.id,
      username: user.username,
      name: user.name,
      profile: user.profile,
      _count: user._count,
      isFollowing: false // Default, will be updated for logged-in users
    }));
    
    const result = { 
      users: transformedUsers,
      nextCursor,
      hasMore
    };
    
    // Cache the result (without user-specific isFollowing)
    await responseCache.set(cacheKey, result, CACHE_TTL);
    
    // Add user-specific isFollowing if logged in
    if (session?.user?.id) {
      const userIds = transformedUsers.map(u => u.id);
      const following = await prisma.follower.findMany({
        where: {
          followerId: session.user.id,
          followingId: { in: userIds }
        },
        select: { followingId: true }
      });
      const followingSet = new Set(following.map(f => f.followingId));
      result.users = result.users.map(user => ({
        ...user,
        isFollowing: followingSet.has(user.id)
      }));
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch discover users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
