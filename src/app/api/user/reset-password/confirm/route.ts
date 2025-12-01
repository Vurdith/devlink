import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { hash } from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword, confirmPassword } = body;

    // Validate input
    if (!token || !newPassword || !confirmPassword) {
      return NextResponse.json({ 
        error: "Token, new password, and confirmation are required" 
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

    // Find and validate token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            password: true
          }
        }
      }
    });

    if (!resetToken) {
      return NextResponse.json({ 
        error: "Invalid or expired reset token" 
      }, { status: 400 });
    }

    // Check if token is expired
    if (resetToken.expires < new Date()) {
      // Clean up expired token
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id }
      });
      
      return NextResponse.json({ 
        error: "Reset token has expired. Please request a new password reset." 
      }, { status: 400 });
    }

    // Check if user still has password set (not OAuth-only)
    if (!resetToken.user.password) {
      return NextResponse.json({ 
        error: "This account doesn't have a password set. Use OAuth login." 
      }, { status: 400 });
    }

    // Check if new password is different from current
    const bcrypt = require('bcryptjs');
    const isSamePassword = await bcrypt.compare(newPassword, resetToken.user.password);
    if (isSamePassword) {
      return NextResponse.json({ 
        error: "New password must be different from your current password" 
      }, { status: 400 });
    }

    // Hash new password
    const hashedNewPassword = await hash(newPassword, 12);

    // Update user password, delete used token, and invalidate all sessions
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.user.id },
        data: { 
          password: hashedNewPassword,
          updatedAt: new Date()
        }
      }),
      prisma.passwordResetToken.delete({
        where: { id: resetToken.id }
      }),
      // Invalidate all sessions for this user - forces re-login everywhere
      prisma.session.deleteMany({
        where: { userId: resetToken.user.id }
      })
    ]);

    return NextResponse.json({ 
      success: true,
      message: "Password reset successfully. Please log in with your new password." 
    });

  } catch (error) {
    console.error("Error confirming password reset:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}

































