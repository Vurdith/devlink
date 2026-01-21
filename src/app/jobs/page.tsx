"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/cn";
import { safeJson } from "@/lib/safe-json";
import type { Job, JobApplication } from "@/types/api";

export default function JobsPage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id as string | undefined;
  const [jobs, setJobs] = useState<Job[]>([]);
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [myApplications, setMyApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    budgetMin: "",
    budgetMax: "",
    currency: "USD",
    skills: "",
    location: "",
  });

  const canCreate = Boolean(userId);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      const res = await fetch("/api/jobs?status=open");
      const data = await safeJson<{ jobs: Job[] }>(res);
      if (isMounted) {
        setJobs(data?.jobs || []);
      }

      if (userId) {
        const [jobsRes, appsRes] = await Promise.all([
          fetch(`/api/jobs?userId=${userId}`),
          fetch("/api/jobs/applications"),
        ]);
        const jobsData = await safeJson<{ jobs: Job[] }>(jobsRes);
        const appsData = await safeJson<JobApplication[]>(appsRes);
        if (isMounted) {
          setMyJobs(jobsData?.jobs || []);
          setMyApplications(appsData || []);
        }
      }

      if (isMounted) setLoading(false);
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const budgetSummary = useMemo(() => {
    const min = Number(form.budgetMin);
    const max = Number(form.budgetMax);
    if (!form.budgetMin && !form.budgetMax) return "Flexible budget";
    if (!Number.isNaN(min) && !Number.isNaN(max) && min && max) {
      return `${form.currency} ${min} - ${max}`;
    }
    if (!Number.isNaN(min) && min) return `${form.currency} ${min}+`;
    if (!Number.isNaN(max) && max) return `Up to ${form.currency} ${max}`;
    return "Flexible budget";
  }, [form.budgetMin, form.budgetMax, form.currency]);

  async function createJob() {
    if (!canCreate) return;
    setSubmitting(true);
    const payload = {
      title: form.title,
      description: form.description,
      budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
      budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
      currency: form.currency,
      skills: form.skills,
      location: form.location,
    };
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await safeJson<Job & { error?: string }>(res);
    if (res.ok) {
      if (data) {
        setJobs((prev) => [data, ...prev]);
        setMyJobs((prev) => [data, ...prev]);
      }
      setForm({
        title: "",
        description: "",
        budgetMin: "",
        budgetMax: "",
        currency: "USD",
        skills: "",
        location: "",
      });
    } else {
      alert(data?.error || "Failed to create job");
    }
    setSubmitting(false);
  }

  async function applyToJob(jobId: string) {
    if (!userId) return;
    const message = window.prompt("Add a short note for your application (optional):") || "";
    const res = await fetch(`/api/jobs/${jobId}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await safeJson<JobApplication & { error?: string }>(res);
    if (!res.ok) {
      alert(data?.error || "Failed to apply");
      return;
    }
    if (data) setMyApplications((prev) => [data, ...prev]);
  }

  return (
    <main className="max-w-5xl mx-auto px-4 pb-24 pt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Jobs</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-2">
          Find work or hire Roblox talent with fast, focused listings.
        </p>
      </div>

      {canCreate && (
        <div className="glass-soft border border-white/10 rounded-2xl p-5 mb-10">
          <h2 className="text-lg font-semibold text-white mb-4">Post a job</h2>
          <div className="grid gap-3">
            <input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Job title"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the work, goals, and expectations"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white min-h-[140px]"
            />
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={form.budgetMin}
                onChange={(e) => setForm((prev) => ({ ...prev, budgetMin: e.target.value }))}
                placeholder="Budget min"
                type="number"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
              />
              <input
                value={form.budgetMax}
                onChange={(e) => setForm((prev) => ({ ...prev, budgetMax: e.target.value }))}
                placeholder="Budget max"
                type="number"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={form.currency}
                onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))}
                placeholder="Currency (USD)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
              />
              <input
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Location (optional)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>
            <input
              value={form.skills}
              onChange={(e) => setForm((prev) => ({ ...prev, skills: e.target.value }))}
              placeholder="Skills (comma separated)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <span className="text-xs text-[var(--muted-foreground)]">{budgetSummary}</span>
            <button
              onClick={createJob}
              disabled={submitting}
              className={cn(
                "ml-auto px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                "bg-[var(--color-accent)] text-black hover:brightness-110",
                submitting && "opacity-60 cursor-not-allowed"
              )}
            >
              {submitting ? "Posting..." : "Post job"}
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Open roles</h2>
          {loading ? (
            <div className="text-sm text-[var(--muted-foreground)]">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="text-sm text-[var(--muted-foreground)]">No jobs available yet.</div>
          ) : (
            <div className="grid gap-3">
              {jobs.map((job) => (
                <div key={job.id} className="glass-soft border border-white/10 rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/jobs/${job.id}`} className="text-lg font-semibold text-white hover:text-[var(--color-accent)]">
                        {job.title}
                      </Link>
                      <div className="text-xs text-[var(--muted-foreground)] mt-1">
                        {job.user?.username} • {job.location || "Remote"}
                      </div>
                    </div>
                    <span className="text-xs text-white/70 px-2 py-1 rounded-full bg-white/5 border border-white/10">
                      {job.status}
                    </span>
                  </div>
                  <p className="text-sm text-white/80 mt-3 line-clamp-3">{job.description}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-[var(--muted-foreground)]">
                    <span>{job.skills || "Skills flexible"}</span>
                    <span>•</span>
                    <span>{job.currency} {job.budgetMin || "?"} - {job.budgetMax || "?"}</span>
                    <span>•</span>
                    <span>{job._count?.applications ?? 0} applicants</span>
                  </div>
                  {userId && job.userId !== userId && (
                    <button
                      onClick={() => applyToJob(job.id)}
                      className="mt-4 px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/15"
                    >
                      Apply
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {userId && (
          <section className="grid gap-4 md:grid-cols-2">
            <div className="glass-soft border border-white/10 rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3">My jobs</h3>
              {myJobs.length === 0 ? (
                <div className="text-xs text-[var(--muted-foreground)]">No jobs posted yet.</div>
              ) : (
                <div className="grid gap-2">
                  {myJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between text-sm text-white/80">
                      <Link href={`/jobs/${job.id}`} className="hover:text-[var(--color-accent)]">
                        {job.title}
                      </Link>
                      <span className="text-[10px] text-white/60">{job.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-soft border border-white/10 rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3">My applications</h3>
              {myApplications.length === 0 ? (
                <div className="text-xs text-[var(--muted-foreground)]">No applications yet.</div>
              ) : (
                <div className="grid gap-2">
                  {myApplications.map((application) => (
                    <div key={application.id} className="flex items-center justify-between text-sm text-white/80">
                      <span>{application.job?.title || "Job"}</span>
                      <span className="text-[10px] text-white/60">{application.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
