"use client";

import { useState, useEffect, type CSSProperties, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { useSession, signOut } from "next-auth/react";
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

function SecurityPanel({
  accent,
  title,
  description,
  icon,
  children,
  className,
  style,
}: {
  accent: "cyan" | "emerald" | "amber" | "red";
  title: string;
  description?: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const accents: Record<typeof accent, { glow: string; border: string; iconBg: string }> = {
    cyan: {
      glow: "radial-gradient(900px 260px at 18% 0%, rgba(34,211,238,0.14), transparent 60%), radial-gradient(800px 240px at 92% 0%, rgba(59,130,246,0.10), transparent 60%)",
      border: "border-white/10",
      iconBg: "from-cyan-500 to-blue-500 shadow-cyan-500/20",
    },
    emerald: {
      glow: "radial-gradient(900px 260px at 18% 0%, rgba(16,185,129,0.14), transparent 60%), radial-gradient(800px 240px at 92% 0%, rgba(34,197,94,0.10), transparent 60%)",
      border: "border-white/10",
      iconBg: "from-emerald-500 to-green-500 shadow-emerald-500/20",
    },
    amber: {
      glow: "radial-gradient(900px 260px at 18% 0%, rgba(245,158,11,0.14), transparent 60%), radial-gradient(800px 240px at 92% 0%, rgba(249,115,22,0.10), transparent 60%)",
      border: "border-white/10",
      iconBg: "from-amber-500 to-orange-500 shadow-amber-500/20",
    },
    red: {
      glow: "radial-gradient(900px 260px at 18% 0%, rgba(239,68,68,0.14), transparent 60%), radial-gradient(800px 240px at 92% 0%, rgba(244,63,94,0.10), transparent 60%)",
      border: "border-red-500/30",
      iconBg: "from-red-500 to-rose-600 shadow-red-500/25",
    },
  };

  const a = accents[accent];

  return (
    <div
      className={cn("relative overflow-hidden glass glass-hover rounded-2xl p-6 border noise-overlay", a.border, className)}
      style={style}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60" style={{ background: a.glow }} />
      <div className="relative flex items-start gap-3 mb-6">
        <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg", a.iconBg)}>
          <div className="text-white">{icon}</div>
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {description ? <p className="text-sm text-[var(--muted-foreground)]">{description}</p> : null}
        </div>
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

export default function SecuritySettings() {
  const { data: session } = useSession();
  const { toast } = useToastContext();
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isRequestingReset, setIsRequestingReset] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  
  // Account deletion state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [newPasswordData, setNewPasswordData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  
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

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPasswordData.password !== newPasswordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSettingPassword(true);

    try {
      const response = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPasswordData.password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Password Set!",
          description: "You can now log in with your email and password.",
          variant: "success",
        });
        setNewPasswordData({ password: "", confirmPassword: "" });
        setHasPassword(true); // Update state to show change password form
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to set password.",
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
      setIsSettingPassword(false);
    }
  };

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
  const strengthColors = ["bg-[var(--color-accent)]", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-emerald-500"];
  const inputBase =
    "w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-[var(--muted-foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all";

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

      {/* Password Section Loading Skeleton */}
      {hasPassword === null && (
        <SecurityPanel
          accent="cyan"
          title="Loading security settings…"
          description="Fetching your authentication details."
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          className="animate-pulse"
        >
          <div className="space-y-4">
            <div className="h-11 bg-white/5 rounded-xl" />
            <div className="h-11 bg-white/5 rounded-xl" />
            <div className="h-11 bg-white/10 rounded-xl w-32" />
          </div>
        </SecurityPanel>
      )}

      {/* Set Password Section - for OAuth users without a password */}
      {hasPassword === false && (
        <SecurityPanel
          accent="emerald"
          title="Set a password"
          description="Add email/password login alongside OAuth."
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          className="animate-slide-up"
          style={{ animationDelay: '0.05s' } as React.CSSProperties}
        >
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-blue-400 mt-0.5 flex-shrink-0">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 16v-4m0-4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p className="text-sm text-blue-300">
                You signed up with Google/GitHub. Set a password to also log in with your email address.
              </p>
            </div>
          </div>

          <form onSubmit={handleSetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">New Password</label>
              <input
                type="password"
                className={inputBase}
                placeholder="Enter a secure password"
                value={newPasswordData.password}
                onChange={(e) => setNewPasswordData(prev => ({ ...prev, password: e.target.value }))}
                autoComplete="new-password"
                required
              />
              {newPasswordData.password && (
                <div className="mt-3">
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          "h-1.5 flex-1 rounded-full transition-colors",
                          getPasswordStrength(newPasswordData.password) >= level 
                            ? strengthColors[getPasswordStrength(newPasswordData.password) - 1] 
                            : "bg-white/10"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {strengthLabels[getPasswordStrength(newPasswordData.password) - 1] || "Enter a password"} password
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>
              <input
                type="password"
                className={cn(
                  "w-full h-11 px-4 rounded-xl bg-white/[0.04] border text-white placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-1 transition-all",
                  newPasswordData.confirmPassword && newPasswordData.password !== newPasswordData.confirmPassword
                    ? "border-[var(--color-accent)]/50 focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                    : "border-white/10 focus:border-[var(--accent)] focus:ring-[var(--accent)]"
                )}
                placeholder="Confirm your password"
                value={newPasswordData.confirmPassword}
                onChange={(e) => setNewPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                autoComplete="new-password"
                required
              />
              {newPasswordData.confirmPassword && newPasswordData.password !== newPasswordData.confirmPassword && (
                <p className="text-xs text-[var(--color-accent)] mt-2 flex items-center gap-1">
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
              isLoading={isSettingPassword}
              disabled={
                newPasswordData.password !== newPasswordData.confirmPassword || 
                getPasswordStrength(newPasswordData.password) < 3
              }
              className="w-full"
            >
              Set Password
            </Button>
          </form>
        </SecurityPanel>
      )}

      {/* Change Password Section */}
      {hasPassword && (
        <SecurityPanel
          accent="cyan"
          title="Change password"
          description="Keep your account secure with a strong password."
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="16" r="1" fill="currentColor" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" />
            </svg>
          }
          className="animate-slide-up"
          style={{ animationDelay: "0.05s" }}
        >
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Current Password</label>
              <input
                type="password"
                className={inputBase}
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
                className={inputBase}
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
                  "w-full h-11 px-4 rounded-xl bg-white/[0.04] border text-white placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-1 transition-all",
                  passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                    ? "border-[var(--color-accent)]/50 focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                    : "border-white/10 focus:border-[var(--accent)] focus:ring-[var(--accent)]"
                )}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                autoComplete="off"
                required
              />
              {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                <p className="text-xs text-[var(--color-accent)] mt-2 flex items-center gap-1">
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
        </SecurityPanel>
      )}

      {/* Reset Password Section */}
      <SecurityPanel
        accent="amber"
        title="Reset via email"
        description="Send yourself a secure password reset link."
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
        className="animate-slide-up"
        style={{ animationDelay: "0.1s" }}
      >
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
      </SecurityPanel>

      {/* Change Email Section */}
      <SecurityPanel
        accent="emerald"
        title="Change email"
        description="Update where you receive security and account emails."
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" />
          </svg>
        }
        className="animate-slide-up"
        style={{ animationDelay: "0.15s" }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Current Email</label>
            <div className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-[var(--muted-foreground)] flex items-center">
              {session?.user?.email || "Loading..."}
            </div>
          </div>

          <form onSubmit={handleEmailChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">New Email Address</label>
              <input
                type="email"
                className={inputBase}
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
                className={inputBase}
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
      </SecurityPanel>

      {/* Danger Zone - Account Deletion */}
      <SecurityPanel
        accent="red"
        title="Danger zone"
        description="Permanently delete your account and all associated data."
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
        className="animate-slide-up"
        style={{ animationDelay: "0.2s" }}
      >
        {!showDeleteConfirm ? (
          <div className="space-y-4">
            <p className="text-sm text-[var(--muted-foreground)]">
              Once you delete your account, there is no going back. All your data, posts, followers, and everything associated with your account will be permanently removed.
            </p>
            
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="secondary"
              className="w-full border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 text-red-500"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-2">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Delete Account
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-red-500 mt-0.5 flex-shrink-0">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>
                  <p className="text-sm text-red-500 font-medium">This action cannot be undone!</p>
                  <p className="text-xs text-red-500/70 mt-1">
                    All your posts, likes, followers, and profile data will be permanently deleted.
                  </p>
                </div>
              </div>
            </div>

            {hasPassword && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">Your Password</label>
                <input
                  type="password"
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-red-500/30 text-white placeholder-[var(--muted-foreground)] focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
                  placeholder="Enter your password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Type <span className="text-red-500 font-mono">DELETE</span> to confirm
              </label>
              <input
                type="text"
                className={cn(
                  "w-full h-11 px-4 rounded-xl bg-white/5 border text-white placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-1 transition-all",
                  deleteConfirmText === "DELETE"
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-white/10 focus:border-red-500/50 focus:ring-red-500/50"
                )}
                placeholder="Type DELETE"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                autoComplete="off"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword("");
                  setDeleteConfirmText("");
                }}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (deleteConfirmText !== "DELETE") {
                    toast({
                      title: "Error",
                      description: "Please type DELETE to confirm.",
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  if (hasPassword && !deletePassword) {
                    toast({
                      title: "Error",
                      description: "Please enter your password.",
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  setIsDeleting(true);
                  
                  try {
                    const response = await fetch("/api/user/delete", {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        password: deletePassword || undefined,
                        confirmationText: deleteConfirmText,
                      }),
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                      toast({
                        title: "Account Deleted",
                        description: "Your account has been permanently deleted.",
                        variant: "success",
                      });
                      // Sign out and redirect to home
                      await signOut({ callbackUrl: "/" });
                    } else {
                      toast({
                        title: "Error",
                        description: data.error || "Failed to delete account.",
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
                    setIsDeleting(false);
                  }
                }}
                disabled={deleteConfirmText !== "DELETE" || (hasPassword === true && !deletePassword)}
                isLoading={isDeleting}
                className="flex-1 bg-[var(--color-accent)] hover:bg-[var(--color-accent)] border-[var(--color-accent)]"
              >
                Delete Forever
              </Button>
            </div>
          </div>
        )}
      </SecurityPanel>
    </div>
  );
}
