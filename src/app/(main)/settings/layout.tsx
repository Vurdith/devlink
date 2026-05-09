"use client";

import type { ReactNode } from "react";
import { iconBox, surface } from "@/components/ui/design-system";
import SettingsNav from "./_components/SettingsNav";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <div className="grid gap-5 md:grid-cols-[280px_1fr] md:gap-8">
        {/* Sidebar */}
        <aside className="md:sticky md:top-24 md:h-fit">
          <div className="animate-slide-up">
            {/* Navigation card */}
            <div className={surface("panel", "noise-overlay relative overflow-hidden p-3 sm:p-5")}>
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.36)] to-transparent" />
              {/* Header */}
              <div className="mb-3 hidden items-center gap-3 border-b border-white/10 pb-4 sm:mb-6 sm:flex">
                <div className={iconBox("cyan", "h-10 w-10")}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div>
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-accent-2)]">Controls</div>
                  <h2 className="text-lg font-semibold text-white">Settings</h2>
                  <p className="text-xs text-[var(--muted-foreground)]">Manage your account</p>
                </div>
              </div>
              
              <SettingsNav />
            </div>
          </div>
        </aside>
        
        {/* Content */}
        <section className="min-w-0 space-y-6 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          {children}
        </section>
      </div>
    </main>
  );
}
