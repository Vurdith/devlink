import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";

type NotificationRow = Awaited<ReturnType<typeof prisma.notification.findMany>>[number];

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

function asIso(d: any) {
  try {
    return new Date(d).toISOString();
  } catch {
    return null;
  }
}

function groupNotifications(rows: any[], limit: number) {
  const GROUPABLE = new Set(["LIKE", "REPOST"]);

  const groups: Array<{
    id: string;
    type: string;
    createdAt: string;
    readAt: string | null;
    actors: any[];
    actorCount: number;
    notificationIds: string[];
    post: any | null;
    sourcePost: any | null;
  }> = [];

  const byKey = new Map<string, number>(); // key -> groups index

  for (const n of rows) {
    const key =
      GROUPABLE.has(n.type) && n.postId
        ? `${n.type}:${n.postId}`
        : `${n.type}:${n.id}`;

    const idx = byKey.get(key);
    if (idx === undefined) {
      byKey.set(key, groups.length);
      groups.push({
        id: key,
        type: n.type,
        createdAt: asIso(n.createdAt) || new Date().toISOString(),
        readAt: n.readAt ? asIso(n.readAt) : null,
        actors: n.actor ? [n.actor] : [],
        actorCount: 1,
        notificationIds: [n.id],
        post: n.post ?? null,
        sourcePost: n.sourcePost ?? null,
      });
    } else {
      const g = groups[idx];
      g.notificationIds.push(n.id);

      // unread if any underlying is unread
      if (!n.readAt) g.readAt = null;

      // latest timestamp wins
      const nCreated = asIso(n.createdAt);
      if (nCreated && nCreated > g.createdAt) g.createdAt = nCreated;

      // actors unique by id (preserve order)
      if (n.actor?.id) {
        const seen = new Set(g.actors.map((a: any) => a?.id).filter(Boolean));
        if (!seen.has(n.actor.id)) g.actors.push(n.actor);
      }

      g.actorCount += 1;
    }
  }

  return groups.slice(0, limit);
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 40)));
    const cursor = url.searchParams.get("cursor"); // notification id

    // Fetch more than limit so we can group "X-style" (multiple likes/reposts -> one row)
    const rawTake = Math.min(500, limit * 5 + 1);

    const items = await prisma.notification.findMany({
      where: { userId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: rawTake,
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

    const rawHasMore = items.length >= rawTake;
    const rawSlice = rawHasMore ? items.slice(0, rawTake - 1) : items;

    // Grouped activity (what the UI uses)
    const activity = groupNotifications(rawSlice as any[], limit);

    // Cursor is still based on raw notifications for stability.
    const nextCursor = rawHasMore ? rawSlice[rawSlice.length - 1]?.id ?? null : null;

    return NextResponse.json({
      activity,
      nextCursor,
      // keep old field for backwards compatibility
      notifications: rawSlice.slice(0, Math.min(limit, rawSlice.length)),
    });
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


