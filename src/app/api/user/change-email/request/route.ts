import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";
import { compare } from "bcryptjs";
import { generateSecureToken, sendEmailChangeVerification } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { newEmail, password } = body;

    // Validate input
    if (!newEmail || !password) {
      return NextResponse.json({ 
        error: "New email and password are required" 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json({ 
        error: "Please enter a valid email address" 
      }, { status: 400 });
    }

    const normalizedNewEmail = newEmail.toLowerCase();

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true, 
        email: true,
        password: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has a password (not OAuth-only)
    if (!user.password) {
      return NextResponse.json({ 
        error: "This account doesn't have a password set. Use OAuth login." 
      }, { status: 400 });
    }

    // Verify password
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ 
        error: "Password is incorrect" 
      }, { status: 400 });
    }

    // Check if new email is different from current
    if (normalizedNewEmail === user.email) {
      return NextResponse.json({ 
        error: "New email must be different from your current email" 
      }, { status: 400 });
    }

    // Check if new email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedNewEmail },
      select: { id: true }
    });

    if (existingUser) {
      return NextResponse.json({ 
        error: "This email address is already in use by another account" 
      }, { status: 400 });
    }

    // Delete any existing email change tokens for this user
    await prisma.emailChangeToken.deleteMany({
      where: { userId: user.id }
    });

    // Generate secure token
    const token = generateSecureToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1); // Expires in 24 hours

    // Save token to database
    await prisma.emailChangeToken.create({
      data: {
        userId: user.id,
        newEmail: normalizedNewEmail,
        token,
        expires: expiresAt
      }
    });

    // Send verification email to NEW email address
    try {
      await sendEmailChangeVerification(normalizedNewEmail, token);
    } catch (emailError) {
      console.error("Failed to send email change verification:", emailError);
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: `Verification email sent to ${normalizedNewEmail}. Please check your inbox and click the verification link.` 
    });

  } catch (error) {
    console.error("Error requesting email change:", error);
    return NextResponse.json(
      { error: "Failed to process email change request" },
      { status: 500 }
    );
  }
}

































