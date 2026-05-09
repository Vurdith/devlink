"use client";

import { useState, memo } from "react";
import { iconBox, surface, ui } from "@/components/ui/design-system";
import { cn } from "@/lib/cn";

interface CreatePollProps {
  onSubmit: (pollData: {
    question: string;
    options: string[];
    expiresAt?: Date;
    isMultiple: boolean;
  }) => void;
  onCancel: () => void;
}

export const CreatePoll = memo(function CreatePoll({ onSubmit, onCancel }: CreatePollProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [isMultiple, setIsMultiple] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async () => {
    if (!question.trim() || options.some(opt => !opt.trim())) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        question: question.trim(),
        options: options.filter(opt => opt.trim()),
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        isMultiple
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validOptions = options.filter(opt => opt.trim()).length >= 2;
  const canSubmit = question.trim() && validOptions && !isSubmitting;

  return (
    <div className={surface("panel", "animate-slide-up p-6")}>
      <div className="flex items-center gap-3 mb-6">
        <div className={iconBox("cyan", "h-10 w-10")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2"/>
            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Create Poll</h3>
          <p className="text-sm text-[var(--muted-foreground)]">Engage your community with a question</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="poll-question" className="block text-sm font-medium mb-2 text-[var(--accent)]">Question</label>
          <div className="relative">
            <input
              id="poll-question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to ask?"
              className="w-full rounded-lg border border-white/[0.10] bg-white/[0.035] px-4 py-3 transition-all focus:border-[rgba(var(--color-accent-2-rgb),0.42)] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--color-accent-2-rgb),0.20)]"
              maxLength={200}
              aria-describedby="poll-question-count"
            />
            <div id="poll-question-count" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-[var(--muted-foreground)]" aria-live="polite">
              {question.length}/200
            </div>
          </div>
        </div>

        <div>
          <label id="poll-options-label" className="block text-sm font-medium mb-3 text-[var(--accent)]">Options</label>
          <div className="space-y-3" role="group" aria-labelledby="poll-options-label">
            {options.map((option, index) => (
              <div
                key={index}
                className="flex items-center gap-3 animate-slide-up"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-[rgba(var(--color-accent-2-rgb),0.24)] bg-[rgba(var(--color-accent-2-rgb),0.10)] text-sm font-bold text-[var(--color-accent-2)]" aria-hidden="true">
                  {index + 1}
                </div>
                <label htmlFor={`poll-option-${index}`} className="sr-only">Option {index + 1}</label>
                <input
                  id={`poll-option-${index}`}
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 rounded-lg border border-white/[0.10] bg-white/[0.035] px-4 py-3 transition-all focus:border-[rgba(var(--color-accent-2-rgb),0.42)] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--color-accent-2-rgb),0.20)]"
                  maxLength={100}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="p-2 text-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 rounded-lg transition-all active:scale-95"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
              </div>
            ))}
            
            {options.length < 10 && (
              <button
                type="button"
                onClick={addOption}
                className={cn("flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-[var(--color-accent-2)]", ui.active.cyan, ui.motion.press)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Add Option
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={surface("empty", "p-4")}>
            <div className="flex items-center gap-3 mb-3">
              <div className={iconBox("cyan", "h-8 w-8")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[var(--accent)]">
                  <path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <label htmlFor="isMultiple" className="text-sm font-medium text-[var(--accent)]">Multiple Choice</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isMultiple"
                checked={isMultiple}
                onChange={(e) => setIsMultiple(e.target.checked)}
                className="h-5 w-5 rounded border-[rgba(var(--color-accent-2-rgb),0.34)] bg-white/[0.035] text-[var(--color-accent-2)] focus:ring-[rgba(var(--color-accent-2-rgb),0.35)]"
              />
              <span className="text-sm text-[var(--muted-foreground)]">Allow users to select multiple options</span>
            </div>
          </div>

          <div className={surface("empty", "p-4")}>
            <div className="flex items-center gap-3 mb-3">
              <div className={iconBox("cyan", "h-8 w-8")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[var(--accent)]">
                  <path d="M12 2v6m0 0l2-2m-2 2l-2-2M12 22v-6m0 0l2 2m-2-2l-2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <label className="text-sm font-medium text-[var(--accent)]">Expiration</label>
            </div>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full rounded-lg border border-white/[0.10] bg-white/[0.035] px-3 py-2 transition-all focus:border-[rgba(var(--color-accent-2-rgb),0.42)] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--color-accent-2-rgb),0.20)]"
            />
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Leave empty for no expiration</p>
          </div>
        </div>

        <div className="flex gap-3 pt-6">
          <button
            type="button"
            disabled={!canSubmit}
            className={cn(
              "flex-1 py-3 px-6 rounded-lg font-medium transition-all",
              canSubmit 
                ? ui.control.gradient
                : "bg-[var(--accent)]/30 cursor-not-allowed"
            )}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Create Poll
              </div>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-white/[0.10] bg-white/[0.055] px-6 py-3 font-medium transition-all hover:border-white/20 hover:bg-white/[0.09] active:scale-[0.98]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
});
