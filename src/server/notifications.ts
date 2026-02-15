import { prisma } from "@/server/db";
import type { Prisma } from "@prisma/client";

export type NotificationCreateInput = {
  recipientId: string;
  actorId: string;
  type: "LIKE" | "REPOST" | "REPLY" | "FOLLOW" | "MENTION";
  postId?: string | null;
  sourcePostId?: string | null;
  dedupeKey?: string | null;
  metadata?: Prisma.InputJsonValue;
};

/**
 * In dev, Next can hot-reload without re-generating Prisma Client.
 * If the running Prisma Client doesn't have the Notification delegate yet,
 * we just no-op so engagement actions don't break.
 */
function hasNotificationModel(): boolean {
  return "notification" in prisma;
}

function hasNotificationActorModel(): boolean {
  return "notificationActor" in prisma;
}

export async function createNotification(input: NotificationCreateInput) {
  if (!hasNotificationModel()) return;

  const {
    recipientId,
    actorId,
    type,
    postId = null,
    sourcePostId = null,
    dedupeKey = null,
    metadata = undefined,
  } = input;

  if (!recipientId || !actorId) return;
  if (recipientId === actorId) return; // no self notifications

  try {
    // De-dupe when a dedupeKey is provided (likes/reposts/follows/mentions).
    if (dedupeKey) {
      await prisma.notification.upsert({
        where: { dedupeKey },
        update: {
          readAt: null, // bump back to unread if it already existed
          createdAt: new Date(),
          metadata: metadata ?? undefined,
        },
        create: {
          userId: recipientId,
          actorId,
          type,
          postId,
          sourcePostId,
          dedupeKey,
          metadata: metadata ?? undefined,
        },
      });
      return;
    }

    await prisma.notification.create({
      data: {
        userId: recipientId,
        actorId,
        type,
        postId,
        sourcePostId,
        metadata: metadata ?? undefined,
      },
    });
  } catch (e) {
    // Never fail the parent action if notification write fails.
    console.error("createNotification failed:", e);
  }
}

type StackedNotificationInput = {
  recipientId: string;
  actorId: string;
  type: "LIKE" | "REPOST";
  postId: string;
};

export async function upsertStackedNotification(input: StackedNotificationInput) {
  if (!hasNotificationModel() || !hasNotificationActorModel()) return;

  const { recipientId, actorId, type, postId } = input;
  if (!recipientId || !actorId || !postId) return;
  if (recipientId === actorId) return;

  const dedupeKey = `n:${recipientId}:${type.toLowerCase()}:${postId}`; // group per post

  try {
    const n = await prisma.notification.upsert({
      where: { dedupeKey },
      update: {
        actorId, // last actor (for fallback)
        readAt: null,
        createdAt: new Date(),
      },
      create: {
        userId: recipientId,
        actorId,
        type,
        postId,
        dedupeKey,
      },
      select: { id: true },
    });

    await prisma.notificationActor.createMany({
      data: [{ notificationId: n.id, actorId }],
      skipDuplicates: true,
    });
  } catch (e) {
    console.error("upsertStackedNotification failed:", e);
  }
}

export async function removeActorFromStackedNotification(input: StackedNotificationInput) {
  if (!hasNotificationModel() || !hasNotificationActorModel()) return;

  const { recipientId, actorId, type, postId } = input;
  if (!recipientId || !actorId || !postId) return;

  const dedupeKey = `n:${recipientId}:${type.toLowerCase()}:${postId}`;

  try {
    const n = await prisma.notification.findUnique({
      where: { dedupeKey },
      select: { id: true },
    });
    if (!n?.id) return;

    await prisma.notificationActor.deleteMany({
      where: { notificationId: n.id, actorId },
    });

    const remaining = await prisma.notificationActor.count({
      where: { notificationId: n.id },
    });

    if (remaining === 0) {
      await prisma.notification.delete({ where: { id: n.id } });
    }
  } catch (e) {
    console.error("removeActorFromStackedNotification failed:", e);
  }
}
