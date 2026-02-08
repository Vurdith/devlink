import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { canSendMessage } from "@/server/messages/permissions";

export async function GET() {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Query ConversationMember directly to avoid Prisma v7 relation filter issues
  const memberships = await prisma.conversationMember.findMany({
    where: { userId },
    select: { conversationId: true },
  });
  const myConvIds = memberships.map((m) => m.conversationId);

  const conversations = myConvIds.length > 0
    ? await prisma.conversation.findMany({
        where: {
          id: { in: myConvIds },
          isGroup: false,
        },
        include: {
          members: { include: { user: { include: { profile: true } } } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: { lastMessageAt: "desc" },
      })
    : [];

  const threads = conversations.map((conversation) => {
    const members = conversation.members.map((member) => member.user).filter(Boolean);
    const sortedMembers = [...members].sort((a, b) => a.id.localeCompare(b.id));
    const userA = sortedMembers[0] || members[0];
    const userB = sortedMembers[1] || members[1] || userA;
    return {
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
  });

  const response = NextResponse.json(threads);
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await checkRateLimit(`message_thread:${userId}`, 10, 60);
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    const body = await req.json();
    const otherUserId = typeof body?.otherUserId === "string" ? body.otherUserId : undefined;
    const otherUsername = typeof body?.username === "string" ? body.username : undefined;

    if (!otherUserId && !otherUsername) {
      return NextResponse.json({ error: "otherUserId or username is required" }, { status: 400 });
    }

    const otherUser = otherUserId
      ? await prisma.user.findUnique({ where: { id: otherUserId }, include: { profile: true } })
      : await prisma.user.findFirst({
          where: { username: { equals: otherUsername!.trim(), mode: "insensitive" } },
          include: { profile: true },
        });

    if (!otherUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (otherUser.id === userId) {
      return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
    }

    const allowed = await canSendMessage({ senderId: userId, recipientId: otherUser.id });
    const [userAId, userBId] = [userId, otherUser.id].sort();

    if (!allowed) {
      if (!(prisma as any).messageRequest) {
        return NextResponse.json(
          { error: "Messaging tables are not initialized. Run prisma generate/migrate." },
          { status: 500 }
        );
      }
      const request = await prisma.messageRequest.upsert({
        where: { senderId_recipientId: { senderId: userId, recipientId: otherUser.id } },
        update: { status: "PENDING" },
        create: { senderId: userId, recipientId: otherUser.id, status: "PENDING" },
        include: {
          sender: { include: { profile: true } },
          recipient: { include: { profile: true } },
        },
      });

      const response = NextResponse.json({ type: "request", request }, { status: 201 });
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      return response;
    }

    // Find existing 1-on-1 conversation between the two users
    // Query ConversationMember directly to avoid Prisma v7 relation filter issues
    const sharedConversations = await prisma.conversationMember.findMany({
      where: { userId },
      select: { conversationId: true },
    });
    const myConversationIds = sharedConversations.map((m) => m.conversationId);

    let existing = null;
    if (myConversationIds.length > 0) {
      const otherMembership = await prisma.conversationMember.findFirst({
        where: {
          userId: otherUser.id,
          conversationId: { in: myConversationIds },
        },
        select: { conversationId: true },
      });

      if (otherMembership) {
        existing = await prisma.conversation.findFirst({
          where: {
            id: otherMembership.conversationId,
            isGroup: false,
          },
          include: {
            members: { include: { user: { include: { profile: true } } } },
          },
        });
      }
    }

    const conversation =
      existing ??
      (await prisma.conversation.create({
        data: {
          isGroup: false,
          createdById: userId,
          members: {
            create: [
              { userId: userAId, role: userAId === userId ? "OWNER" : "MEMBER" },
              { userId: userBId, role: userBId === userId ? "OWNER" : "MEMBER" },
            ],
          },
        },
        include: {
          members: { include: { user: { include: { profile: true } } } },
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
    };

    const response = NextResponse.json({ type: "thread", thread }, { status: 201 });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return response;
  } catch (error) {
    console.error("Message thread create error:", error);
    let message = "Unable to start thread";
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2021") {
        message = "Messaging tables are not initialized. Run database migrations.";
      } else {
        message = `Messaging error (${error.code})`;
      }
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
