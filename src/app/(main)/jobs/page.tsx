"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/cn";
import { safeJson } from "@/lib/safe-json";
import { iconBox, surface, ui } from "@/components/ui/design-system";
import type { Job, JobApplication } from "@/types/api";

const fieldClass =
  "w-full rounded-lg border border-white/[0.10] bg-white/[0.035] px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-[rgba(var(--color-accent-2-rgb),0.42)] focus:bg-white/[0.05]";

export default function JobsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
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
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-8">
      <div className={surface("panel", "noise-overlay relative mb-8 overflow-hidden p-5 sm:p-6")}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.42)] to-transparent" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-accent-2)]">Marketplace</div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Jobs</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted-foreground)]">
            Find work or hire Roblox talent with fast, focused listings.
          </p>
        </div>
        <div className={iconBox("cyan", "h-11 w-11")}>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v1m12 0H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2z" />
          </svg>
        </div>
        </div>
      </div>

      {canCreate && (
        <div className={surface("panel", "noise-overlay relative mb-10 overflow-hidden p-5")}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Post a job</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Keep the brief tight so candidates can judge fit quickly.
              </p>
            </div>
            <span className="rounded-md border border-[rgba(var(--color-accent-2-rgb),0.22)] bg-[rgba(var(--color-accent-2-rgb),0.08)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.10em] text-[var(--color-accent-2)]">
              {budgetSummary}
            </span>
          </div>
          <div className="grid gap-3">
            <input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Job title"
              className={fieldClass}
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the work, goals, and expectations"
              className={cn(fieldClass, "min-h-[140px] resize-y")}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={form.budgetMin}
                onChange={(e) => setForm((prev) => ({ ...prev, budgetMin: e.target.value }))}
                placeholder="Budget min"
                type="number"
                className={fieldClass}
              />
              <input
                value={form.budgetMax}
                onChange={(e) => setForm((prev) => ({ ...prev, budgetMax: e.target.value }))}
                placeholder="Budget max"
                type="number"
                className={fieldClass}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={form.currency}
                onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))}
                placeholder="Currency (USD)"
                className={fieldClass}
              />
              <input
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Location (optional)"
                className={fieldClass}
              />
            </div>
            <input
              value={form.skills}
              onChange={(e) => setForm((prev) => ({ ...prev, skills: e.target.value }))}
              placeholder="Skills (comma separated)"
              className={fieldClass}
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/[0.06] pt-4">
            <span className="text-xs text-[var(--muted-foreground)]">Visible to everyone browsing open roles.</span>
            <button
              onClick={createJob}
              disabled={submitting}
              className={cn(
                "ml-auto rounded-lg px-4 py-2 text-sm font-semibold transition-all",
                ui.control.gradient,
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
          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--color-accent-2)]">Open roles</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/[0.10] to-transparent" />
          </div>
          {loading ? (
            <div className={surface("empty", "p-5 text-sm text-[var(--muted-foreground)]")}>Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className={surface("empty", "p-5 text-sm text-[var(--muted-foreground)]")}>No jobs available yet.</div>
          ) : (
            <div className="grid gap-3">
              {jobs.map((job) => (
                <div key={job.id} className={surface("panelMuted", "noise-overlay group relative overflow-hidden p-4 transition-colors hover:border-[rgba(var(--color-accent-2-rgb),0.20)] hover:bg-white/[0.04]")}>
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/jobs/${job.id}`} className="text-lg font-semibold text-white transition-colors hover:text-[var(--color-accent-2)]">
                        {job.title}
                      </Link>
                      <div className="text-xs text-[var(--muted-foreground)] mt-1">
                        {job.user?.username} | {job.location || "Remote"}
                      </div>
                    </div>
                    <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.10em] text-white/70">
                      {job.status}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-3 border-l border-[rgba(var(--color-accent-2-rgb),0.24)] pl-3 text-sm leading-relaxed text-white/75">{job.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--muted-foreground)]">
                    <span className="text-white/70">{job.skills || "Skills flexible"}</span>
                    <span className="text-white/20">/</span>
                    <span>{job.currency} {job.budgetMin || "?"} - {job.budgetMax || "?"}</span>
                    <span className="text-white/20">/</span>
                    <span>{job._count?.applications ?? 0} applicants</span>
                  </div>
                  {userId && job.userId !== userId && (
                    <button
                      onClick={() => applyToJob(job.id)}
                      className={cn("mt-4 rounded-lg px-3 py-2 text-xs font-semibold text-white transition-colors", ui.control.ghost)}
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
            <div className={surface("panelMuted", "noise-overlay p-4")}>
              <h3 className="mb-3 text-sm font-semibold text-white">My jobs</h3>
              {myJobs.length === 0 ? (
                <div className="text-xs text-[var(--muted-foreground)]">No jobs posted yet.</div>
              ) : (
                <div className="grid gap-2">
                  {myJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between text-sm text-white/80">
                      <Link href={`/jobs/${job.id}`} className="transition-colors hover:text-[var(--color-accent-2)]">
                        {job.title}
                      </Link>
                      <span className="text-[10px] text-white/60">{job.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={surface("panelMuted", "noise-overlay p-4")}>
              <h3 className="mb-3 text-sm font-semibold text-white">My applications</h3>
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
