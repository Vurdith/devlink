import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth-options";
import { prisma } from "@/server/db";

// GET /api/skills - Get all available skills
export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: [
        { name: "asc" },
      ],
    });

    return NextResponse.json(skills);
  } catch (error) {
    console.error("Error fetching skills:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills" },
      { status: 500 }
    );
  }
}

// POST /api/skills - Create a custom skill
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Skill name is required" }, { status: 400 });
    }

    const trimmedName = name.trim();
    
    if (trimmedName.length < 2) {
      return NextResponse.json({ error: "Skill name must be at least 2 characters" }, { status: 400 });
    }
    
    if (trimmedName.length > 50) {
      return NextResponse.json({ error: "Skill name must be 50 characters or less" }, { status: 400 });
    }

    // Check if skill already exists (case insensitive)
    const existingSkill = await prisma.skill.findFirst({
      where: { 
        name: { 
          equals: trimmedName, 
          mode: "insensitive" 
        } 
      },
    });

    if (existingSkill) {
      // Return the existing skill instead of creating a duplicate
      return NextResponse.json(existingSkill);
    }

    // Create new skill with CUSTOM category
    const skill = await prisma.skill.create({
      data: {
        name: trimmedName,
        category: "CUSTOM",
      },
    });

    return NextResponse.json(skill, { status: 201 });
  } catch (error) {
    console.error("Error creating skill:", error);
    return NextResponse.json(
      { error: "Failed to create skill" },
      { status: 500 }
    );
  }
}

