"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ExternalLink, FileCheck2, IdCard, Link2, MailCheck, ShieldCheck, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/cn";
import { safeJson } from "@/lib/safe-json";
import { ActionLink } from "@/components/ui/ActionLink";
import { Button } from "@/components/ui/Button";
import { FeedbackState } from "@/components/ui/FeedbackState";
import { iconBox, surface, ui } from "@/components/ui/design-system";
import type { VerificationRequest } from "@/types/api";

const verificationTypes = [
  {
    value: "EMAIL",
    label: "Email",
    description: "Confirm the email tied to your account.",
    prompt: "Add notes only if the review team needs context about your account email.",
    icon: MailCheck,
  },
  {
    value: "ID",
    label: "ID check",
    description: "Request a manual identity review for higher-trust work.",
    prompt: "Add a secure evidence link only if support asked for it. Do not paste sensitive ID numbers into notes.",
    icon: IdCard,
  },
  {
    value: "PORTFOLIO",
    label: "Portfolio proof",
    description: "Show proof that key portfolio links belong to you.",
    prompt: "Use a portfolio, Roblox asset, or creator page that proves the work belongs to you.",
    icon: FileCheck2,
  },
] as const;

type VerificationType = (typeof verificationTypes)[number]["value"];

const statusTone: Record<VerificationRequest["status"], string> = {
  PENDING: "border-amber-300/20 bg-amber-400/10 text-amber-100",
  APPROVED: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
  REJECTED: "border-rose-300/20 bg-rose-500/10 text-rose-100",
};

function getTypeCopy(type: string) {
  return verificationTypes.find((item) => item.value === type) || verificationTypes[0];
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function isValidEvidenceUrl(value: string) {
  if (!value.trim()) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export default function VerificationPage() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState<{ type: VerificationType; documentUrl: string; notes: string }>({
    type: "EMAIL",
    documentUrl: "",
    notes: "",
  });

  const loadRequests = useCallback(async (isActive: () => boolean = () => true) => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch("/api/verification/requests");
      const data = await safeJson<VerificationRequest[] & { error?: string }>(res);
      if (!res.ok || !Array.isArray(data)) {
        throw new Error(data?.error || "Could not load your verification requests.");
      }
      if (isActive()) {
        setRequests(data);
      }
    } catch (error) {
      if (isActive()) {
        setRequests([]);
        setLoadError(error instanceof Error ? error.message : "Could not load your verification requests.");
      }
    } finally {
      if (isActive()) setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (status === "loading") return;
    if (!userId) {
      setLoading(false);
      return;
    }
    let isMounted = true;
    loadRequests(() => isMounted);
    return () => {
      isMounted = false;
    };
  }, [loadRequests, status, userId]);

  const pendingTypes = useMemo(
    () => new Set(requests.filter((request) => request.status === "PENDING").map((request) => request.type)),
    [requests]
  );

  const summary = useMemo(() => ({
    pending: requests.filter((request) => request.status === "PENDING").length,
    approved: requests.filter((request) => request.status === "APPROVED").length,
  }), [requests]);

  async function submitRequest() {
    const trimmedUrl = form.documentUrl.trim();
    const trimmedNotes = form.notes.trim();

    setError("");
    setSuccess("");

    if (!isValidEvidenceUrl(trimmedUrl)) {
      setError("Evidence links must start with http:// or https://.");
      return;
    }

    if (trimmedNotes.length > 1000) {
      setError("Notes must be 1000 characters or fewer.");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/verification/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: form.type,
        documentUrl: trimmedUrl || undefined,
        notes: trimmedNotes || undefined,
      }),
    });
    const data = await safeJson<VerificationRequest & { error?: string }>(res);
    if (res.ok) {
      if (data) {
        setRequests((prev) => [data, ...prev]);
      }
      setForm({ type: "EMAIL", documentUrl: "", notes: "" });
      setSuccess("Verification request submitted. You can remove it while it is still pending.");
    } else {
      setError(data?.error || "Could not submit this verification request.");
    }
    setSubmitting(false);
  }

  async function removeRequest(requestId: string) {
    setDeletingId(requestId);
    setError("");
    setSuccess("");
    const res = await fetch(`/api/verification/requests/${requestId}`, { method: "DELETE" });
    const data = await safeJson<{ error?: string }>(res);
    if (res.ok) {
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      setSuccess("Pending verification request removed.");
    } else {
      setError(data?.error || "Unable to remove this request.");
    }
    setDeletingId(null);
  }

  const selectedType = getTypeCopy(form.type);
  const SelectedIcon = selectedType.icon;

  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-8 sm:px-6">
      <div className={surface("panel", "noise-overlay relative mb-6 overflow-hidden p-5 sm:p-6")}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.42)] to-transparent" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-accent-2)]">Trust review</div>
            <h1 className="font-[var(--font-space-grotesk)] text-3xl font-bold tracking-tight text-white">Verification</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)]">
              Request account trust checks and track what is still waiting for review.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:min-w-52">
            <div className="rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-right">
              <div className="text-lg font-bold leading-none text-white">{summary.pending}</div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">Pending</div>
            </div>
            <div className="rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-right">
              <div className="text-lg font-bold leading-none text-white">{summary.approved}</div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">Approved</div>
            </div>
          </div>
        </div>
      </div>

      {status === "loading" ? (
        <FeedbackState
          title="Checking your session"
          description="Verification requests are attached to your account."
          icon={<ShieldCheck className="h-6 w-6" aria-hidden="true" />}
          className="py-10"
        />
      ) : !userId ? (
        <div className={surface("panel", "noise-overlay relative overflow-hidden p-5")}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.42)] to-transparent" />
          <div className="text-sm font-semibold text-white">Sign in to request verification</div>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Verification requests are private to your account. Sign in first so the review team can attach the request to you.
          </p>
          <ActionLink
            href="/login?callbackUrl=/verification"
            variant="glow"
            size="md"
            className="mt-4"
          >
            Sign in
          </ActionLink>
        </div>
      ) : (
        <>
          {error && (
            <div className={cn(surface("empty"), "mb-4 border-rose-300/20 bg-rose-500/10 p-3 text-sm text-rose-100")} role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className={cn(surface("empty"), "mb-4 border-emerald-300/20 bg-emerald-400/10 p-3 text-sm text-emerald-100")} role="status">
              {success}
            </div>
          )}

          <div className={surface("panel", "noise-overlay relative mb-6 overflow-hidden p-4 sm:p-5")}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.34)] to-transparent" />
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-white">New request</h2>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Choose the review type and add proof when it helps the reviewer confirm your account.
              </p>
            </div>
            <div className="grid gap-3">
              <div className="grid gap-2 sm:grid-cols-3">
                {verificationTypes.map((type) => {
                  const TypeIcon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, type: type.value }))}
                      disabled={pendingTypes.has(type.value)}
                      className={cn(
                        "rounded-lg border p-3 text-left transition-all active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-55",
                        form.type === type.value
                          ? ui.active.cyan
                          : cn(ui.surface.empty, "hover:border-white/[0.14] hover:bg-white/[0.045]")
                      )}
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold text-white">
                        <TypeIcon className="h-4 w-4 text-[var(--color-accent-2)]" aria-hidden="true" />
                        {type.label}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">{type.description}</span>
                      {pendingTypes.has(type.value) ? (
                        <span className="mt-2 inline-flex rounded-md border border-amber-300/20 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.10em] text-amber-100">
                          Pending
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
              <div className={surface("empty", "flex items-start gap-3 p-3 text-sm text-white/70")}>
                <div className={iconBox("cyan", "mt-0.5 h-8 w-8 flex-shrink-0")}>
                  <SelectedIcon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <div className="font-semibold text-white">{selectedType.label} review</div>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--muted-foreground)]">{selectedType.prompt}</p>
                </div>
              </div>
              <input
                value={form.documentUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, documentUrl: e.target.value }))}
                placeholder={form.type === "PORTFOLIO" ? "Portfolio proof URL (optional)" : "Evidence URL (optional)"}
                className={ui.control.field}
                aria-label="Evidence URL"
              />
              <p className="text-xs text-[var(--muted-foreground)]">
                {selectedType.label}: {selectedType.description} Use a link only when it directly supports this request.
              </p>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Notes for the review team (optional)"
                className={cn(ui.control.field, "min-h-[100px] resize-y")}
                maxLength={1000}
                aria-label="Notes for the review team"
              />
              <div className="text-right text-xs text-[var(--muted-foreground)]">{form.notes.length}/1000</div>
            </div>
            <Button
              onClick={submitRequest}
              disabled={submitting || loading || pendingTypes.has(form.type)}
              isLoading={submitting}
              className="mt-4 w-full sm:w-auto"
              variant="glow"
              size="md"
              leftIcon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />}
            >
              Submit request
            </Button>
          </div>

          <div className={surface("panel", "noise-overlay relative overflow-hidden p-4 sm:p-5")}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.28)] to-transparent" />
            <h2 className="mb-3 text-sm font-semibold text-white">My requests</h2>
            {loading ? (
              <div className="grid gap-3" role="status" aria-label="Loading verification requests">
                {[0, 1, 2].map((item) => (
                  <div key={item} className={surface("panelMuted", "p-3")}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="skeleton h-4 w-28 rounded-lg" />
                        <div className="skeleton mt-2 h-3 w-44 rounded-lg" />
                      </div>
                      <div className="skeleton h-6 w-20 rounded-md" />
                    </div>
                    <div className="skeleton mt-3 h-3 w-4/5 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : loadError ? (
              <FeedbackState
                title="Verification requests did not load"
                description={loadError}
                icon={<AlertTriangle className="h-6 w-6" aria-hidden="true" />}
                tone="danger"
                className="py-10"
                action={{ label: "Try again", onClick: () => loadRequests() }}
              />
            ) : requests.length === 0 ? (
              <FeedbackState
                title="No verification requests yet"
                description="Submit a request above when you are ready for a trust review."
                icon={<ShieldCheck className="h-6 w-6" aria-hidden="true" />}
                className="py-10"
              />
            ) : (
              <div className="grid gap-3">
                {requests.map((request) => (
                  <div key={request.id} className={surface("panelMuted", "group relative overflow-hidden p-3 transition-colors hover:border-[rgba(var(--color-accent-2-rgb),0.18)] hover:bg-white/[0.035]")}>
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                          {(() => {
                            const TypeIcon = getTypeCopy(request.type).icon;
                            return <TypeIcon className="h-4 w-4 text-[var(--color-accent-2)]" aria-hidden="true" />;
                          })()}
                          {getTypeCopy(request.type).label}
                        </span>
                        <p className="mt-1 text-xs text-[var(--muted-foreground)]">Submitted {formatDate(request.createdAt)}</p>
                      </div>
                      <span className={cn("w-fit rounded-md border px-2 py-0.5 text-[10px] font-semibold", statusTone[request.status])}>{request.status}</span>
                    </div>
                    {request.documentUrl && (
                      <a href={request.documentUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex max-w-full items-center gap-1.5 break-all rounded-lg border border-white/[0.08] bg-white/[0.035] px-2.5 py-1.5 text-xs text-[var(--color-accent-2)] transition-colors hover:bg-white/[0.055]">
                        <Link2 className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                        Evidence link
                        <ExternalLink className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                      </a>
                    )}
                    {request.notes && (
                      <p className="text-xs text-white/70 mt-2">{request.notes}</p>
                    )}
                    {request.status === "PENDING" && (
                      <button
                        onClick={() => removeRequest(request.id)}
                        disabled={deletingId === request.id}
                        className="mt-3 inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-rose-300/20 px-3 text-xs font-semibold text-red-300 transition-colors hover:bg-rose-500/10 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        {deletingId === request.id ? "Removing..." : "Remove pending request"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
