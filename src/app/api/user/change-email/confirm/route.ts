import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ 
        error: "Token is required" 
      }, { status: 400 });
    }

    // Find and validate token
    const emailChangeToken = await prisma.emailChangeToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    if (!emailChangeToken) {
      return NextResponse.json({ 
        error: "Invalid or expired verification token" 
      }, { status: 400 });
    }

    // Check if token is expired
    if (emailChangeToken.expires < new Date()) {
      // Clean up expired token
      await prisma.emailChangeToken.delete({
        where: { id: emailChangeToken.id }
      });
      
      return NextResponse.json({ 
        error: "Verification token has expired. Please request a new email change." 
      }, { status: 400 });
    }

    // Check if new email is still available
    const existingUser = await prisma.user.findUnique({
      where: { email: emailChangeToken.newEmail },
      select: { id: true }
    });

    if (existingUser) {
      return NextResponse.json({ 
        error: "This email address is no longer available. Please request a new email change." 
      }, { status: 400 });
    }

    // Update user email and delete used token
    await prisma.$transaction([
      prisma.user.update({
        where: { id: emailChangeToken.user.id },
        data: { 
          email: emailChangeToken.newEmail,
          emailVerified: new Date(),
          updatedAt: new Date()
        }
      }),
      prisma.emailChangeToken.delete({
        where: { id: emailChangeToken.id }
      })
    ]);

    return NextResponse.json({ 
      success: true,
      message: `Email address successfully changed to ${emailChangeToken.newEmail}` 
    });

  } catch (error) {
    console.error("Error confirming email change:", error);
    return NextResponse.json(
      { error: "Failed to confirm email change" },
      { status: 500 }
    );
  }
}


















