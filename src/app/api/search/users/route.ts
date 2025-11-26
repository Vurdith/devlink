import { prisma } from "@/server/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json({ users: [] });
  // allow leading @
  const term = q.startsWith("@") ? q.slice(1) : q;
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: term } },
        { name: { contains: term } },
      ],
    },
    take: 8,
    orderBy: { username: "asc" },
    select: { 
      id: true,
      username: true,
      name: true,
      profile: {
        select: {
          avatarUrl: true,
          verified: true,
          profileType: true,
          bio: true
        }
      }
    },
  });
  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as any)?.id as string | undefined;
  let followingIds = new Set<string>();
  if (currentUserId && users.length > 0) {
    const relations = await prisma.follower.findMany({
      where: { followerId: currentUserId, followingId: { in: users.map(u => u.id) } },
      select: { followingId: true },
    });
    followingIds = new Set(relations.map(r => r.followingId));
  }
  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      avatarUrl: u.profile?.avatarUrl || null,
      verified: !!u.profile?.verified,
      profileType: u.profile?.profileType || null,
      bio: u.profile?.bio || null,
      isFollowing: followingIds.has(u.id),
      isYou: currentUserId === u.id,
    })),
  });
}


