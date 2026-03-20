"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { useToastContext } from "@/components/providers/ToastProvider";

interface TwoFactorSetupProps {
  onStatusChange?: (enabled: boolean) => void;
}

export function TwoFactorSetup({ onStatusChange }: TwoFactorSetupProps) {
  const { toast } = useToastContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isEnabled, setIsEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [setupStep, setSetupStep] = useState<"qr" | "verify" | "recovery">("qr");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [disableCode, setDisableCode] = useState("");
  const [showDisable, setShowDisable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/2fa/status");
      if (res.ok) {
        const data = await res.json();
        setIsEnabled(data.enabled);
      }
    } catch (error) {
      console.error("Error fetching 2FA status:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const startSetup = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/2fa/setup", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setShowSetup(true);
        setSetupStep("qr");
      } else {
        const data = await res.json();
        toast({
          title: "Error",
          description: data.error || "Failed to start 2FA setup",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyAndEnable = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verifyCode, secret }),
      });

      if (res.ok) {
        const data = await res.json();
        setRecoveryCodes(data.recoveryCodes);
        setSetupStep("recovery");
        setIsEnabled(true);
        onStatusChange?.(true);
      } else {
        const data = await res.json();
        toast({
          title: "Error",
          description: data.error || "Invalid verification code",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const disable2FA = async () => {
    if (!disableCode || disableCode.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: disableCode }),
      });

      if (res.ok) {
        setIsEnabled(false);
        setShowDisable(false);
        setDisableCode("");
        onStatusChange?.(false);
        toast({
          title: "Success",
          description: "Two-factor authentication has been disabled",
          variant: "success",
        });
      } else {
        const data = await res.json();
        toast({
          title: "Error",
          description: data.error || "Failed to disable 2FA",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelSetup = () => {
    setShowSetup(false);
    setQrCode(null);
    setSecret(null);
    setVerifyCode("");
    setRecoveryCodes([]);
    setSetupStep("qr");
  };

  const inputBase =
    "w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-[var(--muted-foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all text-center text-lg tracking-widest";

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-11 bg-white/5 rounded-xl" />
        <div className="h-11 bg-white/10 rounded-xl w-32" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showSetup ? (
        <div className="space-y-6">
          {setupStep === "qr" && qrCode && (
            <>
              <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
                <p className="text-sm text-[var(--muted-foreground)] mb-4 text-center">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                <div className="flex justify-center">
                  <div className="bg-white p-3 rounded-xl">
                    <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">
                    Or enter this code manually:
                  </p>
                  <code className="text-xs bg-white/5 px-3 py-1 rounded-lg font-mono break-all">
                    {secret}
                  </code>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={cancelSetup} variant="secondary" className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={() => setSetupStep("verify")}
                  variant="gradient"
                  className="flex-1"
                >
                  Next
                </Button>
              </div>
            </>
          )}

          {setupStep === "verify" && (
            <>
              <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
                <p className="text-sm text-[var(--muted-foreground)] mb-4 text-center">
                  Enter the 6-digit code from your authenticator app
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  className={inputBase}
                  value={verifyCode}
                  onChange={(e) =>
                    setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setSetupStep("qr")} variant="secondary" className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={verifyAndEnable}
                  variant="gradient"
                  isLoading={isSubmitting}
                  disabled={verifyCode.length !== 6}
                  className="flex-1"
                >
                  Verify & Enable
                </Button>
              </div>
            </>
          )}

          {setupStep === "recovery" && recoveryCodes.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-amber-400 mt-0.5 flex-shrink-0"
                >
                  <path
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div>
                  <p className="text-sm text-amber-400 font-medium">
                    Save your recovery codes!
                  </p>
                  <p className="text-xs text-amber-400/70 mt-1">
                    These codes can be used to access your account if you lose your authenticator device.
                  </p>
                </div>
              </div>
              <div className="bg-black/30 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {recoveryCodes.map((code, index) => (
                    <div key={index} className="text-white/80">
                      {code}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(recoveryCodes.join("\n"));
                    toast({
                      title: "Copied!",
                      description: "Recovery codes copied to clipboard",
                      variant: "success",
                    });
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  Copy Codes
                </Button>
                <Button
                  onClick={() => {
                    setShowSetup(false);
                    setRecoveryCodes([]);
                  }}
                  variant="gradient"
                  className="flex-1"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : showDisable ? (
        <div className="space-y-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            Enter your 6-digit code to disable two-factor authentication.
          </p>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            className={inputBase}
            value={disableCode}
            onChange={(e) =>
              setDisableCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="000000"
            autoFocus
          />
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setShowDisable(false);
                setDisableCode("");
              }}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={disable2FA}
              variant="gradient"
              isLoading={isSubmitting}
              disabled={disableCode.length !== 6}
              className="flex-1"
            >
              Disable 2FA
            </Button>
          </div>
        </div>
      ) : isEnabled ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="text-emerald-400 flex-shrink-0"
            >
              <path
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <p className="text-sm text-emerald-400 font-medium">
                Two-factor authentication is enabled
              </p>
              <p className="text-xs text-emerald-400/70">
                Your account is protected with an authenticator app
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowDisable(true)}
            variant="secondary"
            className="w-full border-amber-500/30 hover:bg-amber-500/10 text-amber-400"
          >
            Disable 2FA
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            Add an extra layer of security to your account by enabling two-factor authentication.
          </p>
          <Button
            onClick={startSetup}
            variant="gradient"
            isLoading={isSubmitting}
            className="w-full"
          >
            Enable 2FA
          </Button>
        </div>
      )}
    </div>
  );
}
