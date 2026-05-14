"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { BriefcaseBusiness, CheckCircle2, DollarSign, FileText, MapPin, Send, Users } from "lucide-react";
import { ActionLink } from "@/components/ui/ActionLink";
import { Button } from "@/components/ui/Button";
import { InfoCell, ToneBadge, type DataTone } from "@/components/ui/DataDisplay";
import { iconBox, surface, ui } from "@/components/ui/design-system";
import { useToastContext } from "@/components/providers/ToastProvider";
import { cn } from "@/lib/cn";
import { safeJson } from "@/lib/safe-json";
import type { Job, JobApplication } from "@/types/api";

const fieldClass = ui.control.field;

function formatBudget(job: Pick<Job, "budgetMin" | "budgetMax" | "currency">) {
  if (job.budgetMin && job.budgetMax) return `${job.currency} ${job.budgetMin} - ${job.budgetMax}`;
  if (job.budgetMin) return `${job.currency} ${job.budgetMin}+`;
  if (job.budgetMax) return `Up to ${job.currency} ${job.budgetMax}`;
  return "Budget flexible";
}

function splitSkills(skills: string | null) {
  return (skills || "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean)
    .slice(0, 4);
}

function statusTone(tone: "open" | "applied" | "muted" = "muted"): DataTone {
  if (tone === "open") return "success";
  if (tone === "applied") return "accent";
  return "muted";
}

export default function JobsPage() {
  const { data: session } = useSession();
  const { toast } = useToastContext();
  const userId = session?.user?.id;
  const [jobs, setJobs] = useState<Job[]>([]);
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [myApplications, setMyApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [openApplicationJobId, setOpenApplicationJobId] = useState<string | null>(null);
  const [applicationNotes, setApplicationNotes] = useState<Record<string, string>>({});
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
  const appliedJobIds = useMemo(() => new Set(myApplications.map((application) => application.jobId)), [myApplications]);

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
    if (!form.title.trim() || !form.description.trim()) {
      toast({
        title: "Add the job basics",
        description: "A title and a clear brief help candidates decide whether to apply.",
        variant: "destructive",
      });
      return;
    }

    const budgetMin = form.budgetMin ? Number(form.budgetMin) : undefined;
    const budgetMax = form.budgetMax ? Number(form.budgetMax) : undefined;
    if (
      (budgetMin !== undefined && Number.isNaN(budgetMin)) ||
      (budgetMax !== undefined && Number.isNaN(budgetMax)) ||
      (budgetMin !== undefined && budgetMax !== undefined && budgetMin > budgetMax)
    ) {
      toast({
        title: "Check the budget range",
        description: "Use valid numbers, with the minimum budget lower than the maximum.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        budgetMin,
        budgetMax,
        currency: form.currency.trim() || "USD",
        skills: form.skills.trim(),
        location: form.location.trim(),
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
        toast({
          title: "Job posted",
          description: "Your listing is live for developers browsing open roles.",
          variant: "success",
        });
      } else {
        toast({
          title: "Job was not posted",
          description: data?.error || "Try again after checking the required fields.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Job was not posted",
        description: "Check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function applyToJob(jobId: string) {
    if (!userId) return;
    setApplyingJobId(jobId);
    try {
      const message = applicationNotes[jobId]?.trim() || "";
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
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
      if (data) setMyApplications((prev) => [data, ...prev]);
      setOpenApplicationJobId(null);
      setApplicationNotes((prev) => ({ ...prev, [jobId]: "" }));
      toast({
        title: "Application sent",
        description: "You can track the response in Applications sent.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Application was not sent",
        description: "Check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setApplyingJobId(null);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:pt-8">
      <div className={surface("panel", "noise-overlay relative mb-6 overflow-hidden p-5 sm:mb-8 sm:p-6")}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.42)] to-transparent" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white font-[var(--font-space-grotesk)]">Open Roblox work</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)]">
              Post a clear brief, review applicants, and keep each role moving.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-right sm:min-w-56">
            <div className="rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-2">
              <div className="text-lg font-bold leading-none text-white">{jobs.length}</div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">Open</div>
            </div>
            <div className="rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-2">
              <div className="text-lg font-bold leading-none text-white">{myApplications.length}</div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">Sent</div>
            </div>
          </div>
        </div>
      </div>

      {!canCreate && (
        <div className={surface("toolbar", "mb-8 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between")}>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white">Want to post a role?</div>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">Sign in to post a brief and track applications.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <ActionLink href="/login" variant="secondary" size="md" className="w-full sm:w-auto">
              Log in
            </ActionLink>
            <ActionLink href="/register" variant="glow" size="md" className="w-full sm:w-auto">
              Sign up
            </ActionLink>
          </div>
        </div>
      )}

      {canCreate && (
        <div className={surface("panel", "noise-overlay relative mb-10 overflow-hidden p-5 sm:p-6")}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white font-[var(--font-space-grotesk)]">Post a clear role</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Give candidates the role, budget, location, and skills before they apply.
              </p>
            </div>
            <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-emerald-300/24 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
              <DollarSign className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
              {budgetSummary}
            </span>
          </div>
          <div className="grid gap-3">
            <input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Role title"
              className={fieldClass}
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the work, goals, timeline, and review process"
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
          <div className="mt-4 flex flex-col gap-3 border-t border-white/[0.06] pt-4 sm:flex-row sm:items-center">
            <span className="text-xs text-[var(--muted-foreground)]">Visible to everyone browsing jobs.</span>
            <Button
              onClick={createJob}
              disabled={submitting}
              isLoading={submitting}
              size="sm"
              variant="glow"
              className="w-full sm:ml-auto sm:w-auto"
              leftIcon={<Send className="h-4 w-4" aria-hidden="true" />}
            >
              Post job
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        <section>
          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--color-accent-2)]">Available work</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/[0.10] to-transparent" />
          </div>
          {loading ? (
            <div className="grid gap-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className={surface("panelMuted", "noise-overlay relative overflow-hidden p-4 sm:p-5")}>
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="skeleton h-5 w-3/5 max-w-72 rounded-lg" />
                      <div className="skeleton h-3 w-4/5 rounded-lg" />
                    </div>
                    <div className="skeleton h-7 w-20 rounded-lg" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <div className="skeleton h-7 w-24 rounded-md" />
                    <div className="skeleton h-7 w-28 rounded-md" />
                    <div className="skeleton h-7 w-20 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className={surface("empty", "flex items-start gap-3 p-5")}>
              <div className={iconBox("muted", "h-10 w-10 flex-shrink-0")}>
                <FileText className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">No open roles yet</div>
                <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  Post the first brief with a clear goal, budget, and skill list.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  alreadyApplied={appliedJobIds.has(job.id)}
                  applicationOpen={openApplicationJobId === job.id}
                  canApply={Boolean(userId && job.userId !== userId && !appliedJobIds.has(job.id))}
                  applying={applyingJobId === job.id}
                  applicationNote={applicationNotes[job.id] || ""}
                  onApply={applyToJob}
                  onNoteChange={(note) => setApplicationNotes((prev) => ({ ...prev, [job.id]: note }))}
                  onOpenApplication={() => setOpenApplicationJobId(job.id)}
                  onCloseApplication={() => setOpenApplicationJobId(null)}
                />
              ))}
            </div>
          )}
        </section>

        {userId && (
          <section className="grid gap-4 md:grid-cols-2">
            <div className={surface("panelMuted", "noise-overlay p-4")}>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <BriefcaseBusiness className="h-4 w-4 text-[var(--color-accent-2)]" aria-hidden="true" />
                Posted by you
              </div>
              {myJobs.length === 0 ? (
                <div className="text-xs leading-relaxed text-[var(--muted-foreground)]">
                  No jobs posted yet. Use the form above when you are ready to hire.
                </div>
              ) : (
                <div className="grid gap-2">
                  {myJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between gap-3 rounded-lg border border-transparent px-2 py-1.5 text-sm text-white/80 transition-colors hover:border-white/[0.08] hover:bg-white/[0.035]">
                      <Link href={`/jobs/${job.id}`} className="truncate transition-colors hover:text-[var(--color-accent-2)] focus-visible:outline-none focus-visible:text-[var(--color-accent-2)]">
                        {job.title}
                      </Link>
                      <ToneBadge tone={statusTone(job.status === "OPEN" ? "open" : "muted")} className="text-[10px] uppercase tracking-[0.10em]">{job.status}</ToneBadge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={surface("panelMuted", "noise-overlay p-4")}>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <CheckCircle2 className="h-4 w-4 text-[var(--color-accent-2)]" aria-hidden="true" />
                Applications sent
              </div>
              {myApplications.length === 0 ? (
                <div className="text-xs leading-relaxed text-[var(--muted-foreground)]">
                  No applications yet. Apply to an open role to start tracking status here.
                </div>
              ) : (
                <div className="grid gap-2">
                  {myApplications.map((application) => (
                    <div key={application.id} className="flex items-center justify-between gap-3 rounded-lg border border-transparent px-2 py-1.5 text-sm text-white/80 transition-colors hover:border-white/[0.08] hover:bg-white/[0.035]">
                      <span className="truncate">{application.job?.title || "Job"}</span>
                      <ToneBadge tone={statusTone(application.status === "PENDING" ? "applied" : "muted")} className="text-[10px] uppercase tracking-[0.10em]">{application.status}</ToneBadge>
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

function JobCard({
  job,
  alreadyApplied,
  applicationOpen,
  canApply,
  applying,
  applicationNote,
  onApply,
  onNoteChange,
  onOpenApplication,
  onCloseApplication,
}: {
  job: Job;
  alreadyApplied: boolean;
  applicationOpen: boolean;
  canApply: boolean;
  applying: boolean;
  applicationNote: string;
  onApply: (jobId: string) => void;
  onNoteChange: (note: string) => void;
  onOpenApplication: () => void;
  onCloseApplication: () => void;
}) {
  const skills = splitSkills(job.skills);

  return (
    <article className={surface("panelMuted", "group relative overflow-hidden p-4 transition-colors duration-200 hover:border-[rgba(var(--color-accent-2-rgb),0.24)] hover:bg-white/[0.04] focus-within:border-[rgba(var(--color-accent-2-rgb),0.30)] sm:p-5")}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link href={`/jobs/${job.id}`} className="line-clamp-2 text-lg font-semibold text-white transition-colors hover:text-[var(--color-accent-2)] focus-visible:outline-none focus-visible:text-[var(--color-accent-2)]">
            {job.title}
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted-foreground)]">
            <span className="truncate text-white/70">@{job.user?.username || "unknown"}</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {job.location || "Remote"}
            </span>
          </div>
        </div>
        <ToneBadge tone={statusTone(alreadyApplied ? "applied" : "open")} className="text-[10px] uppercase tracking-[0.10em]">
          {alreadyApplied ? "Applied" : job.status}
        </ToneBadge>
      </div>

      <p className="mt-3 line-clamp-3 border-l border-[rgba(var(--color-accent-2-rgb),0.24)] pl-3 text-sm leading-relaxed text-white/75 sm:pr-4">
        {job.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {skills.length ? (
          skills.map((skill) => (
            <span key={skill} className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-white/70">
              {skill}
            </span>
          ))
        ) : (
          <ToneBadge tone="muted">Skill match flexible</ToneBadge>
        )}
      </div>

      <div className="mt-4 grid gap-2 rounded-lg border border-white/[0.07] bg-black/10 p-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_auto] sm:items-center">
        <InfoCell
          label="Budget"
          value={formatBudget(job)}
          icon={<DollarSign className="h-3.5 w-3.5" aria-hidden="true" />}
          tone="money"
          className="bg-black/15"
        />
        <InfoCell
          label="Applicants"
          value={job._count?.applications ?? 0}
          icon={<Users className="h-3.5 w-3.5" aria-hidden="true" />}
          tone="muted"
          className="bg-black/15"
        />
        {canApply && !applicationOpen ? (
          <Button size="sm" variant="secondary" onClick={onOpenApplication} className="w-full sm:w-auto" leftIcon={<Send className="h-4 w-4" aria-hidden="true" />}>
            Apply
          </Button>
        ) : null}
      </div>

      {alreadyApplied ? (
        <div className="mt-4 rounded-lg border border-[rgba(var(--color-accent-2-rgb),0.18)] bg-[rgba(var(--color-accent-2-rgb),0.06)] px-3 py-2 text-xs text-[var(--color-accent-2)]">
          Application sent. Watch Applications sent for status changes.
        </div>
      ) : null}

      {canApply && applicationOpen ? (
        <div className={surface("empty", "mt-4 p-3")}>
          <label className="text-xs font-semibold uppercase tracking-[0.10em] text-white/60" htmlFor={`application-note-${job.id}`}>
            Application note
          </label>
          <textarea
            id={`application-note-${job.id}`}
            value={applicationNote}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Share fit, availability, or one relevant Roblox project."
            className={cn(fieldClass, "mt-2 min-h-[96px] resize-y")}
          />
          <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button size="sm" variant="ghost" onClick={onCloseApplication} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              size="sm"
              variant="glow"
              onClick={() => onApply(job.id)}
              disabled={applying}
              isLoading={applying}
              className="w-full sm:w-auto"
              leftIcon={<Send className="h-4 w-4" aria-hidden="true" />}
            >
              Send application
            </Button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
