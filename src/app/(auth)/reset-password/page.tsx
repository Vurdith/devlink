"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { surface, ui } from "@/components/ui/design-system";
import { cn } from "@/lib/cn";
import {
  getPasswordStrength,
  getStrengthColor,
  PASSWORD_REQUIREMENTS,
  validateRegisterEmail,
} from "../register/register-validation";

const authInputClass = cn(ui.control.field, "h-12 px-4");

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [isCheckingLink, setIsCheckingLink] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [requestEmail, setRequestEmail] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setToken(searchParams.get("token"));
    setIsCheckingLink(false);
  }, [searchParams]);

  const passwordStrength = getPasswordStrength(formData.newPassword);
  const passwordValid = passwordStrength === PASSWORD_REQUIREMENTS.length;
  const passwordsMatch = formData.newPassword === formData.confirmPassword;
  const requestEmailValidation = validateRegisterEmail(requestEmail);

  async function handleRequestSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRequestError(null);

    if (!requestEmailValidation.valid) {
      setRequestError(requestEmailValidation.error || "Enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/user/reset-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: requestEmail.trim().toLowerCase() }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setRequestError(data.error || "Could not send a reset link. Try again in a moment.");
        return;
      }

      setRequestSent(true);
    } catch {
      setRequestError("Could not reach DevLink. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConfirmSubmit(e: React.FormEvent) {
    e.preventDefault();
    setConfirmError(null);

    if (!token) {
      setConfirmError("Open the link from your reset email, or request a fresh link.");
      return;
    }

    if (!passwordValid) {
      setConfirmError("Meet all password requirements before saving your new password.");
      return;
    }

    if (!passwordsMatch) {
      setConfirmError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/user/reset-password/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setConfirmError(data.error || "Failed to reset password.");
        return;
      }

      router.push("/login?reset=true");
    } catch {
      setConfirmError("Could not reach DevLink. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isCheckingLink) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <div className={surface("panel", "noise-overlay relative overflow-hidden p-6 text-center")}>
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-[var(--color-accent-2)]" />
          <p className="text-[var(--muted-foreground)]">Checking reset details...</p>
        </div>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <div className={surface("panel", "noise-overlay relative overflow-hidden p-6 sm:p-8")}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.40)] to-transparent" />

          {requestSent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h1 className="mb-2 text-2xl font-semibold text-white">Check your email</h1>
              <p className="mb-6 text-sm leading-6 text-[var(--muted-foreground)]">
                If an account exists for <span className="font-medium text-white">{requestEmail.trim()}</span>, a reset link will arrive shortly. It expires after 30 minutes.
              </p>
              <div className="space-y-3">
                <Button type="button" variant="secondary" className="w-full" onClick={() => setRequestSent(false)}>
                  Use a different email
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => router.push("/login")}>
                  Back to login
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="mb-2 text-2xl font-semibold text-white">Reset your password</h1>
                <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                  Enter the email on your DevLink account and we&apos;ll send a secure reset link.
                </p>
              </div>

              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div>
                  <label htmlFor="reset-email" className="mb-2 block text-sm font-medium text-white">
                    Email
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    value={requestEmail}
                    onChange={(e) => {
                      setRequestEmail(e.target.value);
                      if (requestError) setRequestError(null);
                    }}
                    className={authInputClass}
                    placeholder="you@example.com"
                    aria-describedby={requestError ? "reset-request-error" : "reset-request-help"}
                    aria-invalid={!!requestError}
                    required
                  />
                  <p id="reset-request-help" className="mt-2 text-xs text-[var(--muted-foreground)]">
                    For security, DevLink shows the same confirmation even if the email is not registered.
                  </p>
                </div>

                {requestError && (
                  <div id="reset-request-error" role="alert" className="rounded-xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/10 p-3 text-sm text-[var(--color-accent)]">
                    {requestError}
                  </div>
                )}

                <Button type="submit" isLoading={isLoading} variant="gradient" className="w-full">
                  Send reset link
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
                Remembered it?{" "}
                <Link href="/login" className="font-medium text-[var(--color-accent-2)] hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="relative mb-6 overflow-hidden rounded-xl">
        <div className={surface("panel", "noise-overlay relative overflow-hidden p-6")}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.40)] to-transparent" />
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-[var(--color-accent)]/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-blue-300" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="16" r="1" fill="currentColor" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">Choose a new password</h1>
              <p className="text-sm text-[var(--muted-foreground)]">Use something different from your old password.</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleConfirmSubmit} className={surface("panel", "noise-overlay relative overflow-hidden space-y-4 p-6")}>
        <div>
          <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-white">
            New password
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            className={authInputClass}
            value={formData.newPassword}
            onChange={(e) => setFormData((prev) => ({ ...prev, newPassword: e.target.value }))}
            required
            minLength={8}
            aria-describedby="reset-password-requirements"
          />

          {formData.newPassword && (
            <div className="mt-2 space-y-2">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((level) => (
                  <div
                    key={level}
                    className={cn("h-1 flex-1 rounded-full transition-all", level < passwordStrength ? getStrengthColor(passwordStrength) : "bg-white/10")}
                  />
                ))}
              </div>
              <div id="reset-password-requirements" className="grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
                {PASSWORD_REQUIREMENTS.map((requirement) => {
                  const passed = requirement.test(formData.newPassword);
                  return (
                    <span key={requirement.key} className={cn("flex items-center gap-1.5", passed ? "text-emerald-400" : "text-[var(--muted-foreground)]")}>
                      <span aria-hidden="true">{passed ? "OK" : "-"}</span>
                      {requirement.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirm-new-password" className="mb-2 block text-sm font-medium text-white">
            Confirm new password
          </label>
          <input
            id="confirm-new-password"
            type="password"
            autoComplete="new-password"
            className={cn(authInputClass, formData.confirmPassword && !passwordsMatch ? "border-[var(--color-accent)]/50 focus:border-[var(--color-accent)]" : "")}
            value={formData.confirmPassword}
            onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            required
            minLength={8}
            aria-describedby={formData.confirmPassword && !passwordsMatch ? "reset-confirm-error" : undefined}
            aria-invalid={formData.confirmPassword ? !passwordsMatch : undefined}
          />
          {formData.confirmPassword && !passwordsMatch && (
            <p id="reset-confirm-error" className="mt-1 text-xs text-[var(--color-accent)]">
              Passwords do not match
            </p>
          )}
        </div>

        {confirmError && (
          <div role="alert" className="rounded-xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/10 p-3 text-sm text-[var(--color-accent)]">
            {confirmError}
          </div>
        )}

        <Button type="submit" isLoading={isLoading} disabled={!passwordValid || !passwordsMatch || isLoading} className="w-full" variant="gradient">
          Reset password
        </Button>

        <div className="text-center">
          <Link href="/login" className="text-sm text-[var(--color-accent-2)] hover:underline">
            Back to login
          </Link>
        </div>
      </form>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-md px-4 py-16"><div className={surface("panel", "p-6 text-center text-sm text-[var(--muted-foreground)]")}>Loading password reset...</div></main>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
