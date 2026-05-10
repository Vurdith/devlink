"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { CheckCircle2, Clock3, DollarSign, FileText, Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
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

  const totalCurrency = contracts[0]?.currency || form.currency || "USD";

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
            <h1 className="text-3xl font-bold tracking-tight text-white font-[var(--font-space-grotesk)]">Escrow</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)]">
              Track simple milestone escrow for Roblox project work.
            </p>
          </div>
          <div className={iconBox("cyan", "h-11 w-11")}>
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
      </div>

      {!userId ? (
        <div className={surface("empty", "flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between")}>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white">Sign in to manage escrow</div>
            <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
              Create contracts, submit milestones, and release funds from one place.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/login" className={cn("inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-xs font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.65)] sm:min-h-10", ui.control.ghost)}>
              Log in
            </Link>
            <Link href="/register" className={cn("inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.65)] sm:min-h-10", ui.control.gradient)}>
              Sign up
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className={surface("panel", "noise-overlay relative mb-8 overflow-hidden p-5 sm:p-6")}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white font-[var(--font-space-grotesk)]">Create escrow contract</h2>
                <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  Start with one milestone so both sides know who is responsible for the next action.
                </p>
              </div>
              <span className="inline-flex w-fit items-center rounded-lg border border-[rgba(var(--color-accent-2-rgb),0.22)] bg-[rgba(var(--color-accent-2-rgb),0.08)] px-3 py-1.5 text-xs font-bold text-[var(--color-accent-2)]">
                {form.amount ? `${form.currency || "USD"} ${form.amount}` : "Amount pending"}
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={form.developerId}
                onChange={(e) => setForm((prev) => ({ ...prev, developerId: e.target.value }))}
                placeholder="Developer user ID"
                aria-label="Developer user ID"
                className={ui.control.field}
              />
              <input
                value={form.jobId}
                onChange={(e) => setForm((prev) => ({ ...prev, jobId: e.target.value }))}
                placeholder="Job ID (optional)"
                aria-label="Job ID optional"
                className={ui.control.field}
              />
              <input
                value={form.amount}
                onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                placeholder="Amount"
                type="number"
                aria-label="Escrow amount"
                className={ui.control.field}
              />
              <input
                value={form.currency}
                onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))}
                placeholder="Currency (USD)"
                aria-label="Currency"
                className={ui.control.field}
              />
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Milestone title"
                aria-label="Milestone title"
                className={cn(ui.control.field, "md:col-span-2")}
              />
            </div>
            <div className="mt-4 flex flex-col gap-3 border-t border-white/[0.06] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
                Funds stay tracked against one milestone so the next responsible person is visible.
              </p>
            <Button
              onClick={createContract}
              disabled={creating}
              isLoading={creating}
              size="sm"
              variant="glow"
              className="w-full sm:w-auto"
              leftIcon={<Send className="h-4 w-4" aria-hidden="true" />}
            >
              Create contract
            </Button>
            </div>
          </div>

          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--color-accent-2)]">Contracts</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-white/[0.10] to-transparent" />
            </div>
            <span className="flex-shrink-0 rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-xs text-white/70">
              Total value: {totalValue} {totalCurrency}
            </span>
          </div>
          {loading ? (
            <div className="grid gap-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className={surface("panelMuted", "noise-overlay relative overflow-hidden p-4 sm:p-5")}>
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="skeleton h-5 w-2/5 rounded-lg" />
                      <div className="skeleton h-4 w-3/5 rounded-lg" />
                    </div>
                    <div className="skeleton h-7 w-24 rounded-lg" />
                  </div>
                  <div className="mt-4 rounded-lg border border-white/[0.07] bg-black/10 p-3">
                    <div className="skeleton h-4 w-4/5 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : contracts.length === 0 ? (
            <div className={surface("empty", "flex items-start gap-3 p-5")}>
              <div className={iconBox("muted", "h-10 w-10 flex-shrink-0")}>
                <FileText className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">No escrow contracts yet</div>
                <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  Create a milestone above when a client and developer have agreed on scope and payment.
                </p>
              </div>
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
                const canSubmit = isDeveloper && milestoneStatus === "PENDING";
                const canRelease = isClient && milestoneStatus === "SUBMITTED";
                return (
                  <div key={contract.id} className={surface("panelMuted", "noise-overlay group relative overflow-hidden p-4 transition-colors hover:border-[rgba(var(--color-accent-2-rgb),0.20)] hover:bg-white/[0.04]")}>
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white">
                          {contract.milestone?.title || "Milestone"}
                        </div>
                        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted-foreground)]">
                          <span>{isClient ? "You are the client" : isDeveloper ? "You are the developer" : "Participant"}</span>
                          <span className="inline-flex items-center gap-1.5 text-white/70">
                            <DollarSign className="h-3.5 w-3.5 text-[var(--color-accent-2)]" aria-hidden="true" />
                            {contract.currency} {contract.amount}
                          </span>
                        </p>
                      </div>
                      <span className={escrowStatusPillClass(milestoneStatus)}>
                        {formatStatus(milestoneStatus)}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 text-xs text-[var(--muted-foreground)] sm:grid-cols-2">
                      <span className="rounded-md border border-white/[0.08] bg-white/[0.035] px-2.5 py-2">Contract: {formatStatus(contract.status)}</span>
                      <span className="min-w-0 truncate rounded-md border border-white/[0.08] bg-white/[0.035] px-2.5 py-2">{contract.jobId ? `Job ${contract.jobId}` : "No linked job"}</span>
                    </div>
                    <div className="mt-3 flex items-start gap-2 rounded-lg border border-white/[0.08] bg-black/15 px-3 py-2 text-xs leading-relaxed text-white/70">
                      {milestoneStatus === "RELEASED" ? (
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-200" aria-hidden="true" />
                      ) : (
                        <Clock3 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[var(--color-accent-2)]" aria-hidden="true" />
                      )}
                      {nextStep}
                    </div>

                    {canSubmit || canRelease ? (
                      <div className="mt-4 flex flex-col gap-2 rounded-lg border border-white/[0.07] bg-black/10 p-2 sm:flex-row">
                      {canSubmit && (
                        <Button
                          onClick={() => submitMilestone(contract.id)}
                          disabled={actionBusy}
                          isLoading={actionBusy}
                          size="sm"
                          variant="secondary"
                          className="w-full sm:w-auto"
                          leftIcon={<Send className="h-4 w-4" aria-hidden="true" />}
                        >
                          Submit milestone
                        </Button>
                      )}
                      {canRelease && (
                        <Button
                          onClick={() => releaseMilestone(contract.id)}
                          disabled={actionBusy}
                          isLoading={actionBusy}
                          size="sm"
                          variant="glow"
                          className="w-full sm:w-auto"
                          leftIcon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
                        >
                          Release funds
                        </Button>
                      )}
                      </div>
                    ) : null}
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

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function escrowStatusPillClass(status: string) {
  const normalized = status.toUpperCase();
  const tone =
    normalized === "RELEASED" || normalized === "ACTIVE"
      ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-200"
      : normalized === "SUBMITTED"
        ? "border-[rgba(var(--color-accent-2-rgb),0.24)] bg-[rgba(var(--color-accent-2-rgb),0.10)] text-[var(--color-accent-2)]"
        : normalized === "DISPUTED" || normalized === "CANCELLED"
          ? "border-rose-400/20 bg-rose-500/10 text-rose-200"
          : "border-white/[0.10] bg-white/[0.04] text-white/60";

  return cn("inline-flex w-fit items-center rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.10em]", tone);
}
