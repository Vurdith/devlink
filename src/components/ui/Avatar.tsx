import Image from "next/image";
import { HTMLAttributes, memo } from "react";
import { cn } from "@/lib/cn";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  size?: number;
}

export const Avatar = memo(function Avatar({ src, alt = "", size, className, ...props }: AvatarProps) {
  // If size is provided, use fixed sizing. Otherwise, use className for responsive sizing
  const sizeStyle = size ? { width: size, height: size } : undefined;
  
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full bg-[var(--muted)] border border-white/10",
        // Only add default size if no explicit size or className sizing is provided
        !size && !className?.includes('w-') && !className?.includes('h-') && "w-9 h-9",
        className
      )}
      style={sizeStyle}
      {...props}
    >
      {src ? (
        <Image 
          src={src} 
          alt={alt} 
          fill 
          sizes={size ? `${size}px` : "(max-width: 640px) 80px, 112px"} 
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
