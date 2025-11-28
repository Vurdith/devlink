"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

// Pages that should NOT redirect to complete-signup
const EXCLUDED_PATHS = [
  "/complete-signup",
  "/login",
  "/register",
  "/reset-password",
  "/api",
  "/_next",
];

export function usePasswordCheck() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only check when session is loaded
    if (status !== "authenticated") return;
    
    // Don't redirect if on excluded paths
    if (EXCLUDED_PATHS.some(path => pathname?.startsWith(path))) return;
    
    // Redirect to complete-signup if user needs to set password
    if (session?.user?.needsPassword) {
      router.push("/complete-signup");
    }
  }, [session, status, pathname, router]);

  return {
    needsPassword: session?.user?.needsPassword || false,
    isLoading: status === "loading",
  };
}








