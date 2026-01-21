"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/cn";
import { safeJson } from "@/lib/safe-json";
import type { VerificationRequest } from "@/types/api";

const verificationTypes = [
  { value: "EMAIL", label: "Email" },
  { value: "ID", label: "ID Check" },
  { value: "PORTFOLIO", label: "Portfolio Proof" },
];

export default function VerificationPage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id as string | undefined;
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">Verification</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-2">
          Submit verification requests to build trust on DevLink.
        </p>
      </div>

      {!userId ? (
        <div className="text-sm text-[var(--muted-foreground)]">Sign in to request verification.</div>
      ) : (
        <>
          <div className="glass-soft border border-white/10 rounded-2xl p-4 mb-6">
            <h2 className="text-sm font-semibold text-white mb-3">New request</h2>
            <div className="grid gap-3">
              <select
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
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
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
              />
              <textarea
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Notes for the review team (optional)"
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white min-h-[100px]"
              />
            </div>
            <button
              onClick={submitRequest}
              disabled={submitting}
              className={cn(
                "mt-4 px-4 py-2 rounded-xl text-sm font-semibold bg-[var(--color-accent)] text-black",
                submitting && "opacity-60 cursor-not-allowed"
              )}
            >
              {submitting ? "Submitting..." : "Submit request"}
            </button>
          </div>

          <div className="glass-soft border border-white/10 rounded-2xl p-4">
            <h2 className="text-sm font-semibold text-white mb-3">My requests</h2>
            {loading ? (
              <div className="text-sm text-[var(--muted-foreground)]">Loading requests...</div>
            ) : requests.length === 0 ? (
              <div className="text-sm text-[var(--muted-foreground)]">No verification requests yet.</div>
            ) : (
              <div className="grid gap-3">
                {requests.map((request) => (
                  <div key={request.id} className="rounded-xl border border-white/10 p-3 bg-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">{request.type}</span>
                      <span className="text-[10px] text-white/60">{request.status}</span>
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
