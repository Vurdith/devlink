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
  const [linkError, setLinkError] = useState<string | null>(null);
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
    setLinkError(null);

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
      setToken(null);
      setFormData({ newPassword: "", confirmPassword: "" });
    } catch {
      setRequestError("Could not reach DevLink. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConfirmSubmit(e: React.FormEvent) {
    e.preventDefault();
    setConfirmError(null);
    setLinkError(null);

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
        const message = data.error || "Failed to reset password.";
        if (message.toLowerCase().includes("token")) {
          setLinkError(message);
          setFormData({ newPassword: "", confirmPassword: "" });
        } else {
          setConfirmError(message);
        }
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
          <p className="text-[var(--muted-foreground)]">Checking reset link...</p>
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
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-[rgba(var(--color-accent-2-rgb),0.25)] bg-[rgba(var(--color-accent-2-rgb),0.10)] text-[var(--color-accent-2)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h1 className="mb-2 text-2xl font-semibold text-white">Check your email</h1>
              <p className="mb-6 text-sm leading-6 text-[var(--muted-foreground)]">
                  If an account exists for <span className="font-medium text-white">{requestEmail.trim()}</span>, a reset link will arrive shortly. The link expires after 30 minutes.
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
                  Enter the email on your DevLink account. We&apos;ll send a secure reset link.
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[rgba(var(--color-accent-2-rgb),0.30)] bg-gradient-to-br from-[rgba(var(--color-accent-rgb),0.16)] to-[rgba(var(--color-accent-rgb),0.20)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[var(--color-accent-2)]" aria-hidden="true">
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
        {linkError && (
          <div role="alert" className="rounded-xl border border-[rgba(var(--color-accent-2-rgb),0.20)] bg-[rgba(var(--color-accent-2-rgb),0.10)] p-4">
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-[rgba(var(--color-accent-2-rgb),0.22)] bg-[rgba(var(--color-accent-2-rgb),0.10)] text-[var(--color-accent-2)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 9v4m0 4h.01M10.3 4.2 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--color-accent-2)]">This reset link did not work</p>
                <p className="mt-1 text-sm leading-6 text-[rgba(var(--color-accent-2-rgb),0.75)]">
                  {linkError} Request a new link and use the latest email from DevLink.
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Button type="button" variant="secondary" onClick={() => setToken(null)} className="w-full">
                Request new link
              </Button>
              <Button type="button" variant="ghost" onClick={() => router.push("/login")} className="w-full">
                Back to login
              </Button>
            </div>
          </div>
        )}

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
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, newPassword: e.target.value }));
              if (confirmError) setConfirmError(null);
            }}
            required
            minLength={8}
            disabled={!!linkError || isLoading}
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
                    <span key={requirement.key} className={cn("flex items-center gap-1.5", passed ? "text-[var(--color-accent-2)]" : "text-[var(--muted-foreground)]")}>
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
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }));
              if (confirmError) setConfirmError(null);
            }}
            required
            minLength={8}
            disabled={!!linkError || isLoading}
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

        <Button type="submit" isLoading={isLoading} disabled={!!linkError || !passwordValid || !passwordsMatch || isLoading} className="w-full" variant="gradient">
          {isLoading ? "Saving new password..." : "Reset password"}
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
