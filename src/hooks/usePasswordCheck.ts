"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    // Only check when session is loaded
    if (status !== "authenticated") return;
    
    // Don't redirect if on excluded paths
    if (EXCLUDED_PATHS.some(path => pathname?.startsWith(path))) return;
    
    // If session says needsPassword, verify against DB first
    // (JWT might be stale if user already set password)
    if (session?.user?.needsPassword && !verified) {
      fetch("/api/user/has-password")
        .then(res => res.json())
        .then(data => {
          setVerified(true);
          if (data.hasPassword) {
            // User has password but JWT is stale - refresh session
            update();
          } else {
            // User actually needs to set password
            router.push("/complete-signup");
          }
        })
        .catch(() => {
          // On error, trust the session
          router.push("/complete-signup");
        });
    }
  }, [session, status, pathname, router, verified, update]);

  return {
    needsPassword: session?.user?.needsPassword || false,
    isLoading: status === "loading",
  };
}









