import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";
import { responseCache } from "@/lib/cache";

// PUT /api/users/me/availability - Update availability, rate, headline
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, username: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { availability, hourlyRate, currency, headline, responseTime } = body;

    // Validate availability
    const validAvailability = ["AVAILABLE", "BUSY", "NOT_AVAILABLE", "OPEN_TO_OFFERS"];
    if (availability && !validAvailability.includes(availability)) {
      return NextResponse.json(
        { error: "Invalid availability status" },
        { status: 400 }
      );
    }

    // Validate response time
    const validResponseTime = ["WITHIN_HOURS", "WITHIN_DAY", "WITHIN_WEEK", null];
    if (responseTime !== undefined && !validResponseTime.includes(responseTime)) {
      return NextResponse.json(
        { error: "Invalid response time" },
        { status: 400 }
      );
    }

    // Validate hourly rate (must be positive if provided)
    if (hourlyRate !== undefined && hourlyRate !== null && hourlyRate < 0) {
      return NextResponse.json(
        { error: "Hourly rate must be positive" },
        { status: 400 }
      );
    }

    // Validate headline length
    if (headline && headline.length > 150) {
      return NextResponse.json(
        { error: "Headline must be 150 characters or less" },
        { status: 400 }
      );
    }

    // Update or create profile
    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        ...(availability !== undefined && { availability }),
        ...(hourlyRate !== undefined && { hourlyRate }),
        ...(currency !== undefined && { currency }),
        ...(headline !== undefined && { headline }),
        ...(responseTime !== undefined && { responseTime }),
      },
      create: {
        userId: user.id,
        availability: availability || "AVAILABLE",
        hourlyRate,
        currency: currency || "USD",
        headline,
        responseTime,
      },
    });

    // Invalidate profile cache
    await responseCache.delete(`profile:page:${user.username.toLowerCase()}`);

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error updating availability:", error);
    return NextResponse.json(
      { error: "Failed to update availability" },
      { status: 500 }
    );
  }
}

// GET /api/users/me/availability - Get current user's availability info
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        profile: {
          select: {
            availability: true,
            hourlyRate: true,
            currency: true,
            headline: true,
            responseTime: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      availability: user.profile?.availability || "AVAILABLE",
      hourlyRate: user.profile?.hourlyRate || null,
      currency: user.profile?.currency || "USD",
      headline: user.profile?.headline || null,
      responseTime: user.profile?.responseTime || null,
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

