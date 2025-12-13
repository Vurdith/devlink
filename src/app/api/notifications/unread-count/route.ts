import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const count = await prisma.notification.count({
      where: { userId, readAt: null },
    });

    return NextResponse.json({ unread: count });
  } catch (e) {
    console.error("Unread count error:", e);
    return NextResponse.json({ error: "Failed to load unread count" }, { status: 500 });
  }
}


