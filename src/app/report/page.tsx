"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ScamReportForm } from "@/components/ui/ScamReportForm";

function ReportContent() {
  const searchParams = useSearchParams();
  const postId = searchParams.get("postId");
  const targetUserId = searchParams.get("targetUserId");
  const targetUsername = searchParams.get("targetUsername");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950/20 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-4">Report Issue</h1>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Help us keep DevLink safe by reporting violations of our community guidelines.
            Your report will be reviewed by our moderation team.
          </p>
        </div>

        <ScamReportForm
          targetUserId={targetUserId || undefined}
          targetUsername={targetUsername || undefined}
          postId={postId || undefined}
          onReportSubmitted={() => {
            window.history.back();
          }}
        />
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ReportContent />
    </Suspense>
  );
}
