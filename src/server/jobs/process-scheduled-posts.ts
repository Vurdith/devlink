import { prisma } from "@/server/db";
import { publishEvent } from "@/lib/events/bus";

export async function processScheduledPosts() {
  const now = new Date();
  const scheduledPosts = await prisma.post.findMany({
    where: {
      isScheduled: true,
      scheduledFor: {
        lte: now,
      },
    },
    select: {
      id: true,
      userId: true,
      createdAt: true,
    },
  });

  if (scheduledPosts.length === 0) {
    return 0;
  }

  await prisma.$transaction(
    scheduledPosts.map((post) =>
      prisma.post.update({
        where: { id: post.id },
        data: {
          isScheduled: false,
          scheduledFor: null,
        },
      })
    )
  );

  await Promise.all(
    scheduledPosts.map((post) =>
      publishEvent("post.created", {
        postId: post.id,
        userId: post.userId,
        createdAt: new Date().toISOString(),
      })
    )
  );

  return scheduledPosts.length;
}
