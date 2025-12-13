import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json().catch(() => null)) as
      | { ids?: string[]; all?: boolean }
      | null;

    const now = new Date();

    if (body?.all) {
      await prisma.notification.updateMany({
        where: { userId, readAt: null },
        data: { readAt: now },
      });
      return NextResponse.json({ ok: true });
    }

    const ids = Array.isArray(body?.ids) ? body!.ids.filter((x) => typeof x === "string") : [];
    if (ids.length === 0) return NextResponse.json({ error: "No ids provided" }, { status: 400 });

    await prisma.notification.updateMany({
      where: { userId, id: { in: ids } },
      data: { readAt: now },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Mark read error:", e);
    return NextResponse.json({ error: "Failed to mark notifications read" }, { status: 500 });
  }
}


