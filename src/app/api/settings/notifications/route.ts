import { NextResponse } from "next/server";
import { parseJsonObjectBody } from "@/lib/api-utils";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { normalizeNotificationPreferences, type NotificationPreferences } from "@/server/notification-preferences";

type NotificationSettingsBody = Partial<NotificationPreferences>;

function preferencesResponse(preferences: NotificationPreferences) {
  const response = NextResponse.json(preferences);
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}

export async function GET() {
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.userNotificationSettings.findUnique({
      where: { userId },
      select: {
        likes: true,
        reposts: true,
        replies: true,
        mentions: true,
        follows: true,
      },
    });

    return preferencesResponse(normalizeNotificationPreferences(settings));
  } catch (error) {
    console.error("Notification settings GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsedBody = await parseJsonObjectBody<NotificationSettingsBody>(req);
    if (!parsedBody.ok) {
      return parsedBody.response;
    }

    const preferences = normalizeNotificationPreferences(parsedBody.data);

    const settings = await prisma.userNotificationSettings.upsert({
      where: { userId },
      create: { userId, ...preferences },
      update: preferences,
      select: {
        likes: true,
        reposts: true,
        replies: true,
        mentions: true,
        follows: true,
      },
    });

    return preferencesResponse(normalizeNotificationPreferences(settings));
  } catch (error) {
    console.error("Notification settings PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
