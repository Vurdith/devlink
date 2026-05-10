import { Button } from "@/components/ui/Button";
import { iconBox, surface } from "@/components/ui/design-system";

interface DeletePostDialogProps {
  onClose: () => void;
  onConfirm: () => void;
}

export function DeletePostDialog({ onClose, onConfirm }: DeletePostDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-3 backdrop-blur-sm sm:items-center" onClick={onClose} role="presentation">
      <div className={surface("panelStrong", "noise-overlay relative mx-4 w-[min(92vw,480px)] overflow-hidden p-6")} onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className={iconBox("danger", "h-10 w-10")}>
            <svg className="w-5 h-5 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Delete post</h3>
        </div>
        <p className="mb-6 text-sm leading-6 text-[var(--muted-foreground)]">This removes the post and its activity from DevLink. You cannot undo it.</p>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose} size="sm">
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} size="sm">
            Delete post
          </Button>
        </div>
      </div>
    </div>
  );
}
