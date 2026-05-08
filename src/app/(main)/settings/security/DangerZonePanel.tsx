import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { SecurityPanel } from "./SecurityPanel";

interface DangerZonePanelProps {
  hasPassword: boolean | null;
  showDeleteConfirm: boolean;
  deletePassword: string;
  deleteConfirmText: string;
  isDeleting: boolean;
  onShowDeleteConfirm: () => void;
  onCancelDelete: () => void;
  onDeletePasswordChange: (value: string) => void;
  onDeleteConfirmTextChange: (value: string) => void;
  onDeleteAccount: () => void;
}

export function DangerZonePanel({
  hasPassword,
  showDeleteConfirm,
  deletePassword,
  deleteConfirmText,
  isDeleting,
  onShowDeleteConfirm,
  onCancelDelete,
  onDeletePasswordChange,
  onDeleteConfirmTextChange,
  onDeleteAccount,
}: DangerZonePanelProps) {
  return (
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
            Once you delete your account, there is no going back. All your data, posts, followers, and everything associated with your account will be
            permanently removed.
          </p>

          <Button onClick={onShowDeleteConfirm} variant="secondary" className="w-full border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 text-red-500">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-2">
              <path
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Delete Account
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-red-500 mt-0.5 flex-shrink-0">
                <path
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div>
                <p className="text-sm text-red-500 font-medium">This action cannot be undone!</p>
                <p className="text-xs text-red-500/70 mt-1">All your posts, likes, followers, and profile data will be permanently deleted.</p>
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
                onChange={(event) => onDeletePasswordChange(event.target.value)}
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
                deleteConfirmText === "DELETE" ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-white/10 focus:border-red-500/50 focus:ring-red-500/50"
              )}
              placeholder="Type DELETE"
              value={deleteConfirmText}
              onChange={(event) => onDeleteConfirmTextChange(event.target.value.toUpperCase())}
              autoComplete="off"
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={onCancelDelete} variant="secondary" className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={onDeleteAccount}
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
  );
}
