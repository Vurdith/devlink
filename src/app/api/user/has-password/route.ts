import { NextResponse } from "next/server";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";

export async function GET() {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      hasPassword: !!user.password 
    });

  } catch (error) {
    console.error("Error checking password:", error);
    return NextResponse.json(
      { error: "Failed to check password" },
      { status: 500 }
    );
  }
}


