import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { enqueueJob, leaseDueJobs, requeueJob } from "@/lib/jobs/queue";
import { processScheduledPosts } from "@/server/jobs/process-scheduled-posts";
import { startServerSpan, captureTracingError } from "@/lib/monitoring/tracing";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const forceProcess = request.nextUrl.searchParams.get("forceProcess") === "1";
    if (forceProcess) {
      const processed = await startServerSpan("jobs.processScheduled.now", "jobs", () =>
        processScheduledPosts()
      );
      return NextResponse.json({
        message: `Processed ${processed} scheduled posts`,
        processed,
      });
    }

    const job = await enqueueJob("posts.processScheduled", {
      triggeredAt: new Date().toISOString(),
    });

    return NextResponse.json({
      message: "Scheduled post processing job enqueued",
      jobId: job.id,
      runAt: job.runAt,
    });
  } catch (error) {
    captureTracingError(error, { route: "/api/posts/process-scheduled", method: "POST" });
    console.error('❌ Error enqueuing scheduled posts:', error);
    return NextResponse.json(
      { error: 'Failed to enqueue scheduled post processing' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dueJobs = await leaseDueJobs(25);
    let processedCount = 0;
    let failedCount = 0;

    for (const job of dueJobs) {
      try {
        if (job.type === "posts.processScheduled") {
          processedCount += await processScheduledPosts();
        }
      } catch (error) {
        failedCount += 1;
        await requeueJob({ ...job, attempts: job.attempts + 1 }, 30);
        captureTracingError(error, {
          route: "/api/posts/process-scheduled",
          method: "PATCH",
          jobType: job.type,
          jobId: job.id,
        });
      }
    }

    return NextResponse.json({
      leasedJobs: dueJobs.length,
      processedCount,
      failedCount,
    });
  } catch (error) {
    captureTracingError(error, { route: "/api/posts/process-scheduled", method: "PATCH" });
    return NextResponse.json(
      { error: "Failed to process queued jobs" },
      { status: 500 }
    );
  }
}

// GET endpoint to check scheduled posts without processing them
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    
    // Find posts that are scheduled and their time has come
    const readyPosts = await prisma.post.findMany({
      where: {
        isScheduled: true,
        scheduledFor: {
          lte: now
        }
      },
      select: {
        id: true,
        content: true,
        scheduledFor: true,
        user: {
          select: {
            username: true
          }
        }
      }
    });
    
    // Find all scheduled posts (including future ones)
    const allScheduledPosts = await prisma.post.findMany({
      where: {
        isScheduled: true
      },
      select: {
        id: true,
        content: true,
        scheduledFor: true,
        user: {
          select: {
            username: true
          }
        }
      },
      orderBy: {
        scheduledFor: 'asc'
      }
    });
    
    return NextResponse.json({
      readyToPublish: readyPosts.length,
      totalScheduled: allScheduledPosts.length,
      readyPosts: readyPosts.map(post => ({
        id: post.id,
        content: post.content.substring(0, 50) + '...',
        username: post.user.username,
        scheduledFor: post.scheduledFor
      })),
      allScheduled: allScheduledPosts.map(post => ({
        id: post.id,
        content: post.content.substring(0, 50) + '...',
        username: post.user.username,
        scheduledFor: post.scheduledFor,
        isReady: post.scheduledFor ? post.scheduledFor <= now : false
      }))
    });
    
  } catch (error) {
    console.error('❌ Error checking scheduled posts:', error);
    return NextResponse.json(
      { error: 'Failed to check scheduled posts' },
      { status: 500 }
    );
  }
}
