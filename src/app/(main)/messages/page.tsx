"use client";

import { useSession } from "next-auth/react";
import { BriefcaseBusiness, MessageCircle, Search } from "lucide-react";
import { ActionLink } from "@/components/ui/ActionLink";
import { iconBox, surface } from "@/components/ui/design-system";

export default function MessagesPage() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.id;

  if (!isLoggedIn) return null;

  return (
    <div
      className="hidden h-full min-w-0 items-center justify-center bg-[radial-gradient(640px_360px_at_50%_8%,rgba(var(--color-accent-2-rgb),0.055),transparent_68%)] p-8 md:flex"
      aria-label="Messages overview"
    >
      <section className={surface("panel", "noise-overlay relative w-full max-w-xl overflow-hidden p-6 text-center")}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.42)] to-transparent" />
        <div className={iconBox("muted", "mx-auto h-14 w-14 text-white/55")}>
          <MessageCircle className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-white">Select a conversation</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--muted-foreground)]">
          Open a thread from the inbox, review requests, or find someone relevant to start a focused conversation.
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <ActionLink href="/discover" variant="secondary" size="md" leftIcon={<Search className="h-4 w-4" aria-hidden="true" />}>
            Find people
          </ActionLink>
          <ActionLink href="/jobs" variant="secondary" size="md" leftIcon={<BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />}>
            Browse jobs
          </ActionLink>
        </div>
      </section>
    </div>
  );
}
