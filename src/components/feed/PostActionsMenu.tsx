import { RefObject } from "react";
import { menuItem, menuPanel, ui } from "@/components/ui/design-system";
import { cn } from "@/lib/cn";

interface PostActionsMenuProps {
  postId: string;
  isOwnPost: boolean;
  isPinned?: boolean;
  isOpen: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  onToggle: () => void;
  onPin: () => void;
  onDelete: () => void;
}

export function PostActionsMenu({
  postId,
  isOwnPost,
  isPinned,
  isOpen,
  menuRef,
  onToggle,
  onPin,
  onDelete,
}: PostActionsMenuProps) {
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls="post-actions-menu"
        aria-label="Post actions"
        className={cn("group rounded-lg p-2 transition-all duration-200 active:scale-[0.98]", ui.control.icon)}
      >
        <svg className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {isOpen && (
        <div
          id="post-actions-menu"
          role="menu"
          aria-orientation="vertical"
          className={menuPanel("absolute right-0 top-full z-50 mt-2 w-52 animate-pop-in p-1")}
        >
          <div className="border-b border-white/[0.06] px-3 py-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">Post actions</div>
          </div>
          <div className="py-1">
            <a href={`/p/${postId}/analytics`} role="menuitem" className={menuItem("w-full text-left text-sm text-[var(--foreground)]")}>
              <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Analytics</span>
            </a>
            {isOwnPost && (
              <>
                <button onClick={onPin} role="menuitem" className={menuItem("w-full text-left text-sm text-[var(--foreground)]")}>
                  <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span>{isPinned ? "Unpin" : "Pin"}</span>
                </button>
                <button onClick={onDelete} role="menuitem" className={cn("w-full text-left text-sm text-rose-300", ui.menu.dangerItem)}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete</span>
                </button>
              </>
            )}
            <button role="menuitem" className={menuItem("w-full text-left text-sm text-amber-300/90 hover:bg-amber-500/10")}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>Report</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
