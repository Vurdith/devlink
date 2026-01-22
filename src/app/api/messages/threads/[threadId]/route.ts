import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { threadId } = await params;
  const conversation = await prisma.conversation.findUnique({
    where: { id: threadId },
    include: {
      members: { include: { user: { include: { profile: true } } } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  const isMember = conversation.members.some((member) => member.userId === userId);
  if (!isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

  const response = NextResponse.json(thread);
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}
