import { prisma } from "@/server/db";

export async function canSendMessage({
  senderId,
  recipientId,
}: {
  senderId: string;
  recipientId: string;
}): Promise<boolean> {
  if (senderId === recipientId) return false;

  if (!("userMessagingSettings" in prisma)) {
    throw new Error("Prisma client missing messaging models. Run prisma generate/migrate.");
  }

  const settings = await prisma.userMessagingSettings.findUnique({
    where: { userId: recipientId },
  });

  // Default to FOLLOWING — only people the recipient follows can DM directly.
  // Everyone else goes through message requests (matching X.com behaviour).
  const allowFrom = settings?.allowFrom || "FOLLOWING";
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
