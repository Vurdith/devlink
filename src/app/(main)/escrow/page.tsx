"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/cn";
import { safeJson } from "@/lib/safe-json";
import { iconBox, surface, ui } from "@/components/ui/design-system";
import type { EscrowContract } from "@/types/api";

export default function EscrowPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [contracts, setContracts] = useState<EscrowContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    developerId: "",
    jobId: "",
    amount: "",
    currency: "USD",
    title: "Milestone 1",
  });

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let isMounted = true;
    async function load() {
      setLoading(true);
      const res = await fetch("/api/escrow/contracts");
      const data = await safeJson<EscrowContract[]>(res);
      if (isMounted) {
        setContracts(data || []);
        setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const totalValue = useMemo(() => {
    return contracts.reduce((sum, c) => sum + (c.amount || 0), 0);
  }, [contracts]);

  async function createContract() {
    setCreating(true);
    const res = await fetch("/api/escrow/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        developerId: form.developerId,
        jobId: form.jobId || undefined,
        amount: Number(form.amount),
        currency: form.currency,
        title: form.title,
      }),
    });
    const data = await safeJson<EscrowContract & { error?: string }>(res);
    if (res.ok) {
      if (data) {
        setContracts((prev) => [data, ...prev]);
      }
      setForm({ developerId: "", jobId: "", amount: "", currency: "USD", title: "Milestone 1" });
    } else {
      alert(data?.error || "Failed to create contract");
    }
    setCreating(false);
  }

  async function submitMilestone(contractId: string) {
    const res = await fetch(`/api/escrow/contracts/${contractId}/milestone/submit`, { method: "POST" });
    const data = await safeJson<{ contract?: EscrowContract; error?: string }>(res);
    if (res.ok) {
      if (data?.contract) {
        setContracts((prev) => prev.map((c) => (c.id === contractId ? data.contract! : c)));
      }
    } else {
      alert(data?.error || "Failed to submit milestone");
    }
  }

  async function releaseMilestone(contractId: string) {
    const res = await fetch(`/api/escrow/contracts/${contractId}/milestone/release`, { method: "POST" });
    const data = await safeJson<{ contract?: EscrowContract; error?: string }>(res);
    if (res.ok) {
      if (data?.contract) {
        setContracts((prev) => prev.map((c) => (c.id === contractId ? data.contract! : c)));
      }
    } else {
      alert(data?.error || "Failed to release milestone");
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 pb-24 pt-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Escrow</h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Track simple milestone escrow for Roblox project work.
          </p>
        </div>
        <div className={iconBox("cyan", "h-11 w-11")}>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3l8 4v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7l8-4z" />
          </svg>
        </div>
      </div>

      {!userId ? (
        <div className={surface("empty", "p-5 text-sm text-[var(--muted-foreground)]")}>Sign in to manage escrow.</div>
      ) : (
        <>
          <div className={surface("panel", "mb-8 p-4")}>
            <h2 className="mb-3 text-sm font-semibold text-white">Create escrow contract</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={form.developerId}
                onChange={(e) => setForm((prev) => ({ ...prev, developerId: e.target.value }))}
                placeholder="Developer user ID"
                className={ui.control.field}
              />
              <input
                value={form.jobId}
                onChange={(e) => setForm((prev) => ({ ...prev, jobId: e.target.value }))}
                placeholder="Job ID (optional)"
                className={ui.control.field}
              />
              <input
                value={form.amount}
                onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                placeholder="Amount"
                type="number"
                className={ui.control.field}
              />
              <input
                value={form.currency}
                onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))}
                placeholder="Currency (USD)"
                className={ui.control.field}
              />
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Milestone title"
                className={cn(ui.control.field, "md:col-span-2")}
              />
            </div>
            <button
              onClick={createContract}
              disabled={creating}
              className={cn(
                "mt-4 rounded-lg px-4 py-2 text-sm font-semibold transition-all",
                ui.control.gradient,
                creating && "opacity-60 cursor-not-allowed"
              )}
            >
              {creating ? "Creating..." : "Create contract"}
            </button>
          </div>

          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Contracts</h2>
            <span className="text-xs text-[var(--muted-foreground)]">
              Total value: {totalValue} {contracts[0]?.currency || "USD"}
            </span>
          </div>
          {loading ? (
            <div className={surface("empty", "p-5 text-sm text-[var(--muted-foreground)]")}>Loading contracts...</div>
          ) : contracts.length === 0 ? (
            <div className={surface("empty", "p-5 text-sm text-[var(--muted-foreground)]")}>No escrow contracts yet.</div>
          ) : (
            <div className="grid gap-3">
              {contracts.map((contract) => {
                const isClient = contract.clientId === userId;
                const isDeveloper = contract.developerId === userId;
                const milestoneStatus = contract.milestone?.status || "PENDING";
                return (
                  <div key={contract.id} className={surface("panelMuted", "p-4 transition-colors hover:border-white/[0.16] hover:bg-white/[0.04]")}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {contract.milestone?.title || "Milestone"}
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                          {isClient ? "Client" : "Developer"} | {contract.currency} {contract.amount}
                        </p>
                      </div>
                      <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-white/60">{contract.status}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3 text-xs text-[var(--muted-foreground)]">
                      <span>Milestone: {milestoneStatus}</span>
                      <span className="text-white/20">/</span>
                      <span>{contract.jobId ? `Job ${contract.jobId}` : "No linked job"}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {isDeveloper && milestoneStatus === "PENDING" && (
                        <button
                          onClick={() => submitMilestone(contract.id)}
                          className={cn("rounded-lg px-3 py-2 text-xs font-semibold text-white transition-colors", ui.control.ghost)}
                        >
                          Submit milestone
                        </button>
                      )}
                      {isClient && milestoneStatus === "SUBMITTED" && (
                        <button
                          onClick={() => releaseMilestone(contract.id)}
                          className={cn("rounded-lg px-3 py-2 text-xs font-semibold transition-all", ui.control.gradient)}
                        >
                          Release funds
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </main>
  );
}
