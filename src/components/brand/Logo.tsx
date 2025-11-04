export function Logo({ size = 24 }: { size?: number }) {
  return (
    <div className="inline-flex items-center gap-2">
      <img
        src="/logo/logo.png"
        alt="DevLink"
        width={size}
        height={size}
        className="object-contain"
      />
      <span className="text-[var(--foreground)] font-semibold tracking-tight text-glow">DevLink</span>
    </div>
  );
}


