import { NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { prismaRead } from "@/server/db-read";

const DEFAULT_MESSAGE_LIMIT = 100;
const MAX_MESSAGE_LIMIT = 100;

function messageQuery(req: Request) {
  const url = new URL(req.url);
  const rawLimit = Number(
    url.searchParams.get("limit") || DEFAULT_MESSAGE_LIMIT,
  );
  const limit = Math.min(
    MAX_MESSAGE_LIMIT,
    Math.max(1, Number.isFinite(rawLimit) ? rawLimit : DEFAULT_MESSAGE_LIMIT),
  );

  return {
    limit,
    cursor: url.searchParams.get("cursor"),
  };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { threadId } = await params;
  const { limit, cursor } = messageQuery(req);
  const conversation = await prismaRead.conversation.findUnique({
    where: { id: threadId },
    include: {
      members: { include: { user: { include: { profile: true } } } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  const isMember = conversation.members.some(
    (member) => member.userId === userId,
  );
  if (!isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const members = conversation.members
    .map((member) => member.user)
    .filter(Boolean);
  const sortedMembers = [...members].sort((a, b) => a.id.localeCompare(b.id));
  const userA = sortedMembers[0] || members[0];
  const userB = sortedMembers[1] || members[1] || userA;
  const hasMoreMessages = conversation.messages.length > limit;
  const visibleMessages = hasMoreMessages
    ? conversation.messages.slice(0, limit)
    : conversation.messages;
  const orderedMessages = [...visibleMessages].reverse();
  const thread = {
    id: conversation.id,
    userAId: userA?.id || "",
    userBId: userB?.id || "",
    lastMessageAt: conversation.lastMessageAt,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    userA,
    userB,
    messages: orderedMessages.map((message) => ({
      ...message,
      threadId: conversation.id,
      content: message.content ?? "",
    })),
    messagesNextCursor: hasMoreMessages
      ? (visibleMessages[visibleMessages.length - 1]?.id ?? null)
      : null,
  };

  const response = NextResponse.json(thread);
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  return response;
}
