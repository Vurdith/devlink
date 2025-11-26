"use client";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "./Button";

interface BackButtonProps {
  fallbackPath?: string;
  className?: string;
  onClick?: () => void;
}

export function BackButton({ fallbackPath = "/home", className = "", onClick }: BackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

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
      className={`text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 ${className}`}
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
