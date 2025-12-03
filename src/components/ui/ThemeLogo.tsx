"use client";

import Image from "next/image";
import { useState } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { getDefaultLogoPath } from "@/lib/themes";

interface ThemeLogoProps {
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

/**
 * Theme-aware logo component that automatically switches
 * the logo image based on the current theme.
 * Falls back to default logo if themed version doesn't exist.
 */
export function ThemeLogo({ 
  width = 40, 
  height = 40, 
  className = "",
  priority = false 
}: ThemeLogoProps) {
  const { logoPath, theme } = useTheme();
  const [imgSrc, setImgSrc] = useState(logoPath);

  // Update src when theme changes
  if (imgSrc !== logoPath && !imgSrc.includes('logo.png')) {
    setImgSrc(logoPath);
  }

  return (
    <Image
      src={imgSrc}
      alt="DevLink"
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={() => setImgSrc(getDefaultLogoPath())}
      key={theme.id}
    />
  );
}

/**
 * Non-Next.js Image version for places where Image component causes issues
 * Falls back to default logo if themed version doesn't exist.
 */
export function ThemeLogoImg({ 
  className = "",
  style = {}
}: { 
  className?: string;
  style?: React.CSSProperties;
}) {
  const { logoPath } = useTheme();

  return (
    <img
      src={logoPath}
      alt="DevLink"
      className={className}
      style={style}
      onError={(e) => {
        (e.target as HTMLImageElement).src = getDefaultLogoPath();
      }}
    />
  );
}
