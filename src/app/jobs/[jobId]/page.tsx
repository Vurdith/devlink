"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { safeJson } from "@/lib/safe-json";
import type { Job, JobApplication } from "@/types/api";

export default function JobDetailPage() {
  const params = useParams<{ jobId: string }>();
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id as string | undefined;
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
        <div className="text-sm text-[var(--muted-foreground)]">Loading job...</div>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="max-w-4xl mx-auto px-4 pb-24 pt-8">
        <div className="text-sm text-[var(--muted-foreground)]">Job not found.</div>
      </main>
    );
  }

  const isOwner = userId === job.userId;

  return (
    <main className="max-w-4xl mx-auto px-4 pb-24 pt-8">
      <div className="glass-soft border border-white/10 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{job.title}</h1>
            <p className="text-xs text-[var(--muted-foreground)] mt-2">
              {job.user?.username} • {job.location || "Remote"}
            </p>
          </div>
          <span className="text-xs text-white/70 px-2 py-1 rounded-full bg-white/5 border border-white/10">
            {job.status}
          </span>
        </div>
        <p className="text-sm text-white/80 mt-4 leading-relaxed whitespace-pre-wrap">{job.description}</p>
        <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-[var(--muted-foreground)]">
          <span>{job.skills || "Skills flexible"}</span>
          <span>•</span>
          <span>{job.currency} {job.budgetMin || "?"} - {job.budgetMax || "?"}</span>
        </div>
        {!isOwner && userId && (
          <button
            onClick={apply}
            className="mt-5 px-4 py-2 rounded-xl text-sm font-semibold bg-[var(--color-accent)] text-black hover:brightness-110"
          >
            Apply to this job
          </button>
        )}
      </div>

      {isOwner && (
        <div className="glass-soft border border-white/10 rounded-2xl p-6 mt-6">
          <h2 className="text-lg font-semibold text-white mb-4">Applications</h2>
          {applications.length === 0 ? (
            <div className="text-xs text-[var(--muted-foreground)]">No applications yet.</div>
          ) : (
            <div className="grid gap-3">
              {applications.map((app) => (
                <div key={app.id} className="rounded-xl border border-white/10 p-3 bg-white/5">
                  <div className="flex items-center justify-between text-sm text-white/80">
                    <span>{app.applicant?.username || "Applicant"}</span>
                    <span className="text-[10px] text-white/60">{app.status}</span>
                  </div>
                  {app.message && (
                    <p className="text-xs text-white/70 mt-2">{app.message}</p>
                  )}
                  {app.status === "PENDING" && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => updateApplicationStatus(app.id, "ACCEPTED")}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-accent)] text-black"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(app.id, "DECLINED")}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/10 text-white"
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
