import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
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
  const status = body?.status as string | undefined;

  if (!["ACCEPTED", "DECLINED"].includes(status || "")) {
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
    data: { status },
    include: {
      sender: { include: { profile: true } },
      recipient: { include: { profile: true } },
    },
  });

  if (status === "ACCEPTED") {
    const [userAId, userBId] = [request.senderId, request.recipientId].sort();
    const thread = await prisma.messageThread.upsert({
      where: { userAId_userBId: { userAId, userBId } },
      create: { userAId, userBId },
      update: {},
      include: {
        userA: { include: { profile: true } },
        userB: { include: { profile: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    const response = NextResponse.json({ request: updated, thread });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return response;
  }

  const response = NextResponse.json({ request: updated });
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}
