"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/cn";
import { safeJson } from "@/lib/safe-json";
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">Escrow</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-2">
          Track simple milestone escrow for Roblox project work.
        </p>
      </div>

      {!userId ? (
        <div className="text-sm text-[var(--muted-foreground)]">Sign in to manage escrow.</div>
      ) : (
        <>
          <div className="glass-soft border border-white/10 rounded-2xl p-4 mb-8">
            <h2 className="text-sm font-semibold text-white mb-3">Create escrow contract</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={form.developerId}
                onChange={(e) => setForm((prev) => ({ ...prev, developerId: e.target.value }))}
                placeholder="Developer user ID"
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
              />
              <input
                value={form.jobId}
                onChange={(e) => setForm((prev) => ({ ...prev, jobId: e.target.value }))}
                placeholder="Job ID (optional)"
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
              />
              <input
                value={form.amount}
                onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                placeholder="Amount"
                type="number"
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
              />
              <input
                value={form.currency}
                onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))}
                placeholder="Currency (USD)"
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
              />
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Milestone title"
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white md:col-span-2"
              />
            </div>
            <button
              onClick={createContract}
              disabled={creating}
              className={cn(
                "mt-4 px-4 py-2 rounded-xl text-sm font-semibold bg-[var(--color-accent)] text-white",
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
            <div className="text-sm text-[var(--muted-foreground)]">Loading contracts...</div>
          ) : contracts.length === 0 ? (
            <div className="text-sm text-[var(--muted-foreground)]">No escrow contracts yet.</div>
          ) : (
            <div className="grid gap-3">
              {contracts.map((contract) => {
                const isClient = contract.clientId === userId;
                const isDeveloper = contract.developerId === userId;
                const milestoneStatus = contract.milestone?.status || "PENDING";
                return (
                  <div key={contract.id} className="glass-soft border border-white/10 rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {contract.milestone?.title || "Milestone"}
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                          {isClient ? "Client" : "Developer"} • {contract.currency} {contract.amount}
                        </p>
                      </div>
                      <span className="text-[10px] text-white/60">{contract.status}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3 text-xs text-[var(--muted-foreground)]">
                      <span>Milestone: {milestoneStatus}</span>
                      <span>•</span>
                      <span>{contract.jobId ? `Job ${contract.jobId}` : "No linked job"}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {isDeveloper && milestoneStatus === "PENDING" && (
                        <button
                          onClick={() => submitMilestone(contract.id)}
                          className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white"
                        >
                          Submit milestone
                        </button>
                      )}
                      {isClient && milestoneStatus === "SUBMITTED" && (
                        <button
                          onClick={() => releaseMilestone(contract.id)}
                          className="px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--color-accent)] text-white"
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
