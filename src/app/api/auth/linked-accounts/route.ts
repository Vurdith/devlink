import { NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";

export async function GET() {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accounts = await prisma.account.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        provider: true,
        providerAccountId: true,
        type: true,
      },
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Error fetching linked accounts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}








