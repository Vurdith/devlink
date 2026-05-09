"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/cn";
import { safeJson } from "@/lib/safe-json";
import { iconBox, surface, ui } from "@/components/ui/design-system";
import { useToastContext } from "@/components/providers/ToastProvider";
import type { EscrowContract } from "@/types/api";

export default function EscrowPage() {
  const { data: session } = useSession();
  const { toast } = useToastContext();
  const userId = session?.user?.id;
  const [contracts, setContracts] = useState<EscrowContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busyContractId, setBusyContractId] = useState<string | null>(null);
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
    const amount = Number(form.amount);
    if (!form.developerId.trim() || !form.title.trim() || !amount || amount <= 0) {
      toast({
        title: "Check the escrow details",
        description: "Developer ID, milestone title, and a positive amount are required.",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/escrow/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          developerId: form.developerId.trim(),
          jobId: form.jobId.trim() || undefined,
          amount,
          currency: form.currency.trim() || "USD",
          title: form.title.trim(),
        }),
      });
      const data = await safeJson<EscrowContract & { error?: string }>(res);
      if (res.ok) {
        if (data) {
          setContracts((prev) => [data, ...prev]);
        }
        setForm({ developerId: "", jobId: "", amount: "", currency: "USD", title: "Milestone 1" });
        toast({
          title: "Escrow contract created",
          description: "The milestone is ready to track from the contracts list.",
          variant: "success",
        });
      } else {
        toast({
          title: "Contract was not created",
          description: data?.error || "Check the details and try again.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Contract was not created",
        description: "Check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  }

  async function submitMilestone(contractId: string) {
    setBusyContractId(contractId);
    try {
      const res = await fetch(`/api/escrow/contracts/${contractId}/milestone/submit`, { method: "POST" });
      const data = await safeJson<{ contract?: EscrowContract; error?: string }>(res);
      if (res.ok) {
        if (data?.contract) {
          setContracts((prev) => prev.map((c) => (c.id === contractId ? data.contract! : c)));
        }
        toast({
          title: "Milestone submitted",
          description: "The client can now review and release funds.",
          variant: "success",
        });
      } else {
        toast({
          title: "Milestone was not submitted",
          description: data?.error || "Try again in a moment.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Milestone was not submitted",
        description: "Check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setBusyContractId(null);
    }
  }

  async function releaseMilestone(contractId: string) {
    setBusyContractId(contractId);
    try {
      const res = await fetch(`/api/escrow/contracts/${contractId}/milestone/release`, { method: "POST" });
      const data = await safeJson<{ contract?: EscrowContract; error?: string }>(res);
      if (res.ok) {
        if (data?.contract) {
          setContracts((prev) => prev.map((c) => (c.id === contractId ? data.contract! : c)));
        }
        toast({
          title: "Funds released",
          description: "The milestone is marked as released.",
          variant: "success",
        });
      } else {
        toast({
          title: "Funds were not released",
          description: data?.error || "Try again in a moment.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Funds were not released",
        description: "Check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setBusyContractId(null);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-8">
      <div className={surface("panel", "noise-overlay relative mb-6 overflow-hidden p-5 sm:p-6")}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.42)] to-transparent" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-accent-2)]">Payments</div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Escrow</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted-foreground)]">
            Track simple milestone escrow for Roblox project work.
          </p>
        </div>
        <div className={iconBox("cyan", "h-11 w-11")}>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3l8 4v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7l8-4z" />
          </svg>
        </div>
        </div>
      </div>

      {!userId ? (
        <div className={surface("empty", "p-5 text-sm leading-relaxed text-[var(--muted-foreground)]")}>
          Sign in to create escrow contracts, submit milestones, and release funds from one place.
        </div>
      ) : (
        <>
          <div className={surface("panel", "noise-overlay relative mb-8 overflow-hidden p-4")}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
            <h2 className="mb-3 text-sm font-semibold text-white">Create escrow contract</h2>
            <p className="mb-4 text-sm leading-relaxed text-[var(--muted-foreground)]">
              Start with one milestone so both sides know who is responsible for the next action.
            </p>
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

          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--color-accent-2)]">Contracts</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-white/[0.10] to-transparent" />
            </div>
            <span className="flex-shrink-0 text-xs text-[var(--muted-foreground)]">
              Total value: {totalValue} {contracts[0]?.currency || "USD"}
            </span>
          </div>
          {loading ? (
            <div className={surface("empty", "p-5 text-sm text-[var(--muted-foreground)]")}>Loading contracts...</div>
          ) : contracts.length === 0 ? (
            <div className={surface("empty", "p-5 text-sm leading-relaxed text-[var(--muted-foreground)]")}>
              No escrow contracts yet. Create a milestone above when a client and developer are ready to work.
            </div>
          ) : (
            <div className="grid gap-3">
              {contracts.map((contract) => {
                const isClient = contract.clientId === userId;
                const isDeveloper = contract.developerId === userId;
                const milestoneStatus = contract.milestone?.status || "PENDING";
                const actionBusy = busyContractId === contract.id;
                const nextStep = isDeveloper && milestoneStatus === "PENDING"
                  ? "Next: submit the milestone when the work is ready."
                  : isClient && milestoneStatus === "SUBMITTED"
                    ? "Next: review the work, then release funds if it is complete."
                    : milestoneStatus === "RELEASED"
                      ? "Complete: funds have been released."
                      : "No action needed from you right now.";
                return (
                  <div key={contract.id} className={surface("panelMuted", "noise-overlay group relative overflow-hidden p-4 transition-colors hover:border-[rgba(var(--color-accent-2-rgb),0.20)] hover:bg-white/[0.04]")}>
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {contract.milestone?.title || "Milestone"}
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                          {isClient ? "Client" : "Developer"} | {contract.currency} {contract.amount}
                        </p>
                      </div>
                      <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.10em] text-white/60">{contract.status}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3 text-xs text-[var(--muted-foreground)]">
                      <span>Milestone: {milestoneStatus}</span>
                      <span className="text-white/20">/</span>
                      <span>{contract.jobId ? `Job ${contract.jobId}` : "No linked job"}</span>
                    </div>
                    <div className="mt-3 rounded-lg border border-white/[0.08] bg-black/15 px-3 py-2 text-xs leading-relaxed text-white/70">
                      {nextStep}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {isDeveloper && milestoneStatus === "PENDING" && (
                        <button
                          onClick={() => submitMilestone(contract.id)}
                          disabled={actionBusy}
                          className={cn("rounded-lg px-3 py-2 text-xs font-semibold text-white transition-colors", ui.control.ghost)}
                        >
                          {actionBusy ? "Submitting..." : "Submit milestone"}
                        </button>
                      )}
                      {isClient && milestoneStatus === "SUBMITTED" && (
                        <button
                          onClick={() => releaseMilestone(contract.id)}
                          disabled={actionBusy}
                          className={cn("rounded-lg px-3 py-2 text-xs font-semibold transition-all", ui.control.gradient)}
                        >
                          {actionBusy ? "Releasing..." : "Release funds"}
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
