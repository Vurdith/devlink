import Image from "next/image";
import { HTMLAttributes, memo } from "react";
import { cn } from "@/lib/cn";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  size?: number;
  priority?: boolean;
}

// Check if URL is a blob (local preview) - these can't use next/image optimization
function isBlobUrl(url: string | null | undefined): boolean {
  return !!url && url.startsWith('blob:');
}

export const Avatar = memo(function Avatar({ src, alt = "", size, className, priority = false, ...props }: AvatarProps) {
  // If size is provided, use fixed sizing. Otherwise, use className for responsive sizing
  const sizeStyle = size ? { width: size, height: size } : undefined;
  const isBlob = isBlobUrl(src);
  
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
        // Use regular img for blob URLs (instant local preview), next/image for remote URLs
        isBlob ? (
          <img 
            src={src} 
            alt={alt} 
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <Image 
            src={src} 
            alt={alt} 
            fill 
            sizes={size ? `${size}px` : "(max-width: 640px) 48px, 64px"} 
            className="object-cover"
            loading={priority ? "eager" : "lazy"}
            priority={priority}
            quality={75}
          />
        )
      ) : (
        <div className="w-full h-full grid place-items-center text-xs text-[var(--muted-foreground)]">
          DL
        </div>
      )}
    </div>
  );
});
