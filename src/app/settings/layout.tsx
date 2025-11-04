import type { ReactNode } from "react";
import SettingsNav from "./_components/SettingsNav";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <div className="relative">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-blue-500/5 to-purple-500/10 rounded-2xl blur-xl"></div>
            
            {/* Navigation card */}
            <div className="relative glass rounded-2xl p-6 border-2 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 h-max">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-purple-300">
                    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-white">Settings</h2>
              </div>
              <SettingsNav />
            </div>
          </div>
        </aside>
        <section className="md:col-span-3 space-y-8">
          {children}
        </section>
      </div>
    </main>
  );
}


