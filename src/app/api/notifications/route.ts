import { NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";

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

    // Merge legacy duplicates for stacked types (LIKE/REPOST) so they appear as one, like X.
    // This is display-only: it doesn't mutate DB, but it does return `groupIds` so the UI
    // can mark-read all underlying notifications at once.
    // Use Record-based type for the merged rows since we add groupIds/actors dynamically
    type NotificationRow = Record<string, unknown> & {
      id: string;
      type: string;
      postId: string | null;
      createdAt: Date;
      readAt: Date | null;
      groupIds?: string[];
      actors: Array<{ actor: unknown; createdAt: Date }>;
      actor: unknown;
    };
    const merged: NotificationRow[] = [];
    const groups = new Map<string, NotificationRow>();

    for (const n of sliced) {
      const isStackable = (n.type === "LIKE" || n.type === "REPOST") && !!n.postId;
      if (!isStackable) {
        merged.push({ ...n } as unknown as NotificationRow);
        continue;
      }

      const key = `${n.type}:${n.postId}`;
      const existing = groups.get(key);

      const actorList: Array<{ actor: unknown; createdAt: Date }> = Array.isArray(n.actors)
        ? n.actors
            .map((x) => x?.actor)
            .filter(Boolean)
            .map((a) => ({ actor: a, createdAt: n.createdAt }))
        : [];

      // legacy fallback
      if ((!n.actors || n.actors.length === 0) && n.actor) {
        actorList.push({ actor: n.actor, createdAt: n.createdAt });
      }

      if (!existing) {
        const base: NotificationRow = { ...n } as unknown as NotificationRow;
        base.groupIds = [n.id];
        base.actors = actorList;
        groups.set(key, base);
        merged.push(base);
        continue;
      }

      // Merge: keep newest createdAt/id for sort position
      existing.groupIds = Array.from(new Set([...(existing.groupIds || []), n.id]));
      existing.readAt = existing.readAt === null || n.readAt === null ? null : existing.readAt;

      if (new Date(n.createdAt).getTime() > new Date(existing.createdAt).getTime()) {
        existing.createdAt = n.createdAt;
        existing.actor = n.actor; // fallback
      }

      // Merge actors unique by actorId
      const byId = new Map<string, { actor: unknown; createdAt: Date }>();
      const combined = [...(existing.actors || []), ...actorList];
      for (const x of combined) {
        const id = (x?.actor as { id?: string })?.id;
        if (!id) continue;
        if (!byId.has(id)) byId.set(id, x);
      }
      existing.actors = Array.from(byId.values()).slice(0, 10);
    }

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


