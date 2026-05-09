import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/cn";

interface OptimizedImageProps extends Omit<ImageProps, "loading"> {
  eager?: boolean;
  fadeIn?: boolean;
}

export function OptimizedImage({
  eager = false,
  fadeIn = true,
  className,
  alt,
  fill,
  sizes,
  ...props
}: OptimizedImageProps) {
  return (
    <Image
      alt={alt}
      fill={fill}
      loading={eager ? "eager" : "lazy"}
      quality={75}
      sizes={sizes ?? (fill ? "100vw" : undefined)}
      className={cn(
        fadeIn && "transition-opacity duration-300",
        className
      )}
      {...props}
    />
  );
}

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



