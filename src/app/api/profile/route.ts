import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";

export async function GET() {
  const session = await getServerSession(authOptions);
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
          location: true
        }
      }
    } 
  });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ user: { id: user.id, username: user.username, name: user.name }, profile: user.profile });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
      const { avatarUrl, bannerUrl, bio, location, website, profileType, name } = body as {
      avatarUrl?: string;
      bannerUrl?: string;
      bio?: string;
      location?: string;
      website?: string;
      profileType?: string;
      name?: string;
    };
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.profile.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  const data: Record<string, any> = {};
  if (typeof avatarUrl === "string") data.avatarUrl = avatarUrl;
  if (typeof bannerUrl === "string") data.bannerUrl = bannerUrl;
  if (typeof bio === "string") data.bio = bio.slice(0, 150);
  if (typeof location === "string") data.location = location;
  if (typeof website === "string") data.website = website;
  if (typeof profileType === "string") data.profileType = profileType as any;

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
  
  return NextResponse.json({ profile });
}


