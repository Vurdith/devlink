import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";

function explainNotificationDbError(e: any) {
  const msg = typeof e?.message === "string" ? e.message : "";
  const code = e?.code;

  // Prisma codes for missing table/enum can vary; Postgres missing relation is 42P01.
  const looksLikeMissingTable =
    code === "P2021" ||
    msg.includes("does not exist") ||
    msg.includes("relation") ||
    msg.includes("Notification");

  if (looksLikeMissingTable) {
    return {
      error:
        "Notifications table missing in your database. Apply the migration (Notification + NotificationType) and restart the server.",
    };
  }
  return { error: "Failed to load notifications" };
}

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
        actors: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            actor: {
              select: {
                id: true,
                username: true,
                name: true,
                profile: { select: { avatarUrl: true, verified: true, profileType: true } },
              },
            },
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
    const payload = explainNotificationDbError(e);
    // Add extra debug info in dev to speed up setup.
    if (process.env.NODE_ENV !== "production") {
      (payload as any).debug = {
        code: (e as any)?.code,
        message: (e as any)?.message,
      };
    }
    return NextResponse.json(payload, { status: 500 });
  }
}


