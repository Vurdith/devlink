import type { ReactNode } from "react";
import { MessagesSidebar } from "./_components/MessagesSidebar";

export default function MessagesLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative mx-auto max-w-6xl px-4 pb-24 pt-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(900px 320px at 15% 0%, rgba(var(--color-accent-rgb),0.14), transparent 60%), radial-gradient(900px 320px at 90% 0%, rgba(var(--color-accent-2-rgb),0.12), transparent 60%)",
        }}
      />
      <div className="relative mb-6 glass-soft border border-white/10 rounded-2xl p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Messages</h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-2">
              Keep conversations lightweight and focused.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[10px] text-white/60">
            <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">Inbox</span>
            <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">Requests</span>
          </div>
        </div>
      </div>

      <div className="relative grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
        <MessagesSidebar />
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
