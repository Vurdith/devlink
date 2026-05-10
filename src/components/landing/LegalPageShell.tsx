import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { surface } from "@/components/ui/design-system";

interface LegalPageShellProps {
  title: string;
  description: string;
  updatedAt: string;
  sections?: string[];
  children: ReactNode;
}

export function LegalPageShell({ title, description, updatedAt, sections = [], children }: LegalPageShellProps) {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[var(--background)] px-4 py-6 sm:px-6 sm:py-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 gradient-bg opacity-35" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid-pattern opacity-[0.08]" />

      <div className="relative mx-auto w-full max-w-4xl">
        <Link
          href="/"
          className="group mb-6 inline-flex h-10 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 text-sm font-medium text-white/70 outline-none transition-all hover:border-[rgba(var(--color-accent-2-rgb),0.24)] hover:bg-white/[0.065] hover:text-white focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.60)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to home
        </Link>

        <article className={surface("panel", "noise-overlay relative overflow-hidden p-5 sm:p-8 lg:p-10")}>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.46)] to-transparent" />
          <header className="mb-8 max-w-3xl border-b border-white/[0.08] pb-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-2)]">
              Legal
            </p>
            <h1 className="font-[var(--font-space-grotesk)] text-3xl font-bold tracking-normal text-white sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/62 sm:text-base">{description}</p>
            <p className="mt-4 inline-flex rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1 text-xs font-medium text-white/50">
              Last updated: {updatedAt}
            </p>
            {sections.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {sections.map((section) => (
                  <span
                    key={section}
                    className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1 text-xs font-semibold text-white/56"
                  >
                    {section}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="space-y-7 text-sm leading-7 text-white/64 sm:text-base sm:leading-8 [&_h2]:scroll-mt-24 [&_h2]:font-[var(--font-space-grotesk)] [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-normal [&_h2]:text-white [&_p]:leading-relaxed [&_strong]:font-semibold [&_strong]:text-white/88 [&_ul]:space-y-2 [&_ul]:pl-5 [&_li]:list-disc [&_li]:pl-1">
            {children}
          </div>
        </article>
      </div>
    </main>
  );
}
