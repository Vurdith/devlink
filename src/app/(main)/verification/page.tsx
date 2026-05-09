"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/cn";
import { safeJson } from "@/lib/safe-json";
import { iconBox, surface, ui } from "@/components/ui/design-system";
import type { VerificationRequest } from "@/types/api";

const verificationTypes = [
  { value: "EMAIL", label: "Email" },
  { value: "ID", label: "ID Check" },
  { value: "PORTFOLIO", label: "Portfolio Proof" },
];

export default function VerificationPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    type: "EMAIL",
    documentUrl: "",
    notes: "",
  });

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let isMounted = true;
    async function load() {
      setLoading(true);
      const res = await fetch("/api/verification/requests");
      const data = await safeJson<VerificationRequest[]>(res);
      if (isMounted) {
        setRequests(data || []);
        setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  async function submitRequest() {
    setSubmitting(true);
    const res = await fetch("/api/verification/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: form.type,
        documentUrl: form.documentUrl || undefined,
        notes: form.notes || undefined,
      }),
    });
    const data = await safeJson<VerificationRequest & { error?: string }>(res);
    if (res.ok) {
      if (data) {
        setRequests((prev) => [data, ...prev]);
      }
      setForm({ type: "EMAIL", documentUrl: "", notes: "" });
    } else {
      alert(data?.error || "Failed to submit request");
    }
    setSubmitting(false);
  }

  async function removeRequest(requestId: string) {
    const res = await fetch(`/api/verification/requests/${requestId}`, { method: "DELETE" });
    const data = await safeJson<{ error?: string }>(res);
    if (res.ok) {
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } else {
      alert(data?.error || "Unable to remove request");
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 pb-24 pt-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Verification</h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Submit verification requests to build trust on DevLink.
          </p>
        </div>
        <div className={iconBox("cyan", "h-11 w-11")}>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5-2.5V12c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7.5L12 4l8 3.5z" />
          </svg>
        </div>
      </div>

      {!userId ? (
        <div className={surface("empty", "p-5 text-sm text-[var(--muted-foreground)]")}>Sign in to request verification.</div>
      ) : (
        <>
          <div className={surface("panel", "mb-6 p-4")}>
            <h2 className="mb-3 text-sm font-semibold text-white">New request</h2>
            <div className="grid gap-3">
              <select
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                className={ui.control.field}
              >
                {verificationTypes.map((type) => (
                  <option key={type.value} value={type.value} className="bg-[#0b0f14]">
                    {type.label}
                  </option>
                ))}
              </select>
              <input
                value={form.documentUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, documentUrl: e.target.value }))}
                placeholder="Document URL (optional)"
                className={ui.control.field}
              />
              <textarea
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Notes for the review team (optional)"
                className={cn(ui.control.field, "min-h-[100px] resize-y")}
              />
            </div>
            <button
              onClick={submitRequest}
              disabled={submitting}
              className={cn(
                "mt-4 rounded-lg px-4 py-2 text-sm font-semibold transition-all",
                ui.control.gradient,
                submitting && "opacity-60 cursor-not-allowed"
              )}
            >
              {submitting ? "Submitting..." : "Submit request"}
            </button>
          </div>

          <div className={surface("panel", "p-4")}>
            <h2 className="mb-3 text-sm font-semibold text-white">My requests</h2>
            {loading ? (
              <div className="text-sm text-[var(--muted-foreground)]">Loading requests...</div>
            ) : requests.length === 0 ? (
              <div className="text-sm text-[var(--muted-foreground)]">No verification requests yet.</div>
            ) : (
              <div className="grid gap-3">
                {requests.map((request) => (
                  <div key={request.id} className={surface("panelMuted", "p-3")}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">{request.type}</span>
                      <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-white/60">{request.status}</span>
                    </div>
                    {request.notes && (
                      <p className="text-xs text-white/70 mt-2">{request.notes}</p>
                    )}
                    {request.status === "PENDING" && (
                      <button
                        onClick={() => removeRequest(request.id)}
                        className="mt-3 text-xs text-red-300 hover:text-red-200"
                      >
                        Remove request
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
