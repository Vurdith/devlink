import { Button } from "@/components/ui/Button";
import { surface } from "@/components/ui/design-system";
import { SecurityPanel } from "./SecurityPanel";

export interface EmailData {
  newEmail: string;
  password: string;
}

interface ChangeEmailPanelProps {
  currentEmail?: string | null;
  emailData: EmailData;
  inputClassName: string;
  isChangingEmail: boolean;
  onEmailDataChange: (emailData: EmailData) => void;
  onEmailChange: (event: React.FormEvent) => void;
}

export function ChangeEmailPanel({
  currentEmail,
  emailData,
  inputClassName,
  isChangingEmail,
  onEmailDataChange,
  onEmailChange,
}: ChangeEmailPanelProps) {
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
        <div>
          <label className="block text-sm font-medium text-white mb-2">Current Email</label>
          <div className={surface("empty", "flex h-11 w-full items-center px-4 text-[var(--muted-foreground)]")}>
            {currentEmail || "Loading..."}
          </div>
        </div>

        <form onSubmit={onEmailChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">New Email Address</label>
            <input
              type="email"
              className={inputClassName}
              placeholder="Enter new email"
              value={emailData.newEmail}
              onChange={(event) => onEmailDataChange({ ...emailData, newEmail: event.target.value })}
              autoComplete="off"
              required
            />
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
              required
            />
          </div>

          <Button type="submit" variant="gradient" isLoading={isChangingEmail} className="w-full">
            Send Verification Email
          </Button>
        </form>

        <p className="text-xs text-[var(--muted-foreground)] text-center">A verification email will be sent to your new address</p>
      </div>
    </SecurityPanel>
  );
}
