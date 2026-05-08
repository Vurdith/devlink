import type { PollData } from "./composer-types";

interface ComposerPollSummaryProps {
  pollData: PollData;
  onRemove: () => void;
}

export function ComposerPollSummary({ pollData, onRemove }: ComposerPollSummaryProps) {
  return (
    <div className="animate-pop-in p-4 bg-gradient-to-r from-[rgba(var(--color-accent-rgb),0.1)] to-cyan-500/10 border border-[rgba(var(--color-accent-rgb),0.3)] rounded-xl">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[rgba(var(--color-accent-rgb),0.2)] rounded-lg mt-0.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[var(--color-accent)]">
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <div>
            <div className="font-medium text-white">{pollData.question}</div>
            <div className="text-xs text-[var(--muted-foreground)] mt-1">
              {pollData.options.length} options - {pollData.isMultiple ? "Multiple choice" : "Single choice"}
            </div>
          </div>
        </div>
        <button type="button" onClick={onRemove} className="icon-btn p-2 text-[var(--color-accent)] hover:bg-[rgba(var(--color-accent-rgb),0.1)] rounded-lg">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
