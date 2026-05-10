"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/cn";
import { safeJson } from "@/lib/safe-json";
import { iconBox, surface, ui } from "@/components/ui/design-system";
import type { VerificationRequest } from "@/types/api";

const verificationTypes = [
  { value: "EMAIL", label: "Email", description: "Confirm the email tied to your account." },
  { value: "ID", label: "ID check", description: "Request a manual identity review for higher-trust work." },
  { value: "PORTFOLIO", label: "Portfolio proof", description: "Show proof that key portfolio links belong to you." },
];

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
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    type: "EMAIL",
    documentUrl: "",
    notes: "",
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!userId) {
      setLoading(false);
      return;
    }
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError("");
      const res = await fetch("/api/verification/requests");
      const data = await safeJson<VerificationRequest[] & { error?: string }>(res);
      if (isMounted) {
        if (res.ok && Array.isArray(data)) {
          setRequests(data);
        } else {
          setError(data?.error || "Could not load your verification requests.");
        }
        setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [status, userId]);

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

  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Verification</h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Request account trust checks and track what is still waiting for review.
          </p>
        </div>
        <div className={iconBox("cyan", "h-11 w-11")}>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5-2.5V12c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7.5L12 4l8 3.5z" />
          </svg>
        </div>
      </div>

      {status === "loading" ? (
        <div className={surface("empty", "p-5 text-sm text-[var(--muted-foreground)]")} role="status">
          Checking your session...
        </div>
      ) : !userId ? (
        <div className={surface("panel", "noise-overlay relative overflow-hidden p-5")}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.42)] to-transparent" />
          <div className="text-sm font-semibold text-white">Sign in to request verification</div>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Verification requests are private to your account. Sign in first so the review team can attach the request to you.
          </p>
          <Link
            href="/login?callbackUrl=/verification"
            className={cn("mt-4 inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold", ui.control.gradient)}
          >
            Sign in
          </Link>
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
                {verificationTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, type: type.value }))}
                    className={cn(
                      "rounded-lg border p-3 text-left transition-all active:scale-[0.985]",
                      form.type === type.value
                        ? ui.active.cyan
                        : cn(ui.surface.empty, "hover:border-white/[0.14] hover:bg-white/[0.045]")
                    )}
                  >
                    <span className="block text-sm font-semibold text-white">{type.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">{type.description}</span>
                  </button>
                ))}
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
            <button
              onClick={submitRequest}
              disabled={submitting || loading}
              className={cn(
                "mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-all sm:w-auto",
                ui.control.gradient,
                submitting && "opacity-60 cursor-not-allowed"
              )}
            >
              {submitting ? "Submitting..." : "Submit request"}
            </button>
          </div>

          <div className={surface("panel", "noise-overlay relative overflow-hidden p-4 sm:p-5")}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.28)] to-transparent" />
            <h2 className="mb-3 text-sm font-semibold text-white">My requests</h2>
            {loading ? (
              <div className="text-sm text-[var(--muted-foreground)]" role="status">Loading requests...</div>
            ) : requests.length === 0 ? (
              <div className={surface("empty", "p-4 text-sm text-[var(--muted-foreground)]")}>
                No verification requests yet. Submit one above when you are ready for a trust review.
              </div>
            ) : (
              <div className="grid gap-3">
                {requests.map((request) => (
                  <div key={request.id} className={surface("panelMuted", "p-3")}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <span className="text-sm font-semibold text-white">{getTypeCopy(request.type).label}</span>
                        <p className="mt-1 text-xs text-[var(--muted-foreground)]">Submitted {formatDate(request.createdAt)}</p>
                      </div>
                      <span className={cn("w-fit rounded-md border px-2 py-0.5 text-[10px] font-semibold", statusTone[request.status])}>{request.status}</span>
                    </div>
                    {request.documentUrl && (
                      <a href={request.documentUrl} target="_blank" rel="noreferrer" className="mt-2 block break-all text-xs text-[var(--color-accent-2)] hover:underline">
                        Evidence link
                      </a>
                    )}
                    {request.notes && (
                      <p className="text-xs text-white/70 mt-2">{request.notes}</p>
                    )}
                    {request.status === "PENDING" && (
                      <button
                        onClick={() => removeRequest(request.id)}
                        disabled={deletingId === request.id}
                        className="mt-3 min-h-9 rounded-lg border border-rose-300/20 px-3 text-xs font-semibold text-red-300 transition-colors hover:bg-rose-500/10 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                      >
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
