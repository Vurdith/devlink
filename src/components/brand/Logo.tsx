import Image from "next/image";

export function Logo({ size = 24 }: { size?: number }) {
  return (
    <div className="inline-flex items-center gap-2">
      <Image
        src="/logo/logo.png"
        alt="DevLink"
        width={size}
        height={size}
        className="object-contain"
        priority
      />
      <span className="text-[var(--foreground)] font-semibold tracking-tight text-glow">DevLink</span>
    </div>
  );
}


