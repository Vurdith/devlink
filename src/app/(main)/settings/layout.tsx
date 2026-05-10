"use client";

import type { ReactNode } from "react";
import { Settings } from "lucide-react";
import { iconBox, surface } from "@/components/ui/design-system";
import SettingsNav from "./_components/SettingsNav";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-6xl min-w-0 overflow-x-clip px-4 py-5 sm:px-6 sm:py-8">
      <div className="grid min-w-0 gap-5 md:grid-cols-[280px_minmax(0,1fr)] md:gap-8">
        {/* Sidebar */}
        <aside className="min-w-0 md:sticky md:top-24 md:h-fit">
          <div className="min-w-0 animate-slide-up">
            <div className={surface("panel", "relative overflow-hidden p-3 sm:p-5")}>
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.08]" />
              <div className="mb-3 hidden items-center gap-3 border-b border-white/10 pb-4 sm:mb-6 sm:flex">
                <div className={iconBox("cyan", "h-10 w-10")}>
                  <Settings className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Settings</h2>
                  <p className="text-xs text-[var(--muted-foreground)]">Access, alerts, and privacy</p>
                </div>
              </div>
              
              <SettingsNav />
            </div>
          </div>
        </aside>
        
        {/* Content */}
        <section className="min-w-0 space-y-6 overflow-x-clip animate-slide-up" style={{ animationDelay: '0.05s' }}>
          {children}
        </section>
      </div>
    </main>
  );
}
