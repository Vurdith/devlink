import { prisma } from "@/server/db";

export async function canSendMessage({
  senderId,
  recipientId,
}: {
  senderId: string;
  recipientId: string;
}): Promise<boolean> {
  if (senderId === recipientId) return false;

  if (!(prisma as any).userMessagingSettings) {
    throw new Error("Prisma client missing messaging models. Run prisma generate/migrate.");
  }

  const settings = await prisma.userMessagingSettings.findUnique({
    where: { userId: recipientId },
  });

  const allowFrom = settings?.allowFrom || "EVERYONE";
  if (allowFrom === "EVERYONE") return true;
  if (allowFrom === "NONE") return false;

  const [senderFollowsRecipient, recipientFollowsSender] = await Promise.all([
    prisma.follower.findUnique({
      where: {
        followerId_followingId: {
          followerId: senderId,
          followingId: recipientId,
        },
      },
    }),
    prisma.follower.findUnique({
      where: {
        followerId_followingId: {
          followerId: recipientId,
          followingId: senderId,
        },
      },
    }),
  ]);

  switch (allowFrom) {
    case "FOLLOWERS":
      return Boolean(senderFollowsRecipient);
    case "FOLLOWING":
      return Boolean(recipientFollowsSender);
    case "MUTUALS":
      return Boolean(senderFollowsRecipient && recipientFollowsSender);
    default:
      return false;
  }
}
