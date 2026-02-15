import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getAuthSession } from "@/server/auth";
import { responseCache } from "@/lib/cache";

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ 
    where: { email: session.user.email }, 
    select: { 
      id: true,
      username: true,
      name: true,
      profile: {
        select: {
          avatarUrl: true,
          bannerUrl: true,
          profileType: true,
          verified: true,
          bio: true,
          website: true,
          location: true,
          availability: true,
          hourlyRate: true,
          currency: true,
          headline: true,
          responseTime: true,
        }
      }
    } 
  });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ user: { id: user.id, username: user.username, name: user.name }, profile: user.profile, name: user.name });
}

async function handleProfileUpdate(req: Request) {
  const session = await getAuthSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { 
    avatarUrl, 
    bannerUrl, 
    bio, 
    location, 
    website, 
    profileType, 
    name,
    availability,
    hourlyRate,
    currency,
    headline,
    responseTime,
  } = body as {
    avatarUrl?: string;
    bannerUrl?: string;
    bio?: string;
    location?: string;
    website?: string;
    profileType?: string;
    name?: string;
    availability?: string;
    hourlyRate?: number | null;
    currency?: string;
    headline?: string;
    responseTime?: string;
  };
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.profile.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  const data: Record<string, string | number | null | undefined> = {};
  if (typeof avatarUrl === "string") data.avatarUrl = avatarUrl;
  if (typeof bannerUrl === "string") data.bannerUrl = bannerUrl;
  if (typeof bio === "string") data.bio = bio.slice(0, 500); // Allow longer bio
  if (typeof location === "string") data.location = location;
  if (typeof website === "string") data.website = website;
  if (typeof profileType === "string") data.profileType = profileType;
  if (typeof availability === "string") data.availability = availability;
  if (hourlyRate !== undefined) data.hourlyRate = hourlyRate;
  if (typeof currency === "string") data.currency = currency;
  if (typeof headline === "string") data.headline = headline.slice(0, 100);
  if (typeof responseTime === "string") data.responseTime = responseTime;

  const profile = await prisma.profile.update({
    where: { userId: user.id },
    data,
  });

  // Update user name if provided
  if (typeof name === "string") {
    await prisma.user.update({
      where: { id: user.id },
      data: { name: name.trim() || null },
    });
  }
  
  // Invalidate all profile-related caches
  const username = user.username;
  if (username) {
    await Promise.all([
      responseCache.delete(`profile:page:${username.toLowerCase()}`),
      responseCache.delete(`user:profile:${username.toLowerCase()}`),
    ]).catch(() => {});
  }
  
  return NextResponse.json({ 
    profile,
    avatarUrl: profile.avatarUrl,
    bannerUrl: profile.bannerUrl,
    name: typeof name === "string" ? name.trim() : undefined,
    profileType: profile.profileType,
  });
}

export async function PATCH(req: Request) {
  return handleProfileUpdate(req);
}

export async function PUT(req: Request) {
  return handleProfileUpdate(req);
}


