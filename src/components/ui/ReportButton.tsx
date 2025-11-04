"use client";
import { useState } from "react";
import { Button } from "./Button";
import { ScamReportForm } from "./ScamReportForm";
import { motion, AnimatePresence } from "framer-motion";

interface ReportButtonProps {
  targetUserId?: string;
  targetUsername?: string;
  postId?: string;
  variant?: "icon" | "text" | "full";
  className?: string;
}

export function ReportButton({ targetUserId, targetUsername, postId, variant = "icon", className = "" }: ReportButtonProps) {
  const [showReportForm, setShowReportForm] = useState(false);

  const handleReportSubmitted = () => {
    setShowReportForm(false);
    // You could show a success toast here
  };

  const renderButton = () => {
    switch (variant) {
      case "text":
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReportForm(true)}
            className={`text-red-400 hover:text-red-300 hover:bg-red-500/10 ${className}`}
          >
            Report
          </Button>
        );
      case "full":
        return (
          <Button
            variant="secondary"
            onClick={() => setShowReportForm(true)}
            className={`border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 ${className}`}
          >
            Report Issue
          </Button>
        );
      default:
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReportForm(true)}
            className={`p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 ${className}`}
            title="Report this content"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Button>
        );
    }
  };

  return (
    <>
      {renderButton()}
      
      <AnimatePresence>
        {showReportForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowReportForm(false);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <ScamReportForm
                targetUserId={targetUserId}
                targetUsername={targetUsername}
                postId={postId}
                onReportSubmitted={handleReportSubmitted}
                onCancel={() => setShowReportForm(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
