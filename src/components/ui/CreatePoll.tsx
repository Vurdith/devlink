"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

interface CreatePollProps {
  onSubmit: (pollData: {
    question: string;
    options: string[];
    expiresAt?: Date;
    isMultiple: boolean;
  }) => void;
  onCancel: () => void;
}

export function CreatePoll({ onSubmit, onCancel }: CreatePollProps) {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-br from-black/60 via-black/40 to-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-xl p-6 backdrop-blur-sm shadow-2xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-[var(--accent)]/20 rounded-lg">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[var(--accent)]">
            <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2"/>
            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-white to-[var(--accent)] bg-clip-text text-transparent">Create Poll</h3>
          <p className="text-sm text-[var(--muted-foreground)]">Engage your community with a question</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-[var(--accent)]">Question</label>
          <div className="relative">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to ask?"
              className="w-full px-4 py-3 bg-black/30 border border-[var(--accent)]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-all duration-200"
              maxLength={200}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-[var(--muted-foreground)]">
              {question.length}/200
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3 text-[var(--accent)]">Options</label>
          <div className="space-y-3">
            <AnimatePresence>
              {options.map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-[var(--accent)]/20 border border-[var(--accent)]/30 rounded-full flex items-center justify-center text-sm font-bold text-[var(--accent)]">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 px-4 py-3 bg-black/30 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-all duration-200"
                    maxLength={100}
                  />
                  {options.length > 2 && (
                    <motion.button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {options.length < 10 && (
              <motion.button
                type="button"
                onClick={addOption}
                className="w-full py-3 px-4 bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-lg text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-all duration-200 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Add Option
              </motion.button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-black/20 border border-white/10 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-[var(--accent)]/20 rounded-lg">
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
                className="w-5 h-5 text-[var(--accent)] bg-black/30 border-[var(--accent)]/30 rounded focus:ring-[var(--accent)]/50"
              />
              <span className="text-sm text-[var(--muted-foreground)]">Allow users to select multiple options</span>
            </div>
          </div>

          <div className="p-4 bg-black/20 border border-white/10 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-[var(--accent)]/20 rounded-lg">
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
              className="w-full px-3 py-2 bg-black/30 border border-[var(--accent)]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-all duration-200"
            />
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Leave empty for no expiration</p>
          </div>
        </div>

        <div className="flex gap-3 pt-6">
          <motion.button
            type="button"
            disabled={!canSubmit}
            className="flex-1 py-3 px-6 bg-[var(--accent)] hover:bg-[var(--accent)]/80 disabled:bg-[var(--accent)]/30 disabled:cursor-not-allowed rounded-lg font-medium transition-all duration-200"
            onClick={handleSubmit}
            whileHover={canSubmit ? { scale: 1.02 } : {}}
            whileTap={canSubmit ? { scale: 0.98 } : {}}
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
          </motion.button>
          <motion.button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-6 bg-black/30 hover:bg-black/50 border border-white/20 rounded-lg font-medium transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
