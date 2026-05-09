import type { PollData } from "./composer-types";

interface ComposerPollSummaryProps {
  pollData: PollData;
  onRemove: () => void;
}

export function ComposerPollSummary({ pollData, onRemove }: ComposerPollSummaryProps) {
  return (
    <div className="animate-pop-in rounded-xl border border-[rgba(var(--color-accent-2-rgb),0.20)] bg-[rgba(var(--color-accent-2-rgb),0.055)] p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(var(--color-accent-2-rgb),0.24)] bg-[rgba(var(--color-accent-2-rgb),0.10)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[var(--color-accent)]">
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <div>
            <div className="font-semibold text-white">{pollData.question}</div>
            <div className="mt-1 text-xs text-[var(--muted-foreground)]">
              {pollData.options.length} options - {pollData.isMultiple ? "Multiple choice" : "Single choice"}
            </div>
          </div>
        </div>
        <button type="button" onClick={onRemove} className="rounded-lg p-2 text-[var(--muted-foreground)] transition-colors hover:bg-white/[0.055] hover:text-white" aria-label="Remove poll">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
