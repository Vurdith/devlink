import { responseCache } from "@/lib/cache";

export type JobType =
  | "posts.processScheduled"
  | "notifications.fanout"
  | "media.process";

export type JobPayloadMap = {
  "posts.processScheduled": { triggeredAt: string };
  "notifications.fanout": { notificationId?: string; recipientId: string };
  "media.process": { mediaId: string; mediaType: "image" | "video"; url: string };
};

export type EnqueuedJob<T extends JobType = JobType> = {
  id: string;
  type: T;
  payload: JobPayloadMap[T];
  attempts: number;
  maxAttempts: number;
  runAt: string;
  createdAt: string;
};

const QUEUE_KEY = "jobs:queue:v1";

async function getQueue(): Promise<EnqueuedJob[]> {
  return (await responseCache.get<EnqueuedJob[]>(QUEUE_KEY)) ?? [];
}

async function setQueue(queue: EnqueuedJob[]) {
  // Long TTL because queue owns item lifecycle; worker prunes completed jobs.
  await responseCache.set(QUEUE_KEY, queue, 60 * 60 * 24);
}

export async function enqueueJob<T extends JobType>(
  type: T,
  payload: JobPayloadMap[T],
  opts?: { delaySeconds?: number; maxAttempts?: number }
) {
  const now = new Date();
  const delaySeconds = opts?.delaySeconds ?? 0;
  const queue = await getQueue();

  const job: EnqueuedJob<T> = {
    id: crypto.randomUUID(),
    type,
    payload,
    attempts: 0,
    maxAttempts: opts?.maxAttempts ?? 5,
    runAt: new Date(now.getTime() + delaySeconds * 1000).toISOString(),
    createdAt: now.toISOString(),
  };

  queue.push(job as EnqueuedJob);
  await setQueue(queue);
  return job;
}

export async function leaseDueJobs(limit = 20) {
  const now = Date.now();
  const queue = await getQueue();
  const due = queue
    .filter((job) => new Date(job.runAt).getTime() <= now)
    .slice(0, limit);

  const leased = new Set(due.map((d) => d.id));
  const remaining = queue.filter((job) => !leased.has(job.id));
  await setQueue(remaining);
  return due;
}

export async function requeueJob(job: EnqueuedJob, delaySeconds = 30) {
  const nextAttempt = job.attempts + 1;
  if (nextAttempt > job.maxAttempts) return;

  await enqueueJob(job.type, job.payload as never, {
    delaySeconds,
    maxAttempts: job.maxAttempts,
  });
}
