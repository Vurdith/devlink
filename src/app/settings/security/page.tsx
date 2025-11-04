"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useSession } from "next-auth/react";
import { useToastContext } from "@/components/providers/ToastProvider";

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

  // Check if user has a password
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Password Updated",
          description: "Your password has been changed successfully.",
          variant: "success",
        });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to change password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: session.user.email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Reset Email Sent",
          description: "If an account with that email exists, you will receive a password reset link.",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send reset email.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error requesting password reset:", error);
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Verification Email Sent",
          description: `Verification email sent to ${emailData.newEmail}. Please check your inbox.`,
          variant: "success",
        });
        setEmailData({
          newEmail: "",
          password: ""
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send verification email.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error changing email:", error);
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Security Settings</h1>
        <p className="text-gray-400">Manage your account security and authentication</p>
      </div>

      {/* Change Password Section */}
      {hasPassword && (
        <div className="bg-gradient-to-br from-white/5 to-white/3 border border-white/10 rounded-xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-blue-400">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Change Password</h2>
              <p className="text-sm text-gray-400">Update your account password</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Current Password</label>
              <input
                type="password"
                className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
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
                className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                autoComplete="off"
                required
              />
              {passwordData.newPassword && (
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
              <label className="block text-sm font-medium text-white mb-2">Confirm New Password</label>
              <input
                type="password"
                className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                autoComplete="off"
                required
              />
              {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isChangingPassword}
              disabled={passwordData.newPassword !== passwordData.confirmPassword || passwordStrength < 3}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Update Password
            </Button>
          </form>
        </div>
      )}

      {/* Reset Password Section */}
      <div className="bg-gradient-to-br from-white/5 to-white/3 border border-white/10 rounded-xl p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-orange-400">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" stroke="currentColor" strokeWidth="2"/>
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Reset Password via Email</h2>
            <p className="text-sm text-gray-400">Send a password reset link to your email</p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-300">
            If you've forgotten your password, we can send you a secure link to reset it.
          </p>
          
          <Button
            onClick={handlePasswordReset}
            variant="secondary"
            isLoading={isRequestingReset}
            className="w-full bg-purple-600 hover:bg-purple-700 border-purple-500 shadow-lg"
          >
            Send Reset Email
          </Button>
        </div>
      </div>

      {/* Change Email Section */}
      <div className="bg-gradient-to-br from-white/5 to-white/3 border border-white/10 rounded-xl p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-green-400">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
              <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Change Email Address</h2>
            <p className="text-sm text-gray-400">Update your account email address</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Current Email</label>
            <input
              type="email"
              className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-gray-400"
              value={session?.user?.email || ""}
              disabled
            />
          </div>

          <form onSubmit={handleEmailChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">New Email Address</label>
              <input
                type="email"
                className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
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
                className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                value={emailData.password}
                onChange={(e) => setEmailData(prev => ({ ...prev, password: e.target.value }))}
                autoComplete="off"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isChangingEmail}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Send Verification Email
            </Button>
          </form>

          <p className="text-xs text-gray-400">
            A verification email will be sent to your new email address. Click the link in the email to confirm the change.
          </p>
        </div>
      </div>
    </div>
  );
}


