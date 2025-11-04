import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as any)?.id as string | undefined;
  if (!currentUserId) return new NextResponse("Unauthorized", { status: 401 });
  
  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get("targetUserId");
  
  if (!targetUserId) return new NextResponse("Bad Request", { status: 400 });
  if (targetUserId === currentUserId) return NextResponse.json({ following: false });

  const existing = await prisma.follower.findUnique({
    where: { followerId_followingId: { followerId: currentUserId, followingId: targetUserId } },
  });

  return NextResponse.json({ following: !!existing });
}
