import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorEnabled: true },
    });

    return NextResponse.json({ enabled: user?.twoFactorEnabled ?? false });
  } catch (error) {
    console.error("Error fetching 2FA status:", error);
    return NextResponse.json(
      { error: "Failed to fetch 2FA status" },
      { status: 500 }
    );
  }
}
