import Image from "next/image";
import { HTMLAttributes, memo } from "react";
import { cn } from "@/lib/cn";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  size?: number;
}

export const Avatar = memo(function Avatar({ src, alt = "", size = 36, className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full bg-[var(--muted)] border border-white/10",
        className
      )}
      style={{ width: size, height: size }}
      {...props}
    >
      {src ? (
        <Image 
          src={src} 
          alt={alt} 
          fill 
          sizes={`${size}px`} 
          className="object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full grid place-items-center text-xs text-[var(--muted-foreground)]">
          DL
        </div>
      )}
    </div>
  );
});
