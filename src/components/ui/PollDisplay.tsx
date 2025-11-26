"use client";
import { useState, useEffect, memo, useCallback } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface PollOption {
  id: string;
  text: string;
  votes: number;
  isSelected?: boolean;
}

interface PollDisplayProps {
  poll: {
    id: string;
    question: string;
    options: PollOption[];
    expiresAt?: Date;
    isMultiple: boolean;
    totalVotes: number;
  };
  currentUserId?: string;
  onVote: (optionIds: string[]) => Promise<void>;
}

export const PollDisplay = memo(function PollDisplay({ poll, currentUserId, onVote }: PollDisplayProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [localOptions, setLocalOptions] = useState<PollOption[]>(poll.options || []);
  const [localTotalVotes, setLocalTotalVotes] = useState(poll.totalVotes);

  const isExpired = poll.expiresAt && new Date() > new Date(poll.expiresAt);

  useEffect(() => {
    setLocalOptions(poll.options || []);
    setLocalTotalVotes(poll.totalVotes);
    
    const votedOptions = (poll.options || []).filter(opt => opt.isSelected);
    if (votedOptions.length > 0) {
      setSelectedOptions(votedOptions.map(opt => opt.id));
      setHasVoted(true);
    } else {
      setSelectedOptions([]);
      setHasVoted(false);
    }
  }, [poll.options, poll.totalVotes]);

  const handleOptionClick = useCallback((optionId: string) => {
    if (isExpired) return;

    if (poll.isMultiple) {
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions(prev => prev.includes(optionId) ? [] : [optionId]);
    }
  }, [isExpired, poll.isMultiple]);

  const handleVote = useCallback(async () => {
    if (selectedOptions.length === 0 || isExpired) return;

    setIsVoting(true);
    try {
      await onVote(selectedOptions);
      setLocalOptions(prev => 
        prev.map(opt => ({
          ...opt,
          votes: selectedOptions.includes(opt.id) ? opt.votes + 1 : opt.votes,
          isSelected: selectedOptions.includes(opt.id)
        }))
      );
      setLocalTotalVotes(prev => prev + selectedOptions.length);
      setHasVoted(true);
    } finally {
      setIsVoting(false);
    }
  }, [selectedOptions, isExpired, onVote]);

  const handleChangeVote = async () => {
    if (isExpired) return;

    setIsVoting(true);
    try {
      await onVote(selectedOptions);
      setLocalOptions(prev => 
        prev.map(opt => ({
          ...opt,
          isSelected: selectedOptions.includes(opt.id)
        }))
      );
      if (selectedOptions.length === 0) {
        setHasVoted(false);
      }
    } finally {
      setIsVoting(false);
    }
  };

  const getPercentage = (votes: number) => {
    if (localTotalVotes === 0) return 0;
    return Math.round((votes / localTotalVotes) * 100);
  };

  return (
    <div className="bg-gradient-to-br from-purple-500/10 via-black/30 to-indigo-500/10 border border-purple-500/20 rounded-xl p-5 backdrop-blur-md shadow-lg shadow-purple-500/5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-purple-400">
            <path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className="font-semibold text-white flex-1">{poll.question}</h3>
        {poll.isMultiple && (
          <span className="text-xs px-2.5 py-1 bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30 font-medium">
            Multiple Choice
          </span>
        )}
      </div>

      {poll.expiresAt && (
        <div className="text-sm text-[var(--muted-foreground)] mb-3">
          {isExpired ? (
            <span className="text-red-400">Poll ended</span>
          ) : (
            <span>Ends {format(new Date(poll.expiresAt), "MMM d, yyyy")}</span>
          )}
        </div>
      )}

      <div className="space-y-2 mb-4">
        {localOptions.map((option) => {
          const percentage = getPercentage(option.votes);
          const isSelected = selectedOptions.includes(option.id);
          
          return (
            <div
              key={option.id}
              className={cn(
                "relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-150",
                "hover:scale-[1.01] active:scale-[0.99]",
                isSelected 
                  ? "border-purple-500 bg-purple-500/15 shadow-lg shadow-purple-500/10"
                  : "border-white/10 hover:border-purple-500/40 hover:bg-white/5"
              )}
              onClick={() => handleOptionClick(option.id)}
            >
              {/* Selection indicator */}
              <div className={cn(
                "absolute top-4 left-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                isSelected ? "border-purple-500 bg-purple-500" : "border-white/30"
              )}>
                {isSelected && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              
              <div className="flex items-center justify-between mb-2 ml-8">
                <span className="font-medium text-white">{option.text}</span>
                {hasVoted && (
                  <span className="text-sm text-purple-300 font-medium">
                    {percentage}% <span className="text-[var(--muted-foreground)]">({option.votes})</span>
                  </span>
                )}
              </div>
              
              {hasVoted && (
                <div className="relative h-2 bg-white/10 rounded-full overflow-hidden ml-8">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isExpired && (
        <div className="flex gap-3 mt-4">
          <Button
            onClick={hasVoted ? handleChangeVote : handleVote}
            disabled={(!hasVoted && selectedOptions.length === 0) || isVoting}
            variant={hasVoted ? "secondary" : "primary"}
            className="flex-1"
          >
            {isVoting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
                Submitting...
              </span>
            ) : hasVoted ? (
              <span className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 4v6h6M23 20v-6h-6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Change Vote
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Cast Vote
              </span>
            )}
          </Button>
          
          {poll.isMultiple && selectedOptions.length > 0 && (
            <div className="text-sm text-purple-300 self-center px-3 py-1.5 bg-purple-500/10 rounded-lg border border-purple-500/20">
              {selectedOptions.length} selected
            </div>
          )}
        </div>
      )}

      <div className="text-sm text-[var(--muted-foreground)] text-center mt-4 pt-3 border-t border-white/10">
        {localTotalVotes} vote{localTotalVotes !== 1 ? 's' : ''} total
      </div>
    </div>
  );
});
