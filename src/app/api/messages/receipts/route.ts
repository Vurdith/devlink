import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { responseCache } from "@/lib/cache";

type ReceiptStatus = "delivered" | "read";

function keyFor(messageId: string, userId: string) {
  return `message:receipt:${messageId}:${userId}`;
}

export async function POST(request: NextRequest) {
  const session = await getAuthSession();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    messageId?: string;
    status?: ReceiptStatus;
  };

  if (!body.messageId || !body.status) {
    return NextResponse.json({ error: "messageId and status are required" }, { status: 400 });
  }

  await responseCache.set(
    keyFor(body.messageId, userId),
    {
      status: body.status,
      userId,
      updatedAt: new Date().toISOString(),
    },
    60 * 60 * 24 * 7
  );

  return NextResponse.json({ ok: true });
}

export async function GET(request: NextRequest) {
  const messageId = request.nextUrl.searchParams.get("messageId");
  const userId = request.nextUrl.searchParams.get("userId");
  if (!messageId || !userId) {
    return NextResponse.json({ error: "messageId and userId are required" }, { status: 400 });
  }

  const receipt = await responseCache.get<{
    status: ReceiptStatus;
    userId: string;
    updatedAt: string;
  }>(keyFor(messageId, userId));

  return NextResponse.json({ receipt: receipt ?? null });
}
