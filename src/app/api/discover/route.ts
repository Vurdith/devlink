import { prisma } from "@/server/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
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
        }
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
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Failed to fetch discover users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

