import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { NextResponse } from "next/server";
import { createNotification } from "@/server/notifications";
import { checkRateLimit } from "@/server/rate-limit";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    const currentUserId = session?.user?.id;
    
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await checkRateLimit(`follow:${currentUserId}`, 50, 60);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many follow requests. Please slow down." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null) as { targetUserId?: string } | null;
    
    if (!body?.targetUserId || typeof body.targetUserId !== 'string') {
      return NextResponse.json({ error: "Target user ID is required" }, { status: 400 });
    }

    const targetUserId = body.targetUserId;

    if (targetUserId === currentUserId) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true }
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.follower.findUnique({
        where: { followerId_followingId: { followerId: currentUserId, followingId: targetUserId } },
      });
      
      if (existing) {
        await tx.follower.delete({ where: { id: existing.id } });
        return { following: false };
      } else {
        await tx.follower.create({ data: { followerId: currentUserId, followingId: targetUserId } });
        return { following: true };
      }
    });
    
    if (result.following) {
      void createNotification({
        recipientId: targetUserId,
        actorId: currentUserId,
        type: "FOLLOW",
        dedupeKey: `n:${targetUserId}:follow:${targetUserId}:${currentUserId}`,
      });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in follow API:", error);
    return NextResponse.json({ error: "Failed to update follow status" }, { status: 500 });
  }
}


