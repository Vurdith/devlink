import { NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { prismaRead } from "@/server/db-read";
import { mergeStackedNotificationItems } from "@/server/notifications/notification-feed";

function explainNotificationDbError(e: unknown) {
  if (process.env.NODE_ENV !== "development") {
    return { error: "Failed to load notifications" };
  }

  const err = e as { message?: string; code?: string } | null;
  const msg = typeof err?.message === "string" ? err.message : "";
  const code = err?.code;

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
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const limit = Math.min(
      100,
      Math.max(1, Number(url.searchParams.get("limit") || 40)),
    );
    const cursor = url.searchParams.get("cursor"); // notification id

    const items = await prismaRead.notification.findMany({
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
            profile: {
              select: { avatarUrl: true, verified: true, profileType: true },
            },
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
                profile: {
                  select: {
                    avatarUrl: true,
                    verified: true,
                    profileType: true,
                  },
                },
              },
            },
          },
        },
        post: {
          select: { id: true, userId: true, content: true, createdAt: true },
        },
        sourcePost: { select: { id: true, content: true, createdAt: true } },
      },
    });

    const hasMore = items.length > limit;
    const sliced = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? (sliced[sliced.length - 1]?.id ?? null) : null;

    const merged = mergeStackedNotificationItems(sliced);

    return NextResponse.json({ notifications: merged, nextCursor });
  } catch (e) {
    console.error("Notifications GET error:", e);
    const payload = explainNotificationDbError(e);
    // Add extra debug info in dev to speed up setup.
    if (process.env.NODE_ENV !== "production") {
      const err = e as { code?: string; message?: string } | null;
      (payload as Record<string, unknown>).debug = {
        code: err?.code,
        message: err?.message,
      };
    }
    return NextResponse.json(payload, { status: 500 });
  }
}
