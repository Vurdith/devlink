"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { OAuthButton } from "@/components/ui/OAuthButton";
import { signIn } from "next-auth/react";
import Link from "next/link";

// Password validation requirements
const PASSWORD_REQUIREMENTS = [
  { key: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { key: "lowercase", label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { key: "uppercase", label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { key: "number", label: "One number", test: (p: string) => /\d/.test(p) },
];

// Username validation
const validateUsername = (username: string): { valid: boolean; error?: string } => {
  const trimmed = username.trim().toLowerCase();
  if (!trimmed) return { valid: false, error: "Username is required" };
  if (trimmed.length < 3) return { valid: false, error: "At least 3 characters" };
  if (trimmed.length > 30) return { valid: false, error: "Less than 30 characters" };
  if (!/^[a-z0-9_]+$/.test(trimmed)) return { valid: false, error: "Only letters, numbers, underscores" };
  if (trimmed.startsWith('_') || trimmed.endsWith('_')) return { valid: false, error: "Can't start/end with underscore" };
  return { valid: true };
};

// Email validation
const validateEmail = (email: string): { valid: boolean; error?: string } => {
  const trimmed = email.trim();
  if (!trimmed) return { valid: false, error: "Email is required" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return { valid: false, error: "Invalid email format" };
  if (trimmed.length > 254) return { valid: false, error: "Email too long" };
  return { valid: true };
};

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function RegisterPage() {
  // Form state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation state
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "unavailable">("idle");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  // Form submission state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"idle" | "registering" | "signing-in">("idle");

  // Debounced values for validation
  const debouncedUsername = useDebounce(username, 500);

  // Check username availability
  useEffect(() => {
    const checkUsername = async () => {
      const validation = validateUsername(debouncedUsername);
      
      if (!validation.valid) {
        if (debouncedUsername.trim()) {
          setUsernameError(validation.error || null);
          setUsernameStatus("unavailable");
        } else {
          setUsernameStatus("idle");
          setUsernameError(null);
        }
        return;
      }

      setUsernameStatus("checking");
      setUsernameError(null);

      try {
        const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(debouncedUsername.trim().toLowerCase())}`);
        const data = await res.json();
        
        if (data.available) {
          setUsernameStatus("available");
          setUsernameError(null);
        } else {
          setUsernameStatus("unavailable");
          setUsernameError(data.reason || "Username unavailable");
        }
      } catch {
        setUsernameStatus("idle");
        setUsernameError("Could not check availability");
      }
    };

    checkUsername();
  }, [debouncedUsername]);

  // Validate email on blur
  const handleEmailBlur = () => {
    if (email.trim()) {
      const validation = validateEmail(email);
      setEmailError(validation.valid ? null : validation.error || null);
    }
  };

  // Password strength calculation
  const passedRequirements = PASSWORD_REQUIREMENTS.filter(req => req.test(password));
  const passwordStrength = passedRequirements.length;
  const passwordValid = passwordStrength === PASSWORD_REQUIREMENTS.length;
  const passwordsMatch = password === confirmPassword;

  // Form validation
  const isFormValid = 
    usernameStatus === "available" &&
    validateEmail(email).valid &&
    passwordValid &&
    passwordsMatch &&
    confirmPassword.length > 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!isFormValid) return;
    
    setLoading(true);
    setError(null);
    setStep("registering");

    try {
      // Step 1: Register
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: username.trim().toLowerCase(), 
          email: email.trim().toLowerCase(), 
          password 
        }),
      });

      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to create account");
      }

      // Step 2: Sign in
      setStep("signing-in");
      
      const signInResult = await signIn("credentials", { 
        email: email.trim().toLowerCase(), 
        password, 
        redirect: false 
      });

      if (signInResult?.error) {
        // Account created but sign-in failed - redirect to login
        window.location.href = "/login?registered=true";
        return;
      }

      // Success - redirect to profile
      window.location.href = "/me";
      
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create account";
      setError(message);
      setStep("idle");
    } finally {
      setLoading(false);
    }
  }

  // Get status indicator for username field
  const getUsernameIndicator = () => {
    if (usernameStatus === "checking") {
      return (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-[var(--accent)] border-r-transparent rounded-full animate-spin" />
        </div>
      );
    }
    if (usernameStatus === "available") {
      return (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }
    if (usernameStatus === "unavailable" && username.trim()) {
      return (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      );
    }
    return null;
  };

  // Get password strength color
  const getStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-600";
    if (passwordStrength === 1) return "bg-red-500";
    if (passwordStrength === 2) return "bg-orange-500";
    if (passwordStrength === 3) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  // Get loading message
  const getLoadingMessage = () => {
    if (step === "registering") return "Creating your account...";
    if (step === "signing-in") return "Signing you in...";
    return "Create account";
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16 -m-6">
      {/* Background decorations - CSS only */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[var(--accent)] rounded-full blur-[128px] opacity-20 animate-float" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[var(--accent-2)] rounded-full blur-[128px] opacity-20 animate-float" style={{ animationDelay: '-2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent-3)] rounded-full blur-[200px] opacity-10 animate-float" style={{ animationDelay: '-1s' }} />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-down">
          <Link href="/" className="inline-block mb-6 hover:scale-110 transition-transform">
            <Image
              src="/logo/logo.png"
              alt="DevLink"
              width={64}
              height={64}
              className="mx-auto"
              priority
            />
          </Link>
          <h1 className="text-3xl font-bold text-white font-[var(--font-space-grotesk)] mb-2">
            Create your account
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Join thousands of Roblox creators on DevLink
          </p>
        </div>

        {/* Form card */}
        <div className="bg-[#0d0d12] rounded-2xl p-8 border border-white/10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Username field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white mb-2">Username</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="username"
                  autoComplete="username"
                  placeholder="cooldev123"
                  className={`w-full h-12 pl-11 pr-11 rounded-xl bg-white/5 border outline-none text-white placeholder:text-[var(--muted-foreground)] focus:bg-white/10 transition-all ${
                    usernameStatus === "available" 
                      ? "border-emerald-500/50 focus:border-emerald-500" 
                      : usernameStatus === "unavailable" && username.trim()
                        ? "border-red-500/50 focus:border-red-500"
                        : "border-white/10 focus:border-[var(--accent)]"
                  }`}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  aria-describedby={usernameError && username.trim() ? "username-error" : usernameStatus === "available" ? "username-success" : undefined}
                  aria-invalid={usernameStatus === "unavailable" && username.trim()}
                />
                {getUsernameIndicator()}
              </div>
              {usernameError && username.trim() && (
                <p id="username-error" className="mt-1.5 text-xs text-red-400 flex items-center gap-1" role="alert">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {usernameError}
                </p>
              )}
              {usernameStatus === "available" && (
                <p id="username-success" className="mt-1.5 text-xs text-emerald-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Username available!
                </p>
              )}
            </div>

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">Email</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`w-full h-12 pl-11 pr-4 rounded-xl bg-white/5 border outline-none text-white placeholder:text-[var(--muted-foreground)] focus:bg-white/10 transition-all ${
                    emailError 
                      ? "border-red-500/50 focus:border-red-500" 
                      : "border-white/10 focus:border-[var(--accent)]"
                  }`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  onBlur={handleEmailBlur}
                  required
                  aria-describedby={emailError ? "email-error" : undefined}
                  aria-invalid={!!emailError}
                />
              </div>
              {emailError && (
                <p id="email-error" className="mt-1.5 text-xs text-red-400 flex items-center gap-1" role="alert">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {emailError}
                </p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full h-12 pl-11 pr-11 rounded-xl bg-white/5 border border-white/10 outline-none text-white placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:bg-white/10 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  required
                  aria-describedby="password-requirements"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-white transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password strength indicator */}
              {password && (
                <div className="mt-2 space-y-2">
                  {/* Strength bar */}
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i < passwordStrength ? getStrengthColor() : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Requirements checklist */}
                  {(passwordFocused || !passwordValid) && (
                    <div id="password-requirements" className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs" role="list" aria-label="Password requirements">
                      {PASSWORD_REQUIREMENTS.map((req) => {
                        const passed = req.test(password);
                        return (
                          <div
                            key={req.key}
                            role="listitem"
                            className={`flex items-center gap-1.5 transition-colors ${
                              passed ? "text-emerald-400" : "text-[var(--muted-foreground)]"
                            }`}
                          >
                            {passed ? (
                              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <circle cx="12" cy="12" r="9" strokeWidth={2} />
                              </svg>
                            )}
                            <span className="sr-only">{passed ? "Met: " : "Not met: "}</span>
                            {req.label}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password field */}
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-white mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={`w-full h-12 pl-11 pr-11 rounded-xl bg-white/5 border outline-none text-white placeholder:text-[var(--muted-foreground)] focus:bg-white/10 transition-all ${
                    confirmPassword && !passwordsMatch
                      ? "border-red-500/50 focus:border-red-500"
                      : confirmPassword && passwordsMatch
                        ? "border-emerald-500/50 focus:border-emerald-500"
                        : "border-white/10 focus:border-[var(--accent)]"
                  }`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  aria-describedby={confirmPassword && !passwordsMatch ? "confirm-password-error" : undefined}
                  aria-invalid={confirmPassword ? !passwordsMatch : undefined}
                />
                {confirmPassword && (
                  <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${passwordsMatch ? "text-emerald-400" : "text-red-400"}`} aria-hidden="true">
                    {passwordsMatch ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                )}
              </div>
              {confirmPassword && !passwordsMatch && (
                <p id="confirm-password-error" className="mt-1.5 text-xs text-red-400 flex items-center gap-1" role="alert">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Passwords don't match
                </p>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div role="alert" className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2 animate-fade-in">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit button */}
            <Button 
              type="submit" 
              isLoading={loading} 
              disabled={!isFormValid || loading}
              className="w-full h-12"
              variant="gradient"
            >
              {loading ? getLoadingMessage() : "Create account"}
            </Button>

            {/* Terms */}
            <p className="text-xs text-[var(--muted-foreground)] text-center">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="text-[var(--accent)] hover:underline">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-[var(--accent)] hover:underline">Privacy Policy</Link>
            </p>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[var(--card)] px-4 text-xs text-[var(--muted-foreground)]">
                or continue with
              </span>
            </div>
          </div>

          {/* OAuth buttons */}
          <div className="space-y-3">
            <OAuthButton provider="google">
              <div className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </div>
            </OAuthButton>
            
            <OAuthButton provider="apple">
              <div className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <span>Continue with Apple</span>
              </div>
            </OAuthButton>
          </div>
        </div>

        {/* Sign in link */}
        <p className="text-center mt-6 text-[var(--muted-foreground)] animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--accent)] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
