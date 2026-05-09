"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScamReportForm } from "@/components/reports/ScamReportForm";
import { surface } from "@/components/ui/design-system";

function ReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get("postId");
  const targetUserId = searchParams.get("targetUserId");
  const targetUsername = searchParams.get("targetUsername");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[var(--color-accent-hover)]/20 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-4">Report a safety issue</h1>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Share the specific behavior that needs review. Reports are private and help moderators act faster.
          </p>
        </div>

        <ScamReportForm
          targetUserId={targetUserId || undefined}
          targetUsername={targetUsername || undefined}
          postId={postId || undefined}
          onReportSubmitted={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push("/");
            }
          }}
        />
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[var(--color-accent-hover)]/20 to-slate-900 px-4 py-8">
          <div className={surface("panel", "mx-auto max-w-2xl p-6 text-sm text-[var(--muted-foreground)]")}>
            Preparing the report form...
          </div>
        </div>
      }
    >
      <ReportContent />
    </Suspense>
  );
}
