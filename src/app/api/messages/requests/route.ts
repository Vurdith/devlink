import { NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";

export async function GET(req: Request) {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(prisma as any).messageRequest) {
    return NextResponse.json(
      { error: "Messaging tables are not initialized. Run prisma generate/migrate." },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "incoming";

  const where =
    type === "outgoing"
      ? { senderId: userId }
      : { recipientId: userId };

  const requests = await prisma.messageRequest.findMany({
    where,
    include: {
      sender: { include: { profile: true } },
      recipient: { include: { profile: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // For incoming requests, find the linked conversation and last message
  if (type === "incoming") {
    const enriched = await Promise.all(
      requests.map(async (req) => {
        // Find conversation between sender and recipient
        const senderMemberships = await prisma.conversationMember.findMany({
          where: { userId: req.senderId },
          select: { conversationId: true },
        });
        const senderConvIds = senderMemberships.map((m) => m.conversationId);

        let conversation = null;
        if (senderConvIds.length > 0) {
          const recipientMembership = await prisma.conversationMember.findFirst({
            where: {
              userId: req.recipientId,
              conversationId: { in: senderConvIds },
            },
            select: { conversationId: true },
          });

          if (recipientMembership) {
            conversation = await prisma.conversation.findFirst({
              where: { id: recipientMembership.conversationId, isGroup: false },
              include: {
                messages: { orderBy: { createdAt: "desc" }, take: 1 },
              },
            });
          }
        }

        return {
          ...req,
          conversationId: conversation?.id || null,
          lastMessage: conversation?.messages?.[0] || null,
        };
      })
    );
    const response = NextResponse.json(enriched);
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return response;
  }

  const response = NextResponse.json(requests);
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}
