import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";
import { compare } from "bcryptjs";

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { password, confirmationText } = body;

    // Get user to check if they have a password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true, 
        password: true,
        email: true,
        username: true 
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Require password confirmation for accounts with passwords
    if (user.password && !password) {
      return NextResponse.json({ 
        error: "Password confirmation required" 
      }, { status: 400 });
    }

    // Verify password if provided
    if (user.password && password) {
      const passwordValid = await compare(password, user.password);
      if (!passwordValid) {
        return NextResponse.json({ 
          error: "Invalid password" 
        }, { status: 400 });
      }
    }

    // Require typing "DELETE" to confirm
    if (confirmationText !== "DELETE") {
      return NextResponse.json({ 
        error: "Please type 'DELETE' to confirm account deletion" 
      }, { status: 400 });
    }

    // Delete the user account
    // Prisma will cascade delete all related data due to onDelete: Cascade
    await prisma.user.delete({
      where: { id: session.user.id }
    });

    return NextResponse.json({ 
      success: true,
      message: "Account deleted successfully" 
    });

  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}


