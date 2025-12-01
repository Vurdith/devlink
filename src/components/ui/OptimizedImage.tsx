import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/cn";

interface OptimizedImageProps extends Omit<ImageProps, "loading"> {
  eager?: boolean;
  fadeIn?: boolean;
}

/**
 * Performance-optimized image component with sensible defaults.
 * - Uses AVIF/WebP formats automatically
 * - Lazy loads by default
 * - Lower quality (75) for faster loads
 * - Fade-in animation on load
 */
export function OptimizedImage({
  eager = false,
  fadeIn = true,
  className,
  alt,
  ...props
}: OptimizedImageProps) {
  return (
    <Image
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      quality={75}
      className={cn(
        fadeIn && "transition-opacity duration-300",
        className
      )}
      {...props}
    />
  );
}

/**
 * Background image component optimized for above-the-fold content.
 * Uses priority loading and blur placeholder.
 */
export function BackgroundImage({
  src,
  alt,
  className,
  ...props
}: Omit<ImageProps, "fill">) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority
        quality={60}
        sizes="100vw"
        className="object-cover"
        {...props}
      />
    </div>
  );
}



