"use client";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { cn } from "@/lib/cn";

interface BackButtonProps {
  fallbackPath?: string;
  className?: string;
  onClick?: () => void;
}

export function BackButton({ fallbackPath = "/home", className = "", onClick }: BackButtonProps) {
  const router = useRouter();

  // Always show back button - users can navigate back from any page

  const handleBack = () => {
    // Call optional onClick handler (e.g., to close mobile menu)
    onClick?.();
    
    // Check if there's a previous page in browser history
    if (window.history.length > 1) {
      router.back();
    } else {
      // Fallback to home if no previous page
      router.push(fallbackPath);
    }
  };

  return (
    <Button
      onClick={handleBack}
      variant="ghost"
      size="sm"
      className={cn("text-white/70 hover:text-white", className)}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-2">
        <path 
          d="M19 12H5M12 19l-7-7 7-7" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      Back
    </Button>
  );
}
