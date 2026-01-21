import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";

const allowedValues = ["EVERYONE", "FOLLOWERS", "FOLLOWING", "MUTUALS", "NONE"];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.userMessagingSettings.findUnique({
      where: { userId },
    });

    const response = NextResponse.json(settings || { userId, allowFrom: "EVERYONE" });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return response;
  } catch (error) {
    console.error("Messaging settings GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { allowFrom?: string } | null = null;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const allowFrom = body?.allowFrom as string | undefined;

    if (!allowFrom || !allowedValues.includes(allowFrom)) {
      return NextResponse.json({ error: "Invalid allowFrom value" }, { status: 400 });
    }

    const settings = await prisma.userMessagingSettings.upsert({
      where: { userId },
      create: { userId, allowFrom },
      update: { allowFrom },
    });

    const response = NextResponse.json(settings);
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return response;
  } catch (error) {
    console.error("Messaging settings PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
