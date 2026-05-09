"use client";

import { useState, memo } from "react";
import Link from "next/link";
import { Button } from "../ui/Button";
import { surface, ui } from "@/components/ui/design-system";
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
  { value: "SCAM", label: "Scam", description: "Fraudulent activity or financial scam" },
  { value: "SPAM", label: "Spam", description: "Unwanted promotional content" },
  { value: "HARASSMENT", label: "Harassment", description: "Bullying or abusive behavior" },
  { value: "FAKE_PROFILE", label: "Fake Profile", description: "Impersonation or fake identity" },
  { value: "INAPPROPRIATE_CONTENT", label: "Inappropriate Content", description: "Content that violates community guidelines" },
  { value: "OTHER", label: "Other", description: "Other violations not listed above" }
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
    <div className={surface("panel", "mx-auto max-w-2xl p-6 animate-slide-up")}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Report a safety issue</h3>
        <p className="text-sm text-[var(--muted-foreground)]">
          Tell the moderation team what happened. Reports are private and reviewed for safety action.
          {targetUsername && (
            <> You are reporting <span className="text-[var(--accent)]">@{targetUsername}</span></>
          )}
          {postId && " You are reporting a specific post."}
        </p>
      </div>

      {submitted && (
        <div className={cn(surface("empty"), "mb-4 border-emerald-300/20 bg-emerald-400/10 p-3 text-sm text-emerald-100")} role="status">
          Report submitted. The moderation team will review it and take action if needed.
        </div>
      )}

      {error && (
        <div className={cn(surface("empty"), "mb-4 border-rose-300/20 bg-rose-500/10 p-3 text-sm text-rose-100")} role="alert">
          {error}
          {error.toLowerCase().includes("sign in") && (
            <Link href="/login?callbackUrl=/report" className="ml-2 font-semibold text-white underline underline-offset-4">
              Sign in
            </Link>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Report Type Selection */}
        {step === 1 ? (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-sm font-medium mb-3">What type of issue are you reporting?</label>
              <div className="grid gap-3">
                {REPORT_TYPES.map((type, index) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setReportType(type.value)}
                    className={cn(
                      "p-4 text-left rounded-lg border transition-all active:scale-98 animate-slide-up",
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
                className="flex items-center gap-2"
              >
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Button>
            </div>
          </div>
        ) : (
          /* Step 2: Details and Evidence */
          <div className="space-y-4 animate-fade-in">
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Please describe what happened
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Describe the behavior, where it happened, and who was affected."
                className="w-full resize-none rounded-lg border border-white/[0.10] bg-white/[0.035] px-3 py-2 outline-none transition-colors focus:border-[rgba(var(--color-accent-2-rgb),0.42)]"
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
                className="w-full resize-none rounded-lg border border-white/[0.10] bg-white/[0.035] px-3 py-2 outline-none transition-colors focus:border-[rgba(var(--color-accent-2-rgb),0.42)]"
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
                className="flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back
              </Button>
              <Button
                type="submit"
                disabled={description.trim().length < 10 || isSubmitting || submitted}
                className="flex-1 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Submit Report
                  </>
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
