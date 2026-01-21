import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
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

  const threads = await prisma.messageThread.findMany({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    include: {
      userA: { include: { profile: true } },
      userB: { include: { profile: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  const response = NextResponse.json(threads);
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;

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

    if (!(prisma as any).messageThread) {
      return NextResponse.json(
        { error: "Messaging tables are not initialized. Run prisma generate/migrate." },
        { status: 500 }
      );
    }

    const thread = await prisma.messageThread.upsert({
      where: { userAId_userBId: { userAId, userBId } },
      update: {},
      create: { userAId, userBId },
      include: {
        userA: { include: { profile: true } },
        userB: { include: { profile: true } },
      },
    });

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
