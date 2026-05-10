"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScamReportForm } from "@/components/reports/ScamReportForm";
import { iconBox, surface } from "@/components/ui/design-system";
import { ShieldAlert } from "lucide-react";

function ReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get("postId");
  const targetUserId = searchParams.get("targetUserId");
  const targetUsername = searchParams.get("targetUsername");

  return (
    <main className="min-h-dvh px-4 pb-24 pt-6 sm:px-6 sm:pt-8">
      <div className="mx-auto max-w-4xl">
        <div className={surface("panel", "noise-overlay relative mb-5 overflow-hidden p-5 sm:p-6")}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.42)] to-transparent" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-accent-2)]">
                <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                Safety report
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Report a safety issue</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
                Share what happened, where it happened, and any evidence moderators should review.
              </p>
            </div>
            <div className={iconBox("cyan", "h-11 w-11")}>
              <ShieldAlert className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
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
    </main>
  );
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh px-4 py-8">
          <div className={surface("panel", "mx-auto max-w-2xl p-6 text-sm text-[var(--muted-foreground)]")}>
            Preparing the report form
          </div>
        </div>
      }
    >
      <ReportContent />
    </Suspense>
  );
}
