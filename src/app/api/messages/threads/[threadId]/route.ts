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
  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    include: {
      userA: { include: { profile: true } },
      userB: { include: { profile: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  if (thread.userAId !== userId && thread.userBId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const response = NextResponse.json(thread);
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}
