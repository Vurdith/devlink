import type { ReactNode } from "react";
import { MessagesSidebar } from "./_components/MessagesSidebar";

export default function MessagesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-0px)] md:h-screen overflow-hidden -m-4 md:-m-6 -mt-16 md:-mt-6">
      {/* Conversation list panel */}
      <MessagesSidebar />

      {/* Chat area */}
      <div className="flex-1 min-w-0 flex flex-col border-r border-white/[0.06]">
        {children}
      </div>
    </div>
  );
}
