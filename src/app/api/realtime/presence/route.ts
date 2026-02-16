import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { responseCache } from "@/lib/cache";

function keyFor(userId: string) {
  return `presence:user:${userId}`;
}

export async function GET(request: NextRequest) {
  const userIds = request.nextUrl.searchParams.getAll("userId").filter(Boolean);
  if (userIds.length === 0) {
    return NextResponse.json({ presence: {} });
  }

  const entries = await Promise.all(
    userIds.map(async (userId) => ({
      userId,
      status: (await responseCache.get<{ status: "online" | "offline"; updatedAt: string }>(
        keyFor(userId)
      )) ?? { status: "offline" as const, updatedAt: new Date(0).toISOString() },
    }))
  );

  return NextResponse.json({
    presence: Object.fromEntries(entries.map((entry) => [entry.userId, entry.status])),
  });
}

export async function PUT(_request: NextRequest) {
  const session = await getAuthSession();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await responseCache.set(
    keyFor(userId),
    {
      status: "online" as const,
      updatedAt: new Date().toISOString(),
    },
    60
  );

  return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest) {
  return PUT(request);
}

export async function DELETE() {
  const session = await getAuthSession();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await responseCache.set(
    keyFor(userId),
    {
      status: "offline" as const,
      updatedAt: new Date().toISOString(),
    },
    60
  );

  return NextResponse.json({ ok: true });
}
