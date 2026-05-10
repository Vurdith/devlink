"use client";

import { useState, memo } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Send, ShieldAlert } from "lucide-react";
import { Button } from "../ui/Button";
import { iconBox, surface, ui } from "@/components/ui/design-system";
import { cn } from "@/lib/cn";

interface ScamReportFormProps {
  targetUserId?: string;
  targetUsername?: string;
  postId?: string;
  onReportSubmitted?: () => void;
  onCancel?: () => void;
}

type ReportType = "SCAM" | "SPAM" | "HARASSMENT" | "FAKE_PROFILE" | "INAPPROPRIATE_CONTENT" | "OTHER";

const REPORT_TYPES: { value: ReportType; label: string; description: string }[] = [
  { value: "SCAM", label: "Scam", description: "Payment fraud, phishing, or stolen account attempts" },
  { value: "SPAM", label: "Spam", description: "Repeated promotion, links, or irrelevant messages" },
  { value: "HARASSMENT", label: "Harassment", description: "Threats, targeted abuse, or intimidation" },
  { value: "FAKE_PROFILE", label: "Fake profile", description: "Impersonation or misleading identity" },
  { value: "INAPPROPRIATE_CONTENT", label: "Policy-breaking content", description: "Posts, media, or messages that need moderator review" },
  { value: "OTHER", label: "Something else", description: "A safety issue that does not fit the options above" }
];

export const ScamReportForm = memo(function ScamReportForm({ targetUserId, targetUsername, postId, onReportSubmitted, onCancel }: ScamReportFormProps) {
  const [reportType, setReportType] = useState<ReportType | "">("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmedDescription = description.trim();
    const trimmedEvidence = evidence.trim();

    if (!reportType) {
      setError("Choose the issue type before continuing.");
      setStep(1);
      return;
    }

    if (trimmedDescription.length < 10) {
      setError("Add at least 10 characters so the moderation team has enough context.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType,
          description: trimmedDescription,
          evidence: trimmedEvidence || null,
          targetUserId,
          postId,
        }),
      });

      if (response.ok) {
        setReportType("");
        setDescription("");
        setEvidence("");
        setSubmitted(true);
        window.setTimeout(() => {
          onReportSubmitted?.();
        }, 900);
      } else {
        const data = await response.json().catch(() => null) as { error?: string } | null;
        setError(data?.error || "We could not submit this report. Check the details and try again.");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      setError("DevLink could not reach the report service. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && reportType) {
      setError("");
      setStep(2);
    } else {
      setError("Choose the issue type before continuing.");
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  return (
    <div className={surface("panel", "noise-overlay relative mx-auto max-w-2xl overflow-hidden p-4 animate-slide-up sm:p-6")}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-white">Report details</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
            Tell moderators what happened. Reports stay private while the team reviews them.
            {targetUsername && (
              <> You are reporting <span className="text-[var(--accent)]">@{targetUsername}</span></>
            )}
            {postId && " You are reporting a specific post."}
          </p>
        </div>
        <div className={iconBox("cyan", "h-10 w-10 flex-shrink-0")}>
          <ShieldAlert className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] p-1">
        <div className={cn("rounded-lg border px-3 py-2 text-xs font-semibold", step === 1 ? ui.active.cyanStrong : "border-transparent text-white/45")}>
          1. Issue type
        </div>
        <div className={cn("rounded-lg border px-3 py-2 text-xs font-semibold", step === 2 ? ui.active.cyanStrong : "border-transparent text-white/45")}>
          2. Details
        </div>
      </div>

      {submitted && (
        <div className={cn(surface("empty"), "mb-4 flex items-start gap-2 border-emerald-300/20 bg-emerald-400/10 p-3 text-sm text-emerald-100")} role="status">
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>Report submitted. Moderators will review it and take action if needed.</span>
        </div>
      )}

      {error && (
        <div className={cn(surface("empty"), "mb-4 flex items-start gap-2 border-rose-300/20 bg-rose-500/10 p-3 text-sm text-rose-100")} role="alert">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span className="min-w-0">
            {error}
          {error.toLowerCase().includes("sign in") && (
            <Link href="/login?callbackUrl=/report" className="ml-2 font-semibold text-white underline underline-offset-4">
              Sign in
            </Link>
          )}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Report Type Selection */}
        {step === 1 ? (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="mb-3 block text-sm font-semibold text-white">Choose the closest issue</label>
              <div className="grid gap-3">
                {REPORT_TYPES.map((type, index) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setReportType(type.value)}
                    className={cn(
                      "min-h-16 rounded-lg border p-4 text-left outline-none transition-all active:scale-98 animate-slide-up focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)]",
                      reportType === type.value
                        ? ui.active.cyan
                        : cn(ui.surface.empty, "hover:border-white/[0.14] hover:bg-white/[0.045]")
                    )}
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-[var(--muted-foreground)]">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={nextStep}
                disabled={!reportType}
                rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
              >
                Next
              </Button>
            </div>
          </div>
        ) : (
          /* Step 2: Details and Evidence */
          <div className="space-y-4 animate-fade-in">
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                What happened?
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Describe the behavior, where it happened, and who was affected."
                className={cn(ui.control.field, "min-h-[128px] w-full resize-y")}
                rows={4}
                minLength={10}
                maxLength={5000}
                required
              />
              <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                <span className={cn("text-xs", description.trim().length > 0 && description.trim().length < 10 ? "text-amber-200" : "text-[var(--muted-foreground)]")}>
                  {Math.max(0, 10 - description.trim().length) > 0
                    ? `${10 - description.trim().length} more characters needed`
                    : "Enough detail to submit"}
                </span>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {description.length}/5000
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="evidence" className="block text-sm font-medium mb-2">
                Additional evidence (optional)
              </label>
              <textarea
                id="evidence"
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder="Add links, usernames, timestamps, transaction IDs, or screenshot URLs."
                className={cn(ui.control.field, "min-h-[104px] w-full resize-y")}
                rows={3}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-[var(--muted-foreground)]">
                  {evidence.length}/500 characters
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={prevStep}
                leftIcon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={description.trim().length < 10 || isSubmitting || submitted}
                className="flex-1"
                leftIcon={!isSubmitting ? <Send className="h-4 w-4" aria-hidden="true" /> : undefined}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
                    Submitting
                  </>
                ) : (
                  "Submit report"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Cancel Button */}
        {onCancel && (
          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
              className="text-[var(--muted-foreground)] hover:text-white"
            >
              Cancel
            </Button>
          </div>
        )}
      </form>
    </div>
  );
});
