import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { NextResponse } from "next/server";
import { parseJsonObjectBody } from "@/lib/api-utils";
import { validateId } from "@/lib/validation";

// Create a new report
export async function POST(req: Request) {
  const session = await getAuthSession();
  const currentUserId = session?.user?.id;
  
  if (!currentUserId) {
    return NextResponse.json({ error: "Sign in to submit a report." }, { status: 401 });
  }

  try {
    const parsedBody = await parseJsonObjectBody(req, {
      invalidJsonMessage: "Send report details as valid JSON.",
      nonObjectMessage: "Send report details as valid JSON.",
    });
    if (!parsedBody.ok) {
      return parsedBody.response;
    }
    const body = parsedBody.data;
    const { reportType, description } = body;
    const targetUserId = typeof body.targetUserId === "string" ? body.targetUserId : undefined;
    const postId = typeof body.postId === "string" ? body.postId : undefined;
    const evidence = typeof body.evidence === "string" && body.evidence.trim() ? body.evidence : null;

    // Validate required fields
    if (!reportType || !description) {
      return NextResponse.json({ error: "Choose an issue type and describe what happened." }, { status: 400 });
    }

    if (typeof reportType !== 'string' || typeof description !== 'string') {
      return NextResponse.json({ error: "Report type and description must be text." }, { status: 400 });
    }

    if ((body.targetUserId && !targetUserId) || (body.postId && !postId)) {
      return NextResponse.json({ error: "The reported post or account could not be identified." }, { status: 400 });
    }

    // Validate description length
    if (description.length < 10) {
      return NextResponse.json({ error: "Add at least 10 characters describing what happened." }, { status: 400 });
    }
    if (description.length > 5000) {
      return NextResponse.json({ error: "Keep the description under 5000 characters." }, { status: 400 });
    }

    // Validate report type
    const validReportTypes = ["SCAM", "SPAM", "HARASSMENT", "FAKE_PROFILE", "INAPPROPRIATE_CONTENT", "OTHER"];
    if (!validReportTypes.includes(reportType)) {
      return NextResponse.json({ error: "Choose a supported issue type." }, { status: 400 });
    }

    // Validate IDs if provided
    if (targetUserId) {
      const idValidation = validateId(targetUserId);
      if (!idValidation.isValid) {
        return NextResponse.json({ error: "The reported account could not be identified." }, { status: 400 });
      }
      // Check if user is reporting themselves
      if (targetUserId === currentUserId) {
        return NextResponse.json({ error: "You cannot report your own account." }, { status: 400 });
      }
    }
    
    if (postId) {
      const idValidation = validateId(postId);
      if (!idValidation.isValid) {
        return NextResponse.json({ error: "The reported post could not be identified." }, { status: 400 });
      }
    }

    if (!targetUserId && !postId) {
      return NextResponse.json({ error: "Open report from the post or profile you want reviewed." }, { status: 400 });
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
      return NextResponse.json({ error: "You have already reported this recently. Please wait before submitting another report." }, { status: 429 });
    }

    // Create the report
    const report = await prisma.report.create({
      data: {
        reporterId: currentUserId,
        reportType,
        description,
        evidence,
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Get reports (admin only)
export async function GET(req: Request) {
  const session = await getAuthSession();
  const currentUserId = session?.user?.id;
  
  if (!currentUserId) {
    return NextResponse.json({ error: "Sign in to view reports." }, { status: 401 });
  }

  // Check if user is admin (you can implement your own admin logic here)
  const user = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { role: true }
  });

  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Only admins can view reports." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const reportType = searchParams.get("reportType");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const where: { status?: string; reportType?: string } = {};
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
