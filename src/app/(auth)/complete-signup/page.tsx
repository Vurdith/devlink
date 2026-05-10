"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/components/providers/ThemeProvider";
import { surface, ui } from "@/components/ui/design-system";
import { cn } from "@/lib/cn";
import { getPasswordStrength, getStrengthColor, PASSWORD_REQUIREMENTS } from "../register/register-validation";

const authInputClass = cn(ui.control.field, "h-12 px-4");
const authInputWithRightIconClass = cn(authInputClass, "pr-11");

export default function CompleteSignupPage() {
  const { status, update } = useSession();
  const router = useRouter();
  const { logoPath } = useTheme();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const passwordStrength = getPasswordStrength(password);
  const passwordValid = passwordStrength === PASSWORD_REQUIREMENTS.length;
  const passwordsMatch = password === passwordConfirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!passwordValid) {
      setError("Meet all password requirements before saving.");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Could not set password");
        return;
      }

      // Refresh session to update needsPassword flag
      await update();
      
      setSuccess(true);
      setTimeout(() => {
        router.push("/home");
      }, 2000);
    } catch {
      setError("Could not reach DevLink. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (loading) return;
    router.push("/home");
  };

  const canSubmitPassword =
    passwordValid &&
    passwordConfirm.length > 0 &&
    passwordsMatch &&
    !loading;

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center -my-6">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-accent)] border-t-transparent"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center -my-6 px-4">
        <div className="w-full max-w-md">
          <div className={surface("panel", "relative overflow-hidden p-6 text-center sm:p-8")}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Password set</h2>
            <p className="text-[var(--muted-foreground)] mb-4">You can now log in with your email and password.</p>
            <p className="text-sm text-[var(--muted-foreground)]/70">Redirecting to home...</p>
            <Button type="button" variant="secondary" className="mt-5 w-full" onClick={() => router.push("/home")}>
              Go to home now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center -my-6 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <Image src={logoPath} alt="DevLink" width={48} height={48} className="h-12 w-auto mx-auto" />
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Complete your account</h1>
          <p className="text-[var(--muted-foreground)]">
            Set a password to log in with your email in the future
          </p>
        </div>

        {/* Form */}
        <div className={surface("panel", "relative overflow-hidden p-6 sm:p-8")}>
          <div className="mb-6 p-4 rounded-lg bg-[rgba(var(--color-accent-2-rgb),0.1)] border border-[rgba(var(--color-accent-2-rgb),0.2)]">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[var(--color-accent-2)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-[var(--color-accent-2)] font-medium">Optional but recommended</p>
                <p className="mt-1 text-xs text-[rgba(var(--color-accent-2-rgb),0.70)]">
                  Adding a password lets you log in even if your social account becomes unavailable.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20">
              <p className="text-[var(--color-accent)] text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Password */}
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                className={authInputWithRightIconClass}
                placeholder="Create a password"
                disabled={loading}
                aria-describedby={password ? "complete-password-requirements" : "complete-password-help"}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-[2.125rem] rounded-md p-1 text-[var(--muted-foreground)] transition-all hover:bg-white/[0.06] hover:text-white active:scale-95"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 0 1 1.563-3.029m5.858.908a3 3 0 1 1 4.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
              {!password && (
                <p id="complete-password-help" className="mt-2 text-xs text-[var(--muted-foreground)]">
                  Use a password you have not used on DevLink before.
                </p>
              )}
              {password && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={cn("h-1 flex-1 rounded-full transition-all", level < passwordStrength ? getStrengthColor(passwordStrength) : "bg-white/10")}
                      />
                    ))}
                  </div>
                  <div id="complete-password-requirements" className="grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
                    {PASSWORD_REQUIREMENTS.map((requirement) => {
                      const passed = requirement.test(password);
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                id="passwordConfirm"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={passwordConfirm}
                onChange={(e) => {
                  setPasswordConfirm(e.target.value);
                  if (error) setError("");
                }}
                className={cn(authInputClass, passwordConfirm && password !== passwordConfirm ? "border-[var(--color-accent)]/50 focus:border-[var(--color-accent)]" : "")}
                placeholder="Confirm your password"
                disabled={loading}
                aria-invalid={passwordConfirm ? password !== passwordConfirm : undefined}
                aria-describedby={passwordConfirm && password !== passwordConfirm ? "complete-password-match-error" : undefined}
              />
              {passwordConfirm && password !== passwordConfirm && (
                <p id="complete-password-match-error" className="text-xs text-[var(--color-accent)] mt-1">Passwords do not match</p>
              )}
              {passwordConfirm && password === passwordConfirm && passwordConfirm.length >= 8 && (
                <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Passwords match
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!canSubmitPassword}
              isLoading={loading}
              variant="gradient"
              className="w-full"
            >
              {loading ? "Saving password..." : "Set password"}
            </Button>

            {!canSubmitPassword && (password || passwordConfirm) && !loading && (
              <p className="text-center text-xs text-[var(--muted-foreground)]">
                Meet the password requirements and make both fields match.
              </p>
            )}

            {/* Skip Button */}
            <button
              type="button"
              onClick={handleSkip}
              disabled={loading}
            className="w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-4 py-3 font-medium text-gray-300 transition-all hover:bg-white/[0.08] hover:text-white active:scale-[0.985] focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              Skip for now
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            You can always set a password later in{" "}
            <Link href="/settings/security" className="text-[var(--color-accent-2)] hover:text-[var(--color-accent-2)]">
              Settings / Security
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}









