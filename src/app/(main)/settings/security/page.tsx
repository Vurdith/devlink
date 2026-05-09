"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useSession, signOut } from "next-auth/react";
import { useToastContext } from "@/components/providers/ToastProvider";
import { cn } from "@/lib/cn";
import { TwoFactorSetup } from "@/components/auth/TwoFactorSetup";
import { ChangeEmailPanel, type EmailData } from "./ChangeEmailPanel";
import { DangerZonePanel } from "./DangerZonePanel";
import { PasswordMismatchMessage } from "./PasswordMismatchMessage";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import { ResetPasswordPanel } from "./ResetPasswordPanel";
import { SecurityPanel } from "./SecurityPanel";
import { getPasswordStrength } from "./password-strength";
import { ui } from "@/components/ui/design-system";
import { SettingsAuthRequired } from "../_components/SettingsAuthRequired";
import { SettingsPageHeader } from "../_components/SettingsPageHeader";
import { FeedbackState } from "@/components/ui/FeedbackState";

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SecuritySettings() {
  const { data: session, status } = useSession();
  const { toast } = useToastContext();
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [securityLoadError, setSecurityLoadError] = useState<string | null>(null);
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
    if (status !== "authenticated") {
      if (status === "unauthenticated") setHasPassword(null);
      return;
    }

    const checkPassword = async () => {
      setSecurityLoadError(null);
      try {
        const res = await fetch("/api/user/has-password");
        if (res.ok) {
          const data = await res.json();
          setHasPassword(data.hasPassword);
        } else {
          setSecurityLoadError("We could not load your password status. Refresh the page before changing security settings.");
        }
      } catch {
        setSecurityLoadError("We could not reach your security settings. Check your connection and try again.");
      }
    };
    void checkPassword();
  }, [status]);

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

  const handleDeleteAccount = async () => {
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
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);
  const inputBase = cn(ui.control.field, "h-11 px-4");

  return (
    <div className="space-y-6">
      <SettingsPageHeader
        eyebrow="Security"
        title="Security Settings"
        description="Manage your password and account security"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="16" r="1" fill="currentColor" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" />
          </svg>
        }
      />

      {status === "unauthenticated" ? (
        <SettingsAuthRequired
          title="Sign in to manage account security"
          description="Security controls are private. Sign in to update passwords, email verification, two-factor authentication, and account deletion."
        />
      ) : securityLoadError ? (
        <FeedbackState
          tone="danger"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M12 17h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path
                d="M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          }
          title="Security settings unavailable"
          description={securityLoadError}
          action={{ label: "Refresh", onClick: () => window.location.reload() }}
          className="py-12"
        />
      ) : (
        <>
      {/* Password Section Loading Skeleton */}
      {(status === "loading" || hasPassword === null) && (
        <SecurityPanel
          accent="cyan"
          title="Loading security settings..."
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
            <div className="h-11 rounded-lg border border-white/[0.08] bg-white/[0.035]" />
            <div className="h-11 rounded-lg border border-white/[0.08] bg-white/[0.035]" />
            <div className="h-11 w-32 rounded-lg border border-white/[0.08] bg-white/[0.055]" />
          </div>
        </SecurityPanel>
      )}

      {status === "authenticated" && hasPassword !== null ? (
        <>
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
          <div className="mb-6 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
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
              <PasswordStrengthMeter password={newPasswordData.password} />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>
              <input
                type="password"
                className={cn(
                  inputBase,
                  newPasswordData.confirmPassword && newPasswordData.password !== newPasswordData.confirmPassword
                    ? "border-rose-400/45 focus:border-rose-400"
                    : ""
                )}
                placeholder="Confirm your password"
                value={newPasswordData.confirmPassword}
                onChange={(e) => setNewPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                autoComplete="new-password"
                required
              />
              {newPasswordData.confirmPassword && newPasswordData.password !== newPasswordData.confirmPassword && <PasswordMismatchMessage />}
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
              <PasswordStrengthMeter password={passwordData.newPassword} />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Confirm New Password</label>
              <input
                type="password"
                className={cn(
                  inputBase,
                  passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                    ? "border-rose-400/45 focus:border-rose-400"
                    : ""
                )}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                autoComplete="off"
                required
              />
              {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && <PasswordMismatchMessage />}
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

      <ResetPasswordPanel email={session?.user?.email} isRequestingReset={isRequestingReset} onPasswordReset={handlePasswordReset} />

      <ChangeEmailPanel
        currentEmail={session?.user?.email}
        hasPassword={hasPassword}
        emailData={emailData}
        inputClassName={inputBase}
        isChangingEmail={isChangingEmail}
        onEmailDataChange={setEmailData}
        onEmailChange={handleEmailChange}
      />

      {/* Two-Factor Authentication */}
      <SecurityPanel
        accent="emerald"
        title="Two-factor authentication"
        description="Add an extra layer of security to your account."
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
        className="animate-slide-up"
        style={{ animationDelay: "0.25s" }}
      >
        <TwoFactorSetup />
      </SecurityPanel>

      <DangerZonePanel
        hasPassword={hasPassword}
        showDeleteConfirm={showDeleteConfirm}
        deletePassword={deletePassword}
        deleteConfirmText={deleteConfirmText}
        isDeleting={isDeleting}
        onShowDeleteConfirm={() => setShowDeleteConfirm(true)}
        onCancelDelete={() => {
          setShowDeleteConfirm(false);
          setDeletePassword("");
          setDeleteConfirmText("");
        }}
        onDeletePasswordChange={setDeletePassword}
        onDeleteConfirmTextChange={setDeleteConfirmText}
        onDeleteAccount={handleDeleteAccount}
      />
        </>
      ) : null}
        </>
      )}
    </div>
  );
}
