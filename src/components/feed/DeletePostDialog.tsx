import { Button } from "@/components/ui/Button";

interface DeletePostDialogProps {
  onClose: () => void;
  onConfirm: () => void;
}

export function DeletePostDialog({ onClose, onConfirm }: DeletePostDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="relative overflow-hidden glass noise-overlay border border-white/10 rounded-xl p-6 w-[min(92vw,480px)] mx-4" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[var(--color-accent)]/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Delete Post</h3>
        </div>
        <p className="text-[var(--muted-foreground)] mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose} size="sm">
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} size="sm">
            Delete Post
          </Button>
        </div>
      </div>
    </div>
  );
}
