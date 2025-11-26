import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    // Normalize username (lowercase, trimmed)
    const normalizedUsername = username.trim().toLowerCase();

    // Check length
    if (normalizedUsername.length < 3) {
      return NextResponse.json({ 
        available: false, 
        reason: "Username must be at least 3 characters" 
      });
    }

    if (normalizedUsername.length > 30) {
      return NextResponse.json({ 
        available: false, 
        reason: "Username must be less than 30 characters" 
      });
    }

    // Check format
    if (!/^[a-z0-9_]+$/.test(normalizedUsername)) {
      return NextResponse.json({ 
        available: false, 
        reason: "Username can only contain letters, numbers, and underscores" 
      });
    }

    if (normalizedUsername.startsWith('_') || normalizedUsername.endsWith('_')) {
      return NextResponse.json({ 
        available: false, 
        reason: "Username cannot start or end with underscore" 
      });
    }

    // Check reserved usernames
    const reservedUsernames = [
      'admin', 'administrator', 'moderator', 'mod', 'support', 'help',
      'devlink', 'official', 'roblox', 'staff', 'team', 'system',
      'api', 'www', 'mail', 'email', 'null', 'undefined', 'root'
    ];

    if (reservedUsernames.includes(normalizedUsername)) {
      return NextResponse.json({ 
        available: false, 
        reason: "This username is reserved" 
      });
    }

    // Check database
    const existingUser = await prisma.user.findUnique({
      where: { username: normalizedUsername },
      select: { id: true }
    });

    if (existingUser) {
      return NextResponse.json({ 
        available: false, 
        reason: "Username is already taken" 
      });
    }

    return NextResponse.json({ available: true });
  } catch (error) {
    console.error("Username check error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}




