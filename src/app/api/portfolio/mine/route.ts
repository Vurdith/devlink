
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { username: session.user.username },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const portfolioItems = await prisma.portfolioItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        skills: {
          include: {
            skill: {
              select: { id: true, name: true, category: true, icon: true },
            },
          },
        },
        user: {
          include: {
            profile: {
              select: {
                avatarUrl: true,
                profileType: true,
                verified: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ portfolioItems });
  } catch (error) {
    console.error("Portfolio fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio items" },
      { status: 500 }
    );
  }
}

















