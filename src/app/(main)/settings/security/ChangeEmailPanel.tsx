import { Button } from "@/components/ui/Button";
import { surface } from "@/components/ui/design-system";
import { SecurityPanel } from "./SecurityPanel";

export interface EmailData {
  newEmail: string;
  password: string;
}

interface ChangeEmailPanelProps {
  currentEmail?: string | null;
  hasPassword: boolean;
  emailData: EmailData;
  inputClassName: string;
  isChangingEmail: boolean;
  onEmailDataChange: (emailData: EmailData) => void;
  onEmailChange: (event: React.FormEvent) => void;
}

export function ChangeEmailPanel({
  currentEmail,
  hasPassword,
  emailData,
  inputClassName,
  isChangingEmail,
  onEmailDataChange,
  onEmailChange,
}: ChangeEmailPanelProps) {
  const normalizedCurrentEmail = currentEmail?.trim().toLowerCase();
  const normalizedNewEmail = emailData.newEmail.trim().toLowerCase();
  const isSameEmail = Boolean(normalizedCurrentEmail && normalizedNewEmail && normalizedCurrentEmail === normalizedNewEmail);
  const canSubmit = hasPassword && Boolean(emailData.newEmail.trim()) && Boolean(emailData.password) && !isSameEmail;

  return (
    <SecurityPanel
      accent="emerald"
      title="Change email"
      description="Update where you receive security and account emails."
      icon={
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" />
          <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" />
        </svg>
      }
      className="animate-slide-up"
      style={{ animationDelay: "0.15s" }}
    >
      <div className="space-y-4">
        {!hasPassword ? (
          <div className="rounded-xl border border-[rgba(var(--color-accent-2-rgb),0.25)] bg-[rgba(var(--color-accent-2-rgb),0.10)] p-4 text-sm text-[var(--color-accent-2)]">
            Set a password first, then return here to confirm sensitive email changes.
          </div>
        ) : null}

        <div>
          <label className="block text-sm font-medium text-white mb-2">Current Email</label>
          <div className={surface("empty", "flex h-11 w-full items-center px-4 text-[var(--muted-foreground)]")}>
            {currentEmail || "Loading..."}
          </div>
        </div>

        <form
          onSubmit={(event) => {
            if (!canSubmit) {
              event.preventDefault();
              return;
            }
            onEmailChange(event);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-white mb-2">New Email Address</label>
            <input
              type="email"
              className={inputClassName}
              placeholder="Enter new email"
              value={emailData.newEmail}
              onChange={(event) => onEmailDataChange({ ...emailData, newEmail: event.target.value })}
              autoComplete="off"
              disabled={!hasPassword}
              required
            />
            {isSameEmail ? <p className="mt-2 text-xs text-rose-200">Use an email that is different from your current address.</p> : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>
            <input
              type="password"
              className={inputClassName}
              placeholder="Enter your password"
              value={emailData.password}
              onChange={(event) => onEmailDataChange({ ...emailData, password: event.target.value })}
              autoComplete="off"
              disabled={!hasPassword}
              required
            />
          </div>

          <Button type="submit" variant="gradient" isLoading={isChangingEmail} disabled={!canSubmit} className="w-full">
            Send Verification Email
          </Button>
        </form>

        <p className="text-xs text-[var(--muted-foreground)] text-center">A verification email will be sent to your new address</p>
      </div>
    </SecurityPanel>
  );
}
