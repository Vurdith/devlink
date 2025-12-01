"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToastContext } from "@/components/providers/ToastProvider";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToastContext();
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      setIsValidToken(true);
    } else {
      setIsValidToken(false);
    }
    setIsValidating(false);
  }, [searchParams]);

  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast({
        title: "Error",
        description: "Invalid reset token.",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordStrength < 3) {
      toast({
        title: "Error",
        description: "Password is too weak. Please choose a stronger password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/user/reset-password/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Password Reset Successfully",
          description: "Your password has been updated. Please log in with your new password.",
          variant: "success",
        });
        router.push("/login");
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to reset password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <div className="bg-[#0d0d12] border border-white/10 rounded-[var(--radius)] p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)] mx-auto mb-4"></div>
          <p className="text-[var(--muted-foreground)]">Validating reset token...</p>
        </div>
      </main>
    );
  }

  if (!isValidToken) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <div className="bg-[#0d0d12] border border-white/10 rounded-[var(--radius)] p-6 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-red-400">
              <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">Invalid Reset Link</h1>
          <p className="text-[var(--muted-foreground)] mb-6">
            This password reset link is invalid or has expired. Please request a new password reset.
          </p>
          <Button onClick={() => router.push("/login")} variant="primary">
            Back to Login
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="relative overflow-hidden rounded-[var(--radius)] mb-6">
        <div className="absolute -top-20 -right-24 w-96 h-96 rounded-full blur-3xl opacity-30" style={{ background: "radial-gradient(50% 50% at 50% 50%, var(--accent) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-20 -left-24 w-96 h-96 rounded-full blur-3xl opacity-30" style={{ background: "radial-gradient(50% 50% at 50% 50%, var(--accent-2) 0%, transparent 70%)" }} />
        <div className="bg-[#0d0d12] border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-blue-300">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">Reset Password</h1>
              <p className="text-sm text-[var(--muted-foreground)]">Enter your new password</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#0d0d12] border border-white/10 rounded-[var(--radius)] p-6 space-y-4 glow">
        <div>
          <label className="block text-sm mb-1">New Password</label>
          <input
            type="password"
            className="w-full h-10 px-3 rounded-md bg-black/30 border border-white/10 outline-none focus:border-[var(--accent)]"
            value={formData.newPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
            required
            minLength={8}
          />
          {formData.newPassword && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded ${
                      passwordStrength >= level
                        ? level <= 2 ? "bg-red-500" : level <= 3 ? "bg-yellow-500" : "bg-green-500"
                        : "bg-gray-600"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400">
                {passwordStrength <= 2 ? "Weak" : passwordStrength <= 3 ? "Medium" : "Strong"} password
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Confirm New Password</label>
          <input
            type="password"
            className="w-full h-10 px-3 rounded-md bg-black/30 border border-white/10 outline-none focus:border-[var(--accent)]"
            value={formData.confirmPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            required
            minLength={8}
          />
          {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
            <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
          )}
        </div>

        <Button 
          type="submit" 
          isLoading={isLoading} 
          disabled={passwordStrength < 3 || formData.newPassword !== formData.confirmPassword}
          className="w-full"
        >
          Reset Password
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-sm text-[var(--accent)] hover:underline"
          >
            Back to Login
          </button>
        </div>
      </form>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
