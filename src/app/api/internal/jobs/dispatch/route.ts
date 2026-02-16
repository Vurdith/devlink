import { NextRequest, NextResponse } from "next/server";
import { leaseDueJobs, requeueJob } from "@/lib/jobs/queue";
import { processScheduledPosts } from "@/server/jobs/process-scheduled-posts";
import { fanoutNotificationWithRust, processMediaWithRust } from "@/server/services/hotpath-client";
import { startServerSpan } from "@/lib/monitoring/tracing";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobs = await leaseDueJobs(50);
  let processed = 0;
  let failed = 0;

  for (const job of jobs) {
    try {
      if (job.type === "posts.processScheduled") {
        processed += await startServerSpan("jobs.processScheduled", "jobs", () =>
          processScheduledPosts()
        );
      } else if (job.type === "notifications.fanout") {
        const payload = job.payload as { notificationId?: string; recipientId: string };
        await fanoutNotificationWithRust({
          notificationId: payload.notificationId,
          recipientId: payload.recipientId,
          actorId: "system",
          kind: "FANOUT",
        });
        processed += 1;
      } else if (job.type === "media.process") {
        const payload = job.payload as { mediaId: string; mediaType: "image" | "video"; url: string };
        await processMediaWithRust(payload);
        processed += 1;
      }
    } catch (error) {
      failed += 1;
      await requeueJob({ ...job, attempts: job.attempts + 1 }, 30);
      console.error("[JobDispatch] failed job", job.id, error);
    }
  }

  return NextResponse.json({
    leased: jobs.length,
    processed,
    failed,
  });
}
