"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useSession } from "next-auth/react";
import { useToastContext } from "@/components/providers/ToastProvider";
import { cn } from "@/lib/cn";

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface EmailData {
  newEmail: string;
  password: string;
}

export default function SecuritySettings() {
  const { data: session } = useSession();
  const { toast } = useToastContext();
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isRequestingReset, setIsRequestingReset] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [emailData, setEmailData] = useState<EmailData>({
    newEmail: "",
    password: ""
  });

  useEffect(() => {
    const checkPassword = async () => {
      try {
        const res = await fetch("/api/user/has-password");
        if (res.ok) {
          const data = await res.json();
          setHasPassword(data.hasPassword);
        }
      } catch (error) {
        console.error("Error checking password:", error);
      }
    };
    checkPassword();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Password Updated",
          description: "Your password has been changed successfully.",
          variant: "success",
        });
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to change password.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!session?.user?.email) return;
    setIsRequestingReset(true);

    try {
      const response = await fetch("/api/user/reset-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      });

      if (response.ok) {
        toast({
          title: "Reset Email Sent",
          description: "Check your inbox for the password reset link.",
          variant: "success",
        });
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Failed to send reset email.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsRequestingReset(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingEmail(true);

    try {
      const response = await fetch("/api/user/change-email/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Verification Email Sent",
          description: `Check ${emailData.newEmail} to confirm the change.`,
          variant: "success",
        });
        setEmailData({ newEmail: "", password: "" });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send verification email.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsChangingEmail(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-emerald-500"];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-white font-[var(--font-space-grotesk)]">
          Security Settings
        </h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Manage your password and account security
        </p>
      </div>

      {/* Change Password Section */}
      {hasPassword && (
        <div className="glass rounded-2xl p-6 border border-white/10 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Change Password</h2>
              <p className="text-sm text-[var(--muted-foreground)]">Update your account password</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Current Password</label>
              <input
                type="password"
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[var(--muted-foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                autoComplete="off"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">New Password</label>
              <input
                type="password"
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[var(--muted-foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                autoComplete="off"
                required
              />
              {passwordData.newPassword && (
                <div className="mt-3">
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          "h-1.5 flex-1 rounded-full transition-colors",
                          passwordStrength >= level ? strengthColors[passwordStrength - 1] : "bg-white/10"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {strengthLabels[passwordStrength - 1] || "Enter a password"} password
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Confirm New Password</label>
              <input
                type="password"
                className={cn(
                  "w-full h-11 px-4 rounded-xl bg-white/5 border text-white placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-1 transition-all",
                  passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                    ? "border-red-500/50 focus:border-red-500 focus:ring-red-500"
                    : "border-white/10 focus:border-[var(--accent)] focus:ring-[var(--accent)]"
                )}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                autoComplete="off"
                required
              />
              {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Passwords do not match
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="gradient"
              isLoading={isChangingPassword}
              disabled={passwordData.newPassword !== passwordData.confirmPassword || passwordStrength < 3}
              className="w-full"
            >
              Update Password
            </Button>
          </form>
        </div>
      )}

      {/* Reset Password Section */}
      <div className="glass rounded-2xl p-6 border border-white/10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Reset via Email</h2>
            <p className="text-sm text-[var(--muted-foreground)]">Send a password reset link</p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            Forgot your password? We'll send a secure reset link to your email address.
          </p>
          
          <Button
            onClick={handlePasswordReset}
            variant="secondary"
            isLoading={isRequestingReset}
            className="w-full"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
              <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Send Reset Email
          </Button>
        </div>
      </div>

      {/* Change Email Section */}
      <div className="glass rounded-2xl p-6 border border-white/10 animate-slide-up" style={{ animationDelay: '0.15s' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
              <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Change Email</h2>
            <p className="text-sm text-[var(--muted-foreground)]">Update your email address</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Current Email</label>
            <div className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-[var(--muted-foreground)] flex items-center">
              {session?.user?.email || "Loading..."}
            </div>
          </div>

          <form onSubmit={handleEmailChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">New Email Address</label>
              <input
                type="email"
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[var(--muted-foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all"
                placeholder="Enter new email"
                value={emailData.newEmail}
                onChange={(e) => setEmailData(prev => ({ ...prev, newEmail: e.target.value }))}
                autoComplete="off"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>
              <input
                type="password"
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[var(--muted-foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all"
                placeholder="Enter your password"
                value={emailData.password}
                onChange={(e) => setEmailData(prev => ({ ...prev, password: e.target.value }))}
                autoComplete="off"
                required
              />
            </div>

            <Button
              type="submit"
              variant="gradient"
              isLoading={isChangingEmail}
              className="w-full"
            >
              Send Verification Email
            </Button>
          </form>

          <p className="text-xs text-[var(--muted-foreground)] text-center">
            A verification email will be sent to your new address
          </p>
        </div>
      </div>
    </div>
  );
}
