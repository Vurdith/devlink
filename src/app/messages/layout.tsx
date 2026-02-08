import type { ReactNode } from "react";
import { MessagesSidebar } from "./_components/MessagesSidebar";

export default function MessagesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Fixed container — pinned between navbar, sidebar, and mobile nav */}
      <div className="fixed inset-0 top-16 bottom-16 md:bottom-0 md:left-72 z-30 flex overflow-hidden bg-[var(--color-bg,#0c0e14)]">
        {/* Conversation list panel */}
        <MessagesSidebar />

        {/* Chat area */}
        <div className="flex-1 min-w-0 flex flex-col border-r border-white/[0.06]">
          {children}
        </div>
      </div>

      {/* Spacer so AppShell content area doesn't collapse */}
      <div className="h-0" />
    </>
  );
}
