import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as any)?.id as string | undefined;
    
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null) as { targetUserId?: string } | null;
    
    if (!body?.targetUserId || typeof body.targetUserId !== 'string') {
      return NextResponse.json({ error: "Target user ID is required" }, { status: 400 });
    }

    if (body.targetUserId === currentUserId) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    // Validate that target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: body.targetUserId },
      select: { id: true }
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existing = await prisma.follower.findUnique({
      where: { followerId_followingId: { followerId: currentUserId, followingId: body.targetUserId } },
    });
    
    if (existing) {
      await prisma.follower.delete({ where: { id: existing.id } });
      return NextResponse.json({ following: false });
    } else {
      await prisma.follower.create({ data: { followerId: currentUserId, followingId: body.targetUserId } });
      return NextResponse.json({ following: true });
    }
  } catch (error) {
    console.error("Error in follow API:", error);
    return NextResponse.json({ error: "Failed to update follow status" }, { status: 500 });
  }
}


