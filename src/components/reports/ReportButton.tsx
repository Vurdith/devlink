"use client";

import { useState, memo } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "../ui/Button";
import { ScamReportForm } from "./ScamReportForm";
import { cn } from "@/lib/cn";

interface ReportButtonProps {
  targetUserId?: string;
  targetUsername?: string;
  postId?: string;
  variant?: "icon" | "text" | "full";
  className?: string;
}

export const ReportButton = memo(function ReportButton({ targetUserId, targetUsername, postId, variant = "icon", className = "" }: ReportButtonProps) {
  const [showReportForm, setShowReportForm] = useState(false);

  const handleReportSubmitted = () => {
    setShowReportForm(false);
  };

  const renderButton = () => {
    switch (variant) {
      case "text":
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReportForm(true)}
            className={cn("text-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10", className)}
          >
            Report
          </Button>
        );
      case "full":
        return (
          <Button
            variant="secondary"
            onClick={() => setShowReportForm(true)}
            className={cn("border-[var(--color-accent)]/30 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 hover:border-[var(--color-accent)]/50", className)}
            leftIcon={<AlertTriangle className="h-4 w-4" aria-hidden="true" />}
          >
            Report issue
          </Button>
        );
      default:
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReportForm(true)}
            className={cn("p-2 text-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10", className)}
            title="Report this content"
            aria-label="Report this content"
          >
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          </Button>
        );
    }
  };

  return (
    <>
      {renderButton()}
      
      {showReportForm && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-3 py-6 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4"
          style={{ contain: 'layout style paint' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowReportForm(false);
            }
          }}
        >
          <div className="w-full animate-pop-in">
            <ScamReportForm
              targetUserId={targetUserId}
              targetUsername={targetUsername}
              postId={postId}
              onReportSubmitted={handleReportSubmitted}
              onCancel={() => setShowReportForm(false)}
            />
          </div>
        </div>
      )}
    </>
  );
});
