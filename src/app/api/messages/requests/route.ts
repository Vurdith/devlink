import { NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";

export async function GET(req: Request) {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!("messageRequest" in prisma)) {
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
    select: {
      id: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      senderId: true,
      recipientId: true,
      sender: {
        select: {
          id: true,
          username: true,
          name: true,
          profile: { select: { avatarUrl: true, verified: true } }
        }
      },
      recipient: {
        select: {
          id: true,
          username: true,
          name: true,
          profile: { select: { avatarUrl: true, verified: true } }
        }
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (type === "incoming" && requests.length > 0) {
    const senderIds = [...new Set(requests.map(r => r.senderId))];
    const recipientIds = [...new Set(requests.map(r => r.recipientId))];
    const allUserIds = [...new Set([...senderIds, ...recipientIds])];

    const [allMemberships, conversations] = await Promise.all([
      prisma.conversationMember.findMany({
        where: { userId: { in: allUserIds } },
        select: { userId: true, conversationId: true }
      }),
      prisma.conversation.findMany({
        where: { isGroup: false },
        select: {
          id: true,
          members: { select: { userId: true } },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { id: true, content: true, createdAt: true, senderId: true }
          }
        }
      })
    ]);

    const userConversationsMap = new Map<string, Set<string>>();
    for (const m of allMemberships) {
      if (!userConversationsMap.has(m.userId)) {
        userConversationsMap.set(m.userId, new Set());
      }
      userConversationsMap.get(m.userId)!.add(m.conversationId);
    }

    const conversationMemberMap = new Map<string, { id: string; lastMessage: unknown }>();
    for (const conv of conversations) {
      const memberIds = conv.members.map(m => m.userId).sort().join(",");
      conversationMemberMap.set(memberIds, { 
        id: conv.id, 
        lastMessage: conv.messages[0] || null 
      });
    }

    const enriched = requests.map(req => {
      const senderConvIds = userConversationsMap.get(req.senderId);
      const recipientConvIds = userConversationsMap.get(req.recipientId);
      
      let conversationData: { id: string; lastMessage: unknown } | undefined;
      
      if (senderConvIds && recipientConvIds) {
        const memberKey = [req.senderId, req.recipientId].sort().join(",");
        conversationData = conversationMemberMap.get(memberKey);
      }

      return {
        ...req,
        conversationId: conversationData?.id || null,
        lastMessage: conversationData?.lastMessage || null,
      };
    });

    const response = NextResponse.json(enriched);
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return response;
  }

  const response = NextResponse.json(requests);
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}
