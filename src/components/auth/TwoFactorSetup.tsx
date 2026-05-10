"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { useToastContext } from "@/components/providers/ToastProvider";
import { cn } from "@/lib/cn";
import { surface, ui } from "@/components/ui/design-system";

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
  const [statusError, setStatusError] = useState<string | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setStatusError(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/2fa/status");
      if (res.ok) {
        const data = await res.json();
        setIsEnabled(data.enabled);
      } else {
        setStatusError("Could not check your two-factor status. Try again before changing security settings.");
      }
    } catch {
      setStatusError("Could not reach DevLink. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const startSetup = async () => {
    setIsSubmitting(true);
    setSetupError(null);
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
        setSetupError(data.error || "Failed to start two-factor setup.");
        toast({
          title: "Error",
          description: data.error || "Failed to start two-factor setup.",
          variant: "destructive",
        });
      }
    } catch {
      setSetupError("Could not reach DevLink. Check your connection and try again.");
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
    setSetupError(null);
    if (!verifyCode || verifyCode.length !== 6) {
      setSetupError("Enter the 6-digit code from your authenticator app.");
      toast({
        title: "Error",
        description: "Enter the 6-digit code from your authenticator app.",
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
        setSetupError(data.error || "Invalid verification code.");
        toast({
          title: "Error",
          description: data.error || "Invalid verification code.",
          variant: "destructive",
        });
      }
    } catch {
      setSetupError("Could not reach DevLink. Check your connection and try again.");
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
    setSetupError(null);
    if (!disableCode || disableCode.length !== 6) {
      setSetupError("Enter the 6-digit code from your authenticator app.");
      toast({
        title: "Error",
        description: "Enter the 6-digit code from your authenticator app.",
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
          description: "Two-factor authentication has been disabled.",
          variant: "success",
        });
      } else {
        const data = await res.json();
        setSetupError(data.error || "Failed to disable two-factor authentication.");
        toast({
          title: "Error",
          description: data.error || "Failed to disable two-factor authentication.",
          variant: "destructive",
        });
      }
    } catch {
      setSetupError("Could not reach DevLink. Check your connection and try again.");
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
    setSetupError(null);
  };

  const inputBase = cn(ui.control.field, "h-11 px-4 text-center text-lg tracking-widest");

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-11 rounded-lg border border-white/[0.08] bg-white/[0.035]" />
        <div className="h-11 w-32 rounded-lg border border-white/[0.08] bg-white/[0.055]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {statusError && (
        <div role="alert" className="rounded-xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/10 p-4 text-sm text-[var(--color-accent)]">
          <p>{statusError}</p>
          <Button onClick={fetchStatus} variant="secondary" className="mt-3 h-9 px-3">
            Retry status check
          </Button>
        </div>
      )}

      {setupError && (
        <div role="alert" className="rounded-xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/10 p-3 text-sm text-[var(--color-accent)]">
          {setupError}
        </div>
      )}

      {showSetup ? (
        <div className="space-y-6">
          {setupStep === "qr" && qrCode && (
            <>
              <div className={surface("panelMuted", "p-6")}>
                <p className="text-sm text-[var(--muted-foreground)] mb-4 text-center">
                  Scan this QR code with your authenticator app.
                </p>
                <div className="flex justify-center">
                  <div className="bg-white p-3 rounded-xl">
                    <img src={qrCode} alt="Two-factor setup QR code" className="w-48 h-48" />
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">
                    Manual setup code
                  </p>
                  <code className="rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-1 font-mono text-xs break-all">
                    {secret}
                  </code>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={cancelSetup} variant="secondary" className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={() => setSetupStep("verify")}
                  variant="gradient"
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </>
          )}

          {setupStep === "verify" && (
            <>
              <div className={surface("panelMuted", "p-6")}>
                <p className="text-sm text-[var(--muted-foreground)] mb-4 text-center">
                  Enter the 6-digit code from your authenticator app.
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
              <div className="flex flex-col gap-3 sm:flex-row">
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
                  Verify and enable
                </Button>
              </div>
            </>
          )}

          {setupStep === "recovery" && recoveryCodes.length > 0 && (
            <div className="bg-[rgba(var(--color-accent-2-rgb),0.10)] border border-[rgba(var(--color-accent-2-rgb),0.20)] rounded-xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-[var(--color-accent-2)] mt-0.5 flex-shrink-0"
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
                  <p className="text-sm text-[var(--color-accent-2)] font-medium">
                    Save your recovery codes
                  </p>
                  <p className="mt-1 text-xs text-[rgba(var(--color-accent-2-rgb),0.70)]">
                    These codes can be used to access your account if you lose your authenticator device.
                  </p>
                </div>
              </div>
              <div className="mb-4 rounded-lg border border-white/[0.08] bg-white/[0.035] p-4">
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {recoveryCodes.map((code, index) => (
                    <div key={index} className="text-white/80">
                      {code}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(recoveryCodes.join("\n"));
                    toast({
                      title: "Recovery codes copied",
                      description: "Recovery codes copied to clipboard.",
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
                  Finish
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
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={() => {
                setShowDisable(false);
                setDisableCode("");
                setSetupError(null);
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
              Disable two-factor
            </Button>
          </div>
        </div>
      ) : isEnabled ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-[rgba(var(--color-accent-2-rgb),0.20)] bg-[rgba(var(--color-accent-2-rgb),0.10)] p-4">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="text-[var(--color-accent-2)] flex-shrink-0"
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
              <p className="text-sm text-[var(--color-accent-2)] font-medium">
                Two-factor authentication is enabled
              </p>
              <p className="text-xs text-[rgba(var(--color-accent-2-rgb),0.70)]">
                Your account is protected with an authenticator app.
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowDisable(true)}
            variant="secondary"
            className="w-full border-[rgba(var(--color-accent-2-rgb),0.30)] hover:bg-[rgba(var(--color-accent-2-rgb),0.10)] text-[var(--color-accent-2)]"
          >
            Disable two-factor
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
            Enable two-factor
          </Button>
        </div>
      )}
    </div>
  );
}
