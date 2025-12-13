import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 40)));
    const cursor = url.searchParams.get("cursor"); // notification id

    const items = await prisma.notification.findMany({
      where: { userId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            name: true,
            profile: { select: { avatarUrl: true, verified: true, profileType: true } },
          },
        },
        post: { select: { id: true, userId: true, content: true, createdAt: true } },
        sourcePost: { select: { id: true, content: true, createdAt: true } },
      },
    });

    const hasMore = items.length > limit;
    const sliced = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? sliced[sliced.length - 1]?.id ?? null : null;

    return NextResponse.json({ notifications: sliced, nextCursor });
  } catch (e) {
    console.error("Notifications GET error:", e);
    return NextResponse.json({ error: "Failed to load notifications" }, { status: 500 });
  }
}


