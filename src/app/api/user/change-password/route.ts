import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";
import { compare, hash } from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ 
        error: "All password fields are required" 
      }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ 
        error: "New password and confirmation do not match" 
      }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ 
        error: "New password must be at least 8 characters long" 
      }, { status: 400 });
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true, 
        password: true,
        email: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has a password (not OAuth-only)
    if (!user.password) {
      return NextResponse.json({ 
        error: "This account doesn't have a password set. Use OAuth login or reset your password." 
      }, { status: 400 });
    }

    // Verify current password
    const isCurrentPasswordValid = await compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ 
        error: "Current password is incorrect" 
      }, { status: 400 });
    }

    // Check if new password is different from current
    const isSamePassword = await compare(newPassword, user.password);
    if (isSamePassword) {
      return NextResponse.json({ 
        error: "New password must be different from your current password" 
      }, { status: 400 });
    }

    // Hash new password
    const hashedNewPassword = await hash(newPassword, 12);

    // Update password and invalidate all sessions (force re-login on all devices)
    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { 
          password: hashedNewPassword,
          updatedAt: new Date()
        }
      }),
      // Invalidate all sessions for this user - forces re-login everywhere
      prisma.session.deleteMany({
        where: { userId: session.user.id }
      })
    ]);

    return NextResponse.json({ 
      success: true,
      message: "Password updated successfully. Please log in again on all devices." 
    });

  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}




