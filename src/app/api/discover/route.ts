import { prisma } from "@/server/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const profileType = searchParams.get("type");
    
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
      take: 50,
    });
    
    // Transform to include isFollowing flag
    const transformedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      name: user.name,
      profile: user.profile,
      _count: user._count,
      isFollowing: Array.isArray(user.followers) && user.followers.length > 0
    }));
    
    return NextResponse.json({ users: transformedUsers });
  } catch (error) {
    console.error("Failed to fetch discover users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
