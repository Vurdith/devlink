import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    
    if (!q) {
      return NextResponse.json({ projects: [] });
    }

    console.log("Searching for projects with query:", q);

    // For now, return empty array since projects aren't implemented yet
    // This provides the framework for future project search functionality
    const projects: any[] = [];

    console.log("Found projects:", projects.length);

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Error searching projects:", error);
    return NextResponse.json({ error: "Failed to search projects" }, { status: 500 });
  }
}










