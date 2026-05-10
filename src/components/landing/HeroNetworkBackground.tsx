"use client";

export function HeroNetworkBackground() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden bg-[var(--color-background)] pointer-events-none">
            <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(var(--color-accent-2-rgb),0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--color-accent-2-rgb),0.08)_1px,transparent_1px)] [background-size:96px_96px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_30%,rgba(var(--color-accent-rgb),0.18),transparent_34%),radial-gradient(circle_at_78%_36%,rgba(var(--color-accent-2-rgb),0.12),transparent_36%),radial-gradient(circle_at_center,rgba(7,9,13,0.18)_0%,var(--color-background)_74%)] opacity-95" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,13,0.12),var(--color-background)_96%)]" />
        </div>
    );
}
