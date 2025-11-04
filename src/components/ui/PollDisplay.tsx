"use client";
import { useState, useEffect, memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

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


  const isExpired = poll.expiresAt && new Date() > new Date(poll.expiresAt);

  useEffect(() => {
    // Check if user has already voted
    const votedOptions = localOptions.filter(opt => opt.isSelected);
    if (votedOptions.length > 0) {
      setSelectedOptions(votedOptions.map(opt => opt.id));
      setHasVoted(true);
    }
  }, [localOptions]);

  // Update selected options when poll data changes (e.g., after vote change)
  useEffect(() => {
    if (poll.options) {
      const votedOptions = poll.options.filter(opt => opt.isSelected);
      if (votedOptions.length > 0) {
        setSelectedOptions(votedOptions.map(opt => opt.id));
        setHasVoted(true);
      }
    }
  }, [poll.options]);



  const handleOptionClick = useCallback((optionId: string) => {
    if (isExpired) return;

    if (poll.isMultiple) {
      setSelectedOptions(prev => {
        const isCurrentlySelected = prev.includes(optionId);
        if (isCurrentlySelected) {
          // Remove option from selection
          return prev.filter(id => id !== optionId);
        } else {
          // Add option to selection
          return [...prev, optionId];
        }
      });
    } else {
      // Single choice - toggle selection (allow deselection)
      setSelectedOptions(prev => {
        if (prev.includes(optionId)) {
          // If already selected, deselect it
          return [];
        } else {
          // If not selected, select it
          return [optionId];
        }
      });
    }
  }, [isExpired, poll.isMultiple]);

  const handleVote = useCallback(async () => {
    if (selectedOptions.length === 0 || isExpired) return;

    setIsVoting(true);
    try {
      await onVote(selectedOptions);
      
      // Update local state to show the vote
      setLocalOptions(prev => 
        prev.map(opt => ({
          ...opt,
          votes: selectedOptions.includes(opt.id) ? opt.votes + 1 : opt.votes,
          isSelected: selectedOptions.includes(opt.id)
        }))
      );
      
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
      
      // Update local state to show the new vote
      setLocalOptions(prev => 
        prev.map(opt => ({
          ...opt,
          isSelected: selectedOptions.includes(opt.id)
        }))
      );
      
      // If no options selected, user has removed all votes
      if (selectedOptions.length === 0) {
        setHasVoted(false);
      }
    } finally {
      setIsVoting(false);
    }
  };



  const getPercentage = (votes: number) => {
    if (poll.totalVotes === 0) return 0;
    return Math.round((votes / poll.totalVotes) * 100);
  };



  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/30 border border-white/20 rounded-lg p-4 backdrop-blur-sm"
    >
             <div className="flex items-center gap-2 mb-3">
         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[var(--accent)]">
           <path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
         </svg>
         <h3 className="font-medium">{poll.question}</h3>
         {poll.isMultiple && (
           <span className="text-xs px-2 py-1 bg-[var(--accent)]/20 text-[var(--accent)] rounded-full border border-[var(--accent)]/30">
             Multiple Choice
           </span>
         )}
       </div>

      {poll.expiresAt && (
        <div className="text-sm text-[var(--muted-foreground)] mb-3">
          {isExpired ? (
            <span className="text-red-400">Poll ended</span>
          ) : (
            <span>Ends {new Date(poll.expiresAt).toLocaleDateString()}</span>
          )}
        </div>
      )}

      

      <div className="space-y-2 mb-4">
        {localOptions.map((option) => {
          const percentage = getPercentage(option.votes);
          const isSelected = selectedOptions.includes(option.id);
          
          return (
                         <motion.div
               key={option.id}
                               className={`relative p-3 rounded-lg border transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-[var(--accent)] bg-[var(--accent)]/20'
                    : 'border-white/20 hover:border-white/40'
                }`}
               onClick={() => handleOptionClick(option.id)}
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
             >
                                               {/* Selection indicator for both single and multiple choice */}
                 <div className={`absolute top-3 left-3 w-5 h-5 rounded-full border-2 ${
                   isSelected 
                     ? 'border-[var(--accent)] bg-[var(--accent)]'
                     : 'border-white/40'
                 }`}>
                   {isSelected && (
                     <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="currentColor">
                       <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                     </svg>
                   )}
                 </div>
                               <div className="flex items-center justify-between mb-2 ml-8">
                <span className="font-medium">{option.text}</span>
                {hasVoted && (
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {percentage}% ({option.votes})
                  </span>
                )}
              </div>
              
              {hasVoted && (
                <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[var(--accent)] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              )}
              

            </motion.div>
          );
        })}
      </div>

      {!isExpired && (
        <div className="flex gap-3">
                                  <Button
               onClick={hasVoted ? handleChangeVote : handleVote}
               disabled={(!hasVoted && selectedOptions.length === 0) || isVoting}
               className="flex-1"
             >
               {isVoting ? "Voting..." : (hasVoted ? "Change Vote" : "Vote")}
             </Button>
          
          {/* Show selection info for multiple choice polls */}
          {poll.isMultiple && selectedOptions.length > 0 && (
            <div className="text-sm text-[var(--muted-foreground)] self-center">
              {selectedOptions.length} option{selectedOptions.length !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>
      )}

      <div className="text-sm text-[var(--muted-foreground)] text-center mt-3">
        {poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''}
      </div>
    </motion.div>
  );
});
