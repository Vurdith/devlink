import { Button } from "@/components/ui/Button";
import { SecurityPanel } from "./SecurityPanel";

interface ResetPasswordPanelProps {
  email?: string | null;
  isRequestingReset: boolean;
  onPasswordReset: () => void;
}

export function ResetPasswordPanel({ email, isRequestingReset, onPasswordReset }: ResetPasswordPanelProps) {
  return (
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
          Forgot your password? We&apos;ll send a secure reset link{email ? ` to ${email}` : " to your email address"}.
        </p>

        <Button onClick={onPasswordReset} variant="secondary" isLoading={isRequestingReset} disabled={!email} className="w-full">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" />
            <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" />
          </svg>
          Send Reset Email
        </Button>
      </div>
    </SecurityPanel>
  );
}
