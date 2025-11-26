"use client";

import { useState, memo } from "react";
import { Button } from "./Button";
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
  const [step, setStep] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportType) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType,
          description: description.trim(),
          evidence: evidence.trim() || null,
          targetUserId,
          postId,
        }),
      });

      if (response.ok) {
        setReportType("");
        setDescription("");
        setEvidence("");
        onReportSubmitted?.();
      } else {
        const error = await response.text();
        console.error("Error submitting report:", error);
      }
    } catch (error) {
      console.error("Error submitting report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && reportType) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  return (
    <div className="glass rounded-lg p-6 border border-white/10 max-w-2xl mx-auto animate-slide-up">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Report Issue</h3>
        <p className="text-sm text-[var(--muted-foreground)]">
          Help us keep DevLink safe by reporting violations of our community guidelines.
          {targetUsername && (
            <> You are reporting <span className="text-[var(--accent)]">@{targetUsername}</span></>
          )}
          {postId && " You are reporting a specific post."}
        </p>
      </div>

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
                        ? "border-[var(--accent)] bg-[var(--accent)]/10"
                        : "border-white/10 hover:border-white/20 hover:bg-white/5"
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
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a detailed description of the issue..."
                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg focus:border-[var(--accent)] outline-none resize-none transition-colors"
                rows={4}
                maxLength={1000}
                required
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-[var(--muted-foreground)]">
                  {description.length}/1000 characters
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
                placeholder="Links to screenshots, URLs, or other evidence..."
                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg focus:border-[var(--accent)] outline-none resize-none transition-colors"
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
                disabled={!description.trim() || isSubmitting}
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
