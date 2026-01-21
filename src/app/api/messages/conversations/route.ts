import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { canSendMessage } from "@/server/messages/permissions";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      members: { some: { userId } },
    },
    include: {
      members: {
        include: { user: { include: { profile: true } } },
      },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  const response = NextResponse.json(conversations);
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await checkRateLimit(`conversation_create:${userId}`, 10, 60);
  if (!rateLimit.success) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  const body = await req.json();
  const memberIds = Array.isArray(body?.memberIds) ? body.memberIds.filter((id: unknown) => typeof id === "string") : [];
  const title = typeof body?.title === "string" ? body.title.trim() : null;

  const uniqueMembers = Array.from(new Set([userId, ...memberIds]));
  const isGroup = uniqueMembers.length > 2;

  if (!isGroup && uniqueMembers.length === 2) {
    const otherUserId = uniqueMembers.find((id) => id !== userId)!;
    const allowed = await canSendMessage({ senderId: userId, recipientId: otherUserId });
    if (!allowed) {
      return NextResponse.json({ error: "Recipient only accepts message requests" }, { status: 403 });
    }
  }

  const conversation = await prisma.conversation.create({
    data: {
      title: isGroup ? title || "New group" : null,
      isGroup,
      createdById: userId,
      members: {
        create: uniqueMembers.map((memberId) => ({
          userId: memberId,
          role: memberId === userId ? "OWNER" : "MEMBER",
        })),
      },
    },
    include: {
      members: {
        include: { user: { include: { profile: true } } },
      },
    },
  });

  const response = NextResponse.json(conversation, { status: 201 });
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}
