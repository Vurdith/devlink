import type { ReactNode } from "react";
import { MessagesSidebar } from "./_components/MessagesSidebar";

export default function MessagesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="fixed inset-x-0 bottom-16 top-16 z-30 flex overflow-hidden bg-[radial-gradient(900px_420px_at_75%_0%,rgba(var(--color-accent-2-rgb),0.045),transparent_62%),var(--color-bg,#0c0e14)] md:bottom-0 md:left-72">
        <MessagesSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          {children}
        </div>
      </div>

      <div className="h-0" />
    </>
  );
}
