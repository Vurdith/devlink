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


