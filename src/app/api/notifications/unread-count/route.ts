import { NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";

function explainNotificationDbError(e: unknown) {
  const err = e as { message?: string; code?: string } | null;
  const msg = typeof err?.message === "string" ? err.message : "";
  const code = err?.code;
  const looksLikeMissingTable =
    code === "P2021" ||
    msg.includes("does not exist") ||
    msg.includes("relation") ||
    msg.includes("Notification");
  if (looksLikeMissingTable) {
    return {
      error:
        "Notifications table missing in your database. Apply the migration and restart the server.",
    };
  }
  return { error: "Failed to load unread count" };
}

export async function GET() {
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const count = await prisma.notification.count({
      where: { userId, readAt: null },
    });

    return NextResponse.json({ unread: count });
  } catch (e) {
    console.error("Unread count error:", e);
    const payload = explainNotificationDbError(e);
    if (process.env.NODE_ENV !== "production") {
      const err = e as { code?: string; message?: string } | null;
      (payload as Record<string, unknown>).debug = {
        code: err?.code,
        message: err?.message,
      };
    }
    return NextResponse.json(payload, { status: 500 });
  }
}


