"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
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

  // Update src when theme changes - always try the new themed logo
  useEffect(() => {
    setImgSrc(logoPath);
  }, [logoPath]);

  const handleError = () => {
    if (imgSrc !== getDefaultLogoPath()) {
      setImgSrc(getDefaultLogoPath());
    }
  };

  return (
    <Image
      src={imgSrc}
      alt="DevLink"
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={handleError}
      key={`${theme.id}-${imgSrc}`}
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
