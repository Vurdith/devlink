import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";
import { responseCache } from "@/lib/cache";

// GET /api/users/me/skills - Get current user's skills
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userSkills = await prisma.userSkill.findMany({
      where: { userId: user.id },
      include: {
        skill: true,
      },
      orderBy: [
        { isPrimary: "desc" },
        { createdAt: "asc" },
      ],
    });

    return NextResponse.json({ skills: userSkills });
  } catch (error) {
    console.error("Error fetching user skills:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills" },
      { status: 500 }
    );
  }
}

// POST /api/users/me/skills - Add a skill to current user
export async function POST(request: NextRequest) {
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
    const { skillId, experienceLevel = "INTERMEDIATE", yearsOfExp, isPrimary = false } = body;

    if (!skillId) {
      return NextResponse.json({ error: "Skill ID is required" }, { status: 400 });
    }

    // Verify skill exists
    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
    });

    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    // Check if user already has this skill
    const existing = await prisma.userSkill.findUnique({
      where: {
        userId_skillId: {
          userId: user.id,
          skillId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You already have this skill" },
        { status: 400 }
      );
    }

    // If setting as primary, unset other primary skills
    if (isPrimary) {
      await prisma.userSkill.updateMany({
        where: { userId: user.id, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const userSkill = await prisma.userSkill.create({
      data: {
        userId: user.id,
        skillId,
        experienceLevel,
        yearsOfExp,
        isPrimary,
      },
      include: {
        skill: true,
      },
    });

    // Invalidate profile cache
    await responseCache.delete(`profile:page:${user.username.toLowerCase()}`);

    return NextResponse.json({ skill: userSkill }, { status: 201 });
  } catch (error) {
    console.error("Error adding skill:", error);
    return NextResponse.json(
      { error: "Failed to add skill" },
      { status: 500 }
    );
  }
}

// PUT /api/users/me/skills - Update user skills (bulk)
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
    const { skills } = body;

    if (!Array.isArray(skills)) {
      return NextResponse.json(
        { error: "Skills must be an array" },
        { status: 400 }
      );
    }

    // Limit to 15 skills max
    if (skills.length > 15) {
      return NextResponse.json(
        { error: "Maximum 15 skills allowed" },
        { status: 400 }
      );
    }

    // Delete existing skills
    await prisma.userSkill.deleteMany({
      where: { userId: user.id },
    });

    // Create new skills
    if (skills.length > 0) {
      const skillData = skills.map((s: any, index: number) => ({
        userId: user.id,
        skillId: s.skillId,
        experienceLevel: s.experienceLevel || "INTERMEDIATE",
        yearsOfExp: s.yearsOfExp || null,
        isPrimary: index === 0, // First skill is primary
      }));

      await prisma.userSkill.createMany({
        data: skillData,
      });
    }

    // Invalidate profile cache
    await responseCache.delete(`profile:page:${user.username.toLowerCase()}`);

    const updatedSkills = await prisma.userSkill.findMany({
      where: { userId: user.id },
      include: { skill: true },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ skills: updatedSkills });
  } catch (error) {
    console.error("Error updating skills:", error);
    return NextResponse.json(
      { error: "Failed to update skills" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/me/skills - Remove a skill
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const skillId = searchParams.get("skillId");

    if (!skillId) {
      return NextResponse.json(
        { error: "Skill ID is required" },
        { status: 400 }
      );
    }

    await prisma.userSkill.deleteMany({
      where: {
        userId: user.id,
        skillId,
      },
    });

    // Invalidate profile cache
    await responseCache.delete(`profile:page:${user.username.toLowerCase()}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing skill:", error);
    return NextResponse.json(
      { error: "Failed to remove skill" },
      { status: 500 }
    );
  }
}

