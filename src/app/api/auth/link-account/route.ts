import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { provider } = await request.json();

    if (!provider || !["google", "apple", "twitter", "roblox"].includes(provider)) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    // Check if user already has this provider linked
    const existingAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: provider,
      },
    });

    if (existingAccount) {
      return NextResponse.json({ error: "Account already linked" }, { status: 400 });
    }

    // Generate a cryptographically secure state parameter for OAuth flow
    const stateToken = crypto.randomBytes(16).toString("hex");
    const state = `${session.user.id}:${provider}:${stateToken}`;
    
    // Store the state in a temporary way (you might want to use Redis or a database table for this)
    // For now, we'll use a simple approach with the OAuth URL
    
    let authUrl = "";
    
    if (provider === "google") {
      const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
        response_type: "code",
        scope: "openid email profile",
        state: state,
      });
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    } else if (provider === "apple") {
      const params = new URLSearchParams({
        client_id: process.env.APPLE_ID!,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/apple`,
        response_type: "code",
        scope: "name email",
        state: state,
      });
      authUrl = `https://appleid.apple.com/auth/authorize?${params}`;
    } else if (provider === "twitter") {
      const params = new URLSearchParams({
        client_id: process.env.TWITTER_CLIENT_ID!,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/twitter`,
        response_type: "code",
        scope: "tweet.read users.read",
        state: state,
      });
      authUrl = `https://twitter.com/i/oauth2/authorize?${params}`;
    } else if (provider === "roblox") {
      const params = new URLSearchParams({
        client_id: process.env.ROBLOX_CLIENT_ID!,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/roblox`,
        response_type: "code",
        scope: "openid profile",
        state: state,
      });
      authUrl = `https://authorize.roblox.com/v1/authorize?${params}`;
    }

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error("Error linking account:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { provider } = await request.json();

    if (!provider || !["google", "apple", "twitter", "roblox"].includes(provider)) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    // Check if user has a password (can't unlink if it's their only login method)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { accounts: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If user has no password and only one social account, don't allow unlinking
    if (!user.password && user.accounts.length <= 1) {
      return NextResponse.json({ 
        error: "Cannot unlink your only login method. Please set a password first." 
      }, { status: 400 });
    }

    // Remove the account
    await prisma.account.deleteMany({
      where: {
        userId: session.user.id,
        provider: provider,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unlinking account:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
