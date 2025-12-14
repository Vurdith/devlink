import { prisma } from "@/server/db";

export type NotificationCreateInput = {
  recipientId: string;
  actorId: string;
  type: "LIKE" | "REPOST" | "REPLY" | "FOLLOW" | "MENTION";
  postId?: string | null;
  sourcePostId?: string | null;
  dedupeKey?: string | null;
  metadata?: any;
};

export async function createNotification(input: NotificationCreateInput) {
  // In dev, Next can hot-reload without re-generating Prisma Client.
  // If the running Prisma Client doesn't have the Notification delegate yet,
  // we just no-op so engagement actions don't break.
  const notificationDelegate = (prisma as any)?.notification as
    | {
        upsert: Function;
        create: Function;
      }
    | undefined;

  if (!notificationDelegate) return;

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
      await (notificationDelegate as any).upsert({
        where: { dedupeKey },
        update: {
          readAt: null, // bump back to unread if it already existed
          createdAt: new Date(),
          metadata: metadata ?? undefined,
        },
        create: {
          userId: recipientId,
          actorId,
          type: type as any,
          postId,
          sourcePostId,
          dedupeKey,
          metadata: metadata ?? undefined,
        },
      });
      return;
    }

    await (notificationDelegate as any).create({
      data: {
        userId: recipientId,
        actorId,
        type: type as any,
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
  const notificationDelegate = (prisma as any)?.notification as
    | { upsert: Function; findUnique: Function }
    | undefined;
  const notificationActorDelegate = (prisma as any)?.notificationActor as
    | { createMany: Function; deleteMany: Function; count: Function }
    | undefined;

  if (!notificationDelegate || !notificationActorDelegate) return;

  const { recipientId, actorId, type, postId } = input;
  if (!recipientId || !actorId || !postId) return;
  if (recipientId === actorId) return;

  const dedupeKey = `n:${recipientId}:${type.toLowerCase()}:${postId}`; // group per post

  try {
    const n = await (notificationDelegate as any).upsert({
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

    await (notificationActorDelegate as any).createMany({
      data: [{ notificationId: n.id, actorId }],
      skipDuplicates: true,
    });
  } catch (e) {
    console.error("upsertStackedNotification failed:", e);
  }
}

export async function removeActorFromStackedNotification(input: StackedNotificationInput) {
  const notificationDelegate = (prisma as any)?.notification as
    | { findUnique: Function; delete: Function }
    | undefined;
  const notificationActorDelegate = (prisma as any)?.notificationActor as
    | { deleteMany: Function; count: Function }
    | undefined;

  if (!notificationDelegate || !notificationActorDelegate) return;

  const { recipientId, actorId, type, postId } = input;
  if (!recipientId || !actorId || !postId) return;

  const dedupeKey = `n:${recipientId}:${type.toLowerCase()}:${postId}`;

  try {
    const n = await (notificationDelegate as any).findUnique({
      where: { dedupeKey },
      select: { id: true },
    });
    if (!n?.id) return;

    await (notificationActorDelegate as any).deleteMany({
      where: { notificationId: n.id, actorId },
    });

    const remaining = await (notificationActorDelegate as any).count({
      where: { notificationId: n.id },
    });

    if (remaining === 0) {
      await (notificationDelegate as any).delete({ where: { id: n.id } });
    }
  } catch (e) {
    console.error("removeActorFromStackedNotification failed:", e);
  }
}


