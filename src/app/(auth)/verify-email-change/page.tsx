"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToastContext } from "@/components/providers/ToastProvider";
import { surface } from "@/components/ui/design-system";

function VerifyEmailChangeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToastContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newEmail, setNewEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    
    if (!token) {
      setError("This verification link is missing its secure token. Request a new email change from Security settings.");
      setIsLoading(false);
      return;
    }

    // Auto-process the token
    const verifyEmailChange = async () => {
      try {
        const response = await fetch(`/api/user/change-email/confirm?token=${encodeURIComponent(token)}`, {
          method: "GET",
        });

        const data = await response.json();

        if (response.ok) {
          setIsSuccess(true);
          setNewEmail(data.newEmail);
          toast({
            title: "Email changed",
            description: `Your email has been updated to ${data.newEmail}`,
            variant: "success",
          });
        } else {
          setError(data.error || "This email change link could not be verified. It may have expired or already been used.");
        }
      } catch (error) {
        console.error("Error verifying email change:", error);
        setError("Could not reach DevLink. Check your connection and try again.");
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmailChange();
  }, [searchParams, toast]);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <div className={surface("panel", "relative overflow-hidden p-6 text-center")}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-accent-2)] mx-auto mb-4"></div>
          <p className="text-[var(--muted-foreground)]">Verifying email change...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <div className={surface("panel", "relative overflow-hidden p-6 text-center")}>
          <div className="w-16 h-16 bg-[var(--color-accent)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[var(--color-accent)]">
              <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">Verification failed</h1>
          <p className="text-[var(--muted-foreground)] mb-6">
            {error}
          </p>
          <div className="space-y-3">
            <Button onClick={() => router.push("/settings/security")} variant="primary" className="w-full">
              Request a new email change
            </Button>
            <Button onClick={() => router.push("/login")} variant="ghost" className="w-full">
              Back to login
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (isSuccess) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <div className="relative overflow-hidden rounded-xl mb-6">
          <div className={surface("panel", "relative overflow-hidden p-6")}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-green-300">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
              <h1 className="text-2xl font-semibold text-white">Email verified</h1>
                <p className="text-sm text-[var(--muted-foreground)]">Your email address has been updated</p>
              </div>
            </div>
          </div>
        </div>

        <div className={surface("panel", "relative overflow-hidden p-6 text-center")}>
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-green-400">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <h2 className="text-xl font-semibold text-white mb-2">Email change complete</h2>
          <p className="text-[var(--muted-foreground)] mb-6">
            Your DevLink sign-in email is now <strong className="text-white">{newEmail}</strong>. Use this address the next time you sign in.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={() => router.push("/settings/security")} 
              variant="primary"
              className="w-full"
            >
              Back to security settings
            </Button>
            <Button 
              onClick={() => router.push("/")} 
              variant="ghost"
              className="w-full"
            >
              Go home
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return null;
}

export default function VerifyEmailChangePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyEmailChangeContent />
    </Suspense>
  );
}
