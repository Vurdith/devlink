import { prisma } from "@/server/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { NextRequest, NextResponse } from "next/server";

const PAGE_SIZE = 24; // 24 = nice grid (divisible by 2, 3, 4)

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const profileType = searchParams.get("type");
    const cursor = searchParams.get("cursor"); // For pagination
    
    // Build the where clause
    const where: any = {};
    
    if (profileType && profileType !== "all") {
      where.profile = {
        profileType: profileType
      };
    }
    
    // Fetch users with the specified profile type
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
        // Include followers to check if current user follows them
        followers: session?.user?.id ? {
          where: {
            followerId: session.user.id
          },
          select: {
            id: true
          }
        } : false
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
    
    // Transform to include isFollowing flag
    const transformedUsers = usersToReturn.map(user => ({
      id: user.id,
      username: user.username,
      name: user.name,
      profile: user.profile,
      _count: user._count,
      isFollowing: Array.isArray(user.followers) && user.followers.length > 0
    }));
    
    return NextResponse.json({ 
      users: transformedUsers,
      nextCursor,
      hasMore
    });
  } catch (error) {
    console.error("Failed to fetch discover users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
