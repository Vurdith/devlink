"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, CheckCircle2, Clock3, DollarSign, MapPin, Send, Users, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToastContext } from "@/components/providers/ToastProvider";
import { cn } from "@/lib/cn";
import { safeJson } from "@/lib/safe-json";
import { iconBox, surface, ui } from "@/components/ui/design-system";
import type { Job, JobApplication } from "@/types/api";

type ViewerApplication = Pick<JobApplication, "id" | "status" | "createdAt">;
type JobDetail = Job & { applications?: ViewerApplication[] };

const fieldClass = ui.control.field;

function formatBudget(job: Pick<Job, "budgetMin" | "budgetMax" | "currency">) {
  if (job.budgetMin && job.budgetMax) return `${job.currency} ${job.budgetMin} - ${job.budgetMax}`;
  if (job.budgetMin) return `${job.currency} ${job.budgetMin}+`;
  if (job.budgetMax) return `Up to ${job.currency} ${job.budgetMax}`;
  return "Budget flexible";
}

function statusLabel(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function statusPillClass(status: string) {
  const normalized = status.toUpperCase();
  const tone =
    normalized === "OPEN" || normalized === "ACCEPTED"
      ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-200"
      : normalized === "PENDING"
        ? "border-[rgba(var(--color-accent-2-rgb),0.24)] bg-[rgba(var(--color-accent-2-rgb),0.10)] text-[var(--color-accent-2)]"
        : normalized === "DECLINED" || normalized === "CLOSED"
          ? "border-rose-400/20 bg-rose-500/10 text-rose-200"
          : "border-white/[0.10] bg-white/[0.04] text-white/60";

  return cn("inline-flex w-fit items-center rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.10em]", tone);
}

export default function JobDetailPage() {
  const params = useParams<{ jobId: string }>();
  const { data: session } = useSession();
  const { toast } = useToastContext();
  const userId = session?.user?.id;
  const [job, setJob] = useState<JobDetail | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [applicationNote, setApplicationNote] = useState("");
  const [applying, setApplying] = useState(false);
  const [updatingApplicationId, setUpdatingApplicationId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      const res = await fetch(`/api/jobs/${params.jobId}`);
      const data = await safeJson<JobDetail>(res);
      if (isMounted) {
        setJob(data || null);
      }

      if (userId && data?.userId === userId) {
        const appsRes = await fetch(`/api/jobs/${params.jobId}/applications`);
        const appsData = await safeJson<JobApplication[]>(appsRes);
        if (isMounted) {
          setApplications(appsData || []);
        }
      }

      if (isMounted) setLoading(false);
    }

    if (params.jobId) load();
    return () => {
      isMounted = false;
    };
  }, [params.jobId, userId]);

  const isOwner = userId === job?.userId;
  const viewerApplication = useMemo(() => job?.applications?.[0] || null, [job?.applications]);
  const canApply = Boolean(userId && job && !isOwner && job.status === "OPEN" && !viewerApplication);

  async function apply() {
    if (!canApply) return;
    setApplying(true);
    try {
      const res = await fetch(`/api/jobs/${params.jobId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: applicationNote.trim() }),
      });
      const data = await safeJson<JobApplication & { error?: string }>(res);
      if (!res.ok) {
        toast({
          title: "Application was not sent",
          description: data?.error || "Try again in a moment.",
          variant: "destructive",
        });
        return;
      }
      if (data) {
        setJob((prev) => (prev ? { ...prev, applications: [{ id: data.id, status: data.status, createdAt: data.createdAt }] } : prev));
      }
      setApplicationNote("");
      toast({
        title: "Application sent",
        description: "The client can review your note from this job brief.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Application was not sent",
        description: "Check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setApplying(false);
    }
  }

  async function updateApplicationStatus(applicationId: string, status: "ACCEPTED" | "DECLINED") {
    setUpdatingApplicationId(applicationId);
    try {
      const res = await fetch(`/api/jobs/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await safeJson<(JobApplication & { error?: string }) | { error?: string }>(res);
      if (!res.ok) {
        toast({
          title: "Application was not updated",
          description: data?.error || "Try again in a moment.",
          variant: "destructive",
        });
        return;
      }
      setApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status } : app))
      );
      toast({
        title: status === "ACCEPTED" ? "Application accepted" : "Application declined",
        description: status === "ACCEPTED" ? "The candidate can now see that you accepted their application." : "The candidate can now see that you declined their application.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Application was not updated",
        description: "Check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingApplicationId(null);
    }
  }

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 pb-24 pt-8">
        <div className={surface("panel", "noise-overlay relative overflow-hidden p-5 sm:p-6")}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.28)] to-transparent" />
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="skeleton h-4 w-24 rounded-lg" />
              <div className="skeleton h-7 w-4/5 max-w-lg rounded-lg" />
              <div className="skeleton h-4 w-48 rounded-lg" />
            </div>
            <div className="skeleton h-7 w-20 rounded-lg" />
          </div>
          <div className="mt-6 space-y-2">
            <div className="skeleton h-4 w-full rounded-lg" />
            <div className="skeleton h-4 w-11/12 rounded-lg" />
            <div className="skeleton h-4 w-3/5 rounded-lg" />
          </div>
        </div>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="max-w-4xl mx-auto px-4 pb-24 pt-8">
        <div className={surface("empty", "flex flex-col gap-3 p-5 text-sm text-[var(--muted-foreground)] sm:flex-row sm:items-center sm:justify-between")}>
          <div>
            <div className="font-semibold text-white">Job not found</div>
            <p className="mt-1">This listing may have been removed or the link may be out of date.</p>
          </div>
          <Link href="/jobs" className={cn("inline-flex h-9 items-center justify-center rounded-lg px-4 text-xs font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.65)]", ui.control.ghost)}>
            Back to jobs
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-8">
      <Link href="/jobs" className="mb-4 inline-flex items-center gap-2 rounded-lg px-1 py-1 text-xs font-semibold text-[var(--muted-foreground)] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.65)]">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to jobs
      </Link>
      <div className={surface("panel", "noise-overlay relative overflow-hidden p-5 sm:p-6")}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.40)] to-transparent" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-accent-2)]">Job brief</div>
            <h1 className="text-2xl font-bold text-white">{job.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted-foreground)]">
              <span className="text-white/70">@{job.user?.username || "unknown"}</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {job.location || "Remote"}
              </span>
            </div>
          </div>
          <span className={statusPillClass(job.status)}>
            {statusLabel(job.status)}
          </span>
        </div>
        <p className="mt-5 whitespace-pre-wrap border-l border-[rgba(var(--color-accent-2-rgb),0.26)] pl-4 text-sm leading-relaxed text-white/78">{job.description}</p>
        <div className="mt-5 grid gap-2 rounded-lg border border-white/[0.07] bg-black/10 p-3 text-xs text-[var(--muted-foreground)] sm:grid-cols-3">
          <span className="min-w-0 truncate rounded-md border border-white/[0.08] bg-white/[0.035] px-2.5 py-2 text-white/70">{job.skills || "Skills flexible"}</span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.035] px-2.5 py-2">
            <DollarSign className="h-3.5 w-3.5 text-[var(--color-accent-2)]" aria-hidden="true" />
            {formatBudget(job)}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.035] px-2.5 py-2">
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            {job._count?.applications ?? 0} applicants
          </span>
        </div>

        {!userId ? (
          <div className={surface("empty", "mt-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between")}>
            <div>
              <div className="text-sm font-semibold text-white">Sign in to apply</div>
              <p className="mt-1 text-xs leading-relaxed text-[var(--muted-foreground)]">Create an account or log in to send a note to the client.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link href="/login" className={cn("inline-flex h-9 items-center justify-center rounded-lg px-4 text-xs font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.65)]", ui.control.ghost)}>
                Log in
              </Link>
              <Link href="/register" className={cn("inline-flex h-9 items-center justify-center rounded-lg px-4 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.65)]", ui.control.gradient)}>
                Sign up
              </Link>
            </div>
          </div>
        ) : null}

        {viewerApplication ? (
          <div className="mt-5 rounded-lg border border-[rgba(var(--color-accent-2-rgb),0.18)] bg-[rgba(var(--color-accent-2-rgb),0.06)] px-3 py-2 text-xs leading-relaxed text-[var(--color-accent-2)]">
            Application {statusLabel(viewerApplication.status).toLowerCase()}. Track updates from My applications on the jobs page.
          </div>
        ) : null}

        {canApply ? (
          <div className={surface("empty", "mt-5 p-4")}>
            <label className="text-xs font-semibold uppercase tracking-[0.10em] text-white/60" htmlFor="application-note">
              Application note
            </label>
            <textarea
              id="application-note"
              value={applicationNote}
              onChange={(event) => setApplicationNote(event.target.value)}
              placeholder="Share fit, availability, or one relevant Roblox project."
              className={cn(fieldClass, "mt-2 min-h-[104px] resize-y")}
            />
            <div className="mt-3 flex flex-col gap-2 rounded-lg border border-white/[0.07] bg-black/10 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-[var(--muted-foreground)]">The client will see this with your profile.</p>
              <Button
                onClick={apply}
                disabled={applying}
                isLoading={applying}
                size="sm"
                variant="glow"
                className="w-full sm:w-auto"
                leftIcon={<Send className="h-4 w-4" aria-hidden="true" />}
              >
                Send application
              </Button>
            </div>
          </div>
        ) : null}

        {isOwner ? (
          <div className="mt-5 rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-xs leading-relaxed text-white/65">
            This is your listing. Review applications below and keep candidates moving with a clear accept or decline.
          </div>
        ) : null}

        {job.status !== "OPEN" && !isOwner && userId && !viewerApplication ? (
          <div className="mt-5 rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-xs leading-relaxed text-white/65">
            This listing is closed, so new applications are paused.
          </div>
        ) : null}
      </div>

      {isOwner && (
        <div className={surface("panel", "noise-overlay mt-6 p-5 sm:p-6")}>
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Applications</h2>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">Accept candidates you want to move forward with, or decline to close the loop.</p>
            </div>
            <span className="text-xs text-[var(--muted-foreground)]">{applications.length} total</span>
          </div>
          {applications.length === 0 ? (
            <div className={surface("empty", "flex items-start gap-3 p-4")}>
              <div className={iconBox("muted", "h-10 w-10 flex-shrink-0")}>
                <Clock3 className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">No applications yet</div>
                <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">Keep the brief open and share the job link with developers who fit the work.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {applications.map((app) => {
                const isPending = app.status === "PENDING";
                const isUpdating = updatingApplicationId === app.id;
                return (
                  <div key={app.id} className={surface("panelMuted", "p-4 transition-colors hover:border-white/[0.14]")}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <span className="font-semibold text-white">{app.applicant?.username || "Applicant"}</span>
                      <span className={statusPillClass(app.status)}>{statusLabel(app.status)}</span>
                    </div>
                    {app.message ? (
                      <p className="mt-3 whitespace-pre-wrap border-l border-[rgba(var(--color-accent-2-rgb),0.22)] pl-3 text-xs leading-relaxed text-white/70">{app.message}</p>
                    ) : (
                      <p className="mt-3 text-xs leading-relaxed text-[var(--muted-foreground)]">No note included with this application.</p>
                    )}
                    {isPending ? (
                      <div className="mt-3 flex flex-col gap-2 rounded-lg border border-white/[0.07] bg-black/10 p-2 sm:flex-row">
                        <Button
                          onClick={() => updateApplicationStatus(app.id, "ACCEPTED")}
                          disabled={isUpdating}
                          isLoading={isUpdating}
                          size="sm"
                          variant="glow"
                          className="w-full sm:w-auto"
                          leftIcon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
                        >
                          Accept
                        </Button>
                        <Button
                          onClick={() => updateApplicationStatus(app.id, "DECLINED")}
                          disabled={isUpdating}
                          size="sm"
                          variant="ghost"
                          className="w-full sm:w-auto"
                          leftIcon={<XCircle className="h-4 w-4" aria-hidden="true" />}
                        >
                          Decline
                        </Button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
