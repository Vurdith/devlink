import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { MessageRequestStatus } from "@prisma/client";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

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
    const [userAId, userBId] = [request.senderId, request.recipientId].sort();
    const existing = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        AND: [
          { members: { some: { userId: request.senderId } } },
          { members: { some: { userId: request.recipientId } } },
          { members: { every: { userId: { in: [request.senderId, request.recipientId] } } } },
        ],
      },
      include: {
        members: { include: { user: { include: { profile: true } } } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    const conversation =
      existing ??
      (await prisma.conversation.create({
        data: {
          isGroup: false,
          createdById: request.recipientId,
          members: {
            create: [
              { userId: userAId, role: userAId === request.recipientId ? "OWNER" : "MEMBER" },
              { userId: userBId, role: userBId === request.recipientId ? "OWNER" : "MEMBER" },
            ],
          },
        },
        include: {
          members: { include: { user: { include: { profile: true } } } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      }));

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
