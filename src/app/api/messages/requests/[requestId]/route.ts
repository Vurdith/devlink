import { NextResponse } from "next/server";
import { MessageRequestStatus } from "@prisma/client";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { requestId } = await params;
  const body = await req.json();
  const status = typeof body?.status === "string" ? body.status : undefined;
  const nextStatus = status as MessageRequestStatus | undefined;

  if (!nextStatus || !["ACCEPTED", "DECLINED"].includes(nextStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const request = await prisma.messageRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (request.recipientId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (request.status !== "PENDING") {
    return NextResponse.json({ error: "Request already handled" }, { status: 400 });
  }

  const updated = await prisma.messageRequest.update({
    where: { id: requestId },
    data: { status: nextStatus },
    include: {
      sender: { include: { profile: true } },
      recipient: { include: { profile: true } },
    },
  });

  if (nextStatus === "ACCEPTED") {
    // Conversation already exists (created when sender initiated)
    // Just find it and return as a thread
    const senderConversations = await prisma.conversationMember.findMany({
      where: { userId: request.senderId },
      select: { conversationId: true },
    });
    const senderConvIds = senderConversations.map((m) => m.conversationId);

    let conversation = null;
    if (senderConvIds.length > 0) {
      const recipientMembership = await prisma.conversationMember.findFirst({
        where: {
          userId: request.recipientId,
          conversationId: { in: senderConvIds },
        },
        select: { conversationId: true },
      });

      if (recipientMembership) {
        conversation = await prisma.conversation.findFirst({
          where: { id: recipientMembership.conversationId, isGroup: false },
          include: {
            members: { include: { user: { include: { profile: true } } } },
            messages: { orderBy: { createdAt: "desc" }, take: 1 },
          },
        });
      }
    }

    if (!conversation) {
      const response = NextResponse.json({ request: updated });
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      return response;
    }

    const members = conversation.members.map((member) => member.user).filter(Boolean);
    const sortedMembers = [...members].sort((a, b) => a.id.localeCompare(b.id));
    const userA = sortedMembers[0] || members[0];
    const userB = sortedMembers[1] || members[1] || userA;
    const thread = {
      id: conversation.id,
      userAId: userA?.id || "",
      userBId: userB?.id || "",
      lastMessageAt: conversation.lastMessageAt,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      userA,
      userB,
      messages: conversation.messages?.map((message) => ({
        ...message,
        threadId: conversation.id,
        content: message.content ?? "",
      })),
    };

    const response = NextResponse.json({ request: updated, thread });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return response;
  }

  const response = NextResponse.json({ request: updated });
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}
