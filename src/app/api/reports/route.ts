import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { NextResponse } from "next/server";
import { validateId } from "@/lib/validation";

// Create a new report
export async function POST(req: Request) {
  const session = await getAuthSession();
  const currentUserId = session?.user?.id;
  
  if (!currentUserId) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const body = await req.json();
    const { reportType, description, evidence, targetUserId, postId } = body;

    // Validate required fields
    if (!reportType || !description) {
      return NextResponse.json({ error: "Missing required fields: reportType and description" }, { status: 400 });
    }

    if (typeof reportType !== 'string' || typeof description !== 'string') {
      return NextResponse.json({ error: "reportType and description must be strings" }, { status: 400 });
    }

    // Validate description length
    if (description.length < 10) {
      return NextResponse.json({ error: "Description must be at least 10 characters" }, { status: 400 });
    }
    if (description.length > 5000) {
      return NextResponse.json({ error: "Description must be less than 5000 characters" }, { status: 400 });
    }

    // Validate report type
    const validReportTypes = ["SCAM", "SPAM", "HARASSMENT", "FAKE_PROFILE", "INAPPROPRIATE_CONTENT", "OTHER"];
    if (!validReportTypes.includes(reportType)) {
      return NextResponse.json({ error: `Invalid report type. Must be one of: ${validReportTypes.join(', ')}` }, { status: 400 });
    }

    // Validate IDs if provided
    if (targetUserId) {
      const idValidation = validateId(targetUserId);
      if (!idValidation.isValid) {
        return NextResponse.json({ error: `Invalid targetUserId: ${idValidation.errors[0]}` }, { status: 400 });
      }
      // Check if user is reporting themselves
      if (targetUserId === currentUserId) {
        return NextResponse.json({ error: "Cannot report yourself" }, { status: 400 });
      }
    }
    
    if (postId) {
      const idValidation = validateId(postId);
      if (!idValidation.isValid) {
        return NextResponse.json({ error: `Invalid postId: ${idValidation.errors[0]}` }, { status: 400 });
      }
    }

    if (!targetUserId && !postId) {
      return NextResponse.json({ error: "Either targetUserId or postId must be provided" }, { status: 400 });
    }

    // Check if user has already reported this target recently (within 24 hours)
    const recentReport = await prisma.report.findFirst({
      where: {
        reporterId: currentUserId,
        targetUserId: targetUserId || null,
        postId: postId || null,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
        }
      }
    });

    if (recentReport) {
      return new NextResponse("You have already reported this recently. Please wait before submitting another report.", { status: 429 });
    }

    // Create the report
    const report = await prisma.report.create({
      data: {
        reporterId: currentUserId,
        reportType,
        description,
        evidence: evidence || null,
        targetUserId: targetUserId || null,
        postId: postId || null,
        status: "PENDING"
      },
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
            name: true
          }
        },
        targetUser: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error creating report:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

// Get reports (admin only)
export async function GET(req: Request) {
  const session = await getAuthSession();
  const currentUserId = session?.user?.id;
  
  if (!currentUserId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Check if user is admin (you can implement your own admin logic here)
  const user = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { role: true }
  });

  if (user?.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const reportType = searchParams.get("reportType");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (reportType) where.reportType = reportType;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              username: true,
              name: true
            }
          },
          targetUser: {
            select: {
              id: true,
              username: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit
      }),
      prisma.report.count({ where })
    ]);

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
