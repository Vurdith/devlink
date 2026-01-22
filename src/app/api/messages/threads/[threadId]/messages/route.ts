import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { validateMessageContent } from "@/lib/validation";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await checkRateLimit(`message_send:${userId}`, 30, 60);
  if (!rateLimit.success) {
    return NextResponse.json({ error: "Too many messages. Try again later." }, { status: 429 });
  }

  const { threadId } = await params;
  const conversation = await prisma.conversation.findUnique({
    where: { id: threadId },
    include: { members: true },
  });
  if (!conversation) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  if (!conversation.members.some((member) => member.userId === userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const content = typeof body?.content === "string" ? body.content : "";

  const validation = validateMessageContent(content || "");
  if (!validation.isValid) {
    return NextResponse.json({ error: validation.errors[0] }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      conversationId: threadId,
      senderId: userId,
      content: content.trim() || null,
    },
  });

  await prisma.conversation.update({
    where: { id: threadId },
    data: { lastMessageAt: message.createdAt },
  });

  const response = NextResponse.json(
    { ...message, threadId, content: message.content ?? "" },
    { status: 201 }
  );
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}
