import { NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { prismaRead } from "@/server/db-read";

const DEFAULT_REQUEST_LIMIT = 50;
const MAX_REQUEST_LIMIT = 100;

const messageRequestUserSelect = {
  id: true,
  username: true,
  name: true,
  image: true,
  profile: { select: { avatarUrl: true, verified: true, profileType: true } },
} as const;

function requestLimitFrom(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawLimit = Number(searchParams.get("limit") || DEFAULT_REQUEST_LIMIT);
  return Math.min(
    MAX_REQUEST_LIMIT,
    Math.max(1, Number.isFinite(rawLimit) ? rawLimit : DEFAULT_REQUEST_LIMIT),
  );
}

export async function GET(req: Request) {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!("messageRequest" in prisma)) {
    return NextResponse.json(
      {
        error:
          "Messaging tables are not initialized. Run prisma generate/migrate.",
      },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "incoming";
  const limit = requestLimitFrom(req);

  const where =
    type === "outgoing" ? { senderId: userId } : { recipientId: userId };

  const requests = await prismaRead.messageRequest.findMany({
    where,
    select: {
      id: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      senderId: true,
      recipientId: true,
      sender: {
        select: messageRequestUserSelect,
      },
      recipient: {
        select: messageRequestUserSelect,
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  if (type === "incoming" && requests.length > 0) {
    const senderIds = [...new Set(requests.map((request) => request.senderId))];
    const recipientIds = [
      ...new Set(requests.map((request) => request.recipientId)),
    ];
    const allUserIds = [...new Set([...senderIds, ...recipientIds])];

    const allMemberships = await prismaRead.conversationMember.findMany({
      where: { userId: { in: allUserIds } },
      select: { userId: true, conversationId: true },
    });

    const conversationsByUser = new Map<string, Set<string>>();
    for (const membership of allMemberships) {
      const userConversations =
        conversationsByUser.get(membership.userId) ?? new Set<string>();
      userConversations.add(membership.conversationId);
      conversationsByUser.set(membership.userId, userConversations);
    }

    const requestedConversationIds = new Set<string>();
    for (const request of requests) {
      const senderConversations = conversationsByUser.get(request.senderId);
      const recipientConversations = conversationsByUser.get(
        request.recipientId,
      );
      if (!senderConversations || !recipientConversations) continue;

      const [smaller, larger] =
        senderConversations.size < recipientConversations.size
          ? [senderConversations, recipientConversations]
          : [recipientConversations, senderConversations];

      for (const conversationId of smaller) {
        if (larger.has(conversationId))
          requestedConversationIds.add(conversationId);
      }
    }

    const conversations = requestedConversationIds.size
      ? await prismaRead.conversation.findMany({
          where: { id: { in: [...requestedConversationIds] }, isGroup: false },
          select: {
            id: true,
            members: { select: { userId: true } },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: {
                id: true,
                content: true,
                createdAt: true,
                senderId: true,
              },
            },
          },
        })
      : [];

    const conversationMemberMap = new Map<
      string,
      { id: string; lastMessage: unknown }
    >();
    for (const conv of conversations) {
      const memberIds = conv.members
        .map((member) => member.userId)
        .sort()
        .join(",");
      conversationMemberMap.set(memberIds, {
        id: conv.id,
        lastMessage: conv.messages[0] || null,
      });
    }

    const enriched = requests.map((request) => {
      const memberKey = [request.senderId, request.recipientId]
        .sort()
        .join(",");
      const conversationData = conversationMemberMap.get(memberKey);

      return {
        ...request,
        conversationId: conversationData?.id || null,
        lastMessage: conversationData?.lastMessage || null,
      };
    });

    const response = NextResponse.json(enriched);
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    return response;
  }

  const response = NextResponse.json(requests);
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  return response;
}
