"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/cn";
import { safeJson } from "@/lib/safe-json";
import { surface, ui } from "@/components/ui/design-system";
import type { Job, JobApplication } from "@/types/api";

export default function JobDetailPage() {
  const params = useParams<{ jobId: string }>();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      const res = await fetch(`/api/jobs/${params.jobId}`);
      const data = await safeJson<Job & { userId?: string }>(res);
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

  async function apply() {
    const message = window.prompt("Add a short note for your application (optional):") || "";
    const res = await fetch(`/api/jobs/${params.jobId}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await safeJson<{ error?: string }>(res);
    if (!res.ok) {
      alert(data?.error || "Failed to apply");
      return;
    }
    alert("Application sent!");
  }

  async function updateApplicationStatus(applicationId: string, status: "ACCEPTED" | "DECLINED") {
    const res = await fetch(`/api/jobs/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await safeJson<{ error?: string }>(res);
    if (!res.ok) {
      alert(data?.error || "Failed to update application");
      return;
    }
    setApplications((prev) =>
      prev.map((app) => (app.id === applicationId ? { ...app, status } : app))
    );
  }

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 pb-24 pt-8">
        <div className={surface("empty", "p-5 text-sm text-[var(--muted-foreground)]")}>Loading job...</div>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="max-w-4xl mx-auto px-4 pb-24 pt-8">
        <div className={surface("empty", "p-5 text-sm text-[var(--muted-foreground)]")}>Job not found.</div>
      </main>
    );
  }

  const isOwner = userId === job.userId;

  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-8">
      <div className={surface("panel", "noise-overlay relative overflow-hidden p-5 sm:p-6")}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.40)] to-transparent" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-accent-2)]">Job brief</div>
            <h1 className="text-2xl font-bold text-white">{job.title}</h1>
            <p className="text-xs text-[var(--muted-foreground)] mt-2">
              {job.user?.username} | {job.location || "Remote"}
            </p>
          </div>
          <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.10em] text-white/70">
            {job.status}
          </span>
        </div>
        <p className="mt-5 whitespace-pre-wrap border-l border-[rgba(var(--color-accent-2-rgb),0.26)] pl-4 text-sm leading-relaxed text-white/78">{job.description}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/[0.06] pt-4 text-xs text-[var(--muted-foreground)]">
          <span>{job.skills || "Skills flexible"}</span>
          <span className="text-white/20">/</span>
          <span>{job.currency} {job.budgetMin || "?"} - {job.budgetMax || "?"}</span>
        </div>
        {!isOwner && userId && (
          <button
            onClick={apply}
            className={cn("mt-5 rounded-lg px-4 py-2 text-sm font-semibold transition-all", ui.control.gradient)}
          >
            Apply to this job
          </button>
        )}
      </div>

      {isOwner && (
        <div className={surface("panel", "noise-overlay mt-6 p-5 sm:p-6")}>
          <h2 className="mb-4 text-lg font-semibold text-white">Applications</h2>
          {applications.length === 0 ? (
            <div className="text-xs text-[var(--muted-foreground)]">No applications yet.</div>
          ) : (
            <div className="grid gap-3">
              {applications.map((app) => (
                <div key={app.id} className={surface("panelMuted", "p-4 transition-colors hover:border-white/[0.14]")}>
                  <div className="flex items-center justify-between text-sm text-white/80">
                    <span className="font-semibold text-white">{app.applicant?.username || "Applicant"}</span>
                    <span className="rounded-md border border-white/[0.08] bg-white/[0.035] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.10em] text-white/60">{app.status}</span>
                  </div>
                  {app.message && (
                    <p className="mt-3 border-l border-[rgba(var(--color-accent-2-rgb),0.22)] pl-3 text-xs leading-relaxed text-white/70">{app.message}</p>
                  )}
                  {app.status === "PENDING" && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => updateApplicationStatus(app.id, "ACCEPTED")}
                        className={cn("rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all", ui.control.gradient)}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(app.id, "DECLINED")}
                        className={cn("rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white transition-colors", ui.control.ghost)}
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
