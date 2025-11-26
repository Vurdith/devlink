export const PROFILE_TYPE_CONFIG = {
  DEVELOPER: { 
    label: "Developer", 
    color: "text-blue-400", 
    bgColor: "bg-blue-500/20",
    icon: "M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"
  },
  CLIENT: { 
    label: "Client", 
    color: "text-emerald-400", 
    bgColor: "bg-emerald-500/20",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
  },
  STUDIO: { 
    label: "Studio", 
    color: "text-purple-400", 
    bgColor: "bg-purple-500/20",
    icon: "M12 3L1 9l11 6 9-4.91V17h2V9L12 3z M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"
  },
  INFLUENCER: { 
    label: "Influencer", 
    color: "text-rose-400", 
    bgColor: "bg-rose-500/20",
    icon: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
  },
  INVESTOR: { 
    label: "Investor", 
    color: "text-amber-400", 
    bgColor: "bg-amber-500/20",
    icon: "M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"
  },
  GUEST: { 
    label: "Guest", 
    color: "text-gray-400", 
    bgColor: "bg-gray-500/20",
    icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
  }
};

export function getProfileTypeConfig(profileType: string) {
  return PROFILE_TYPE_CONFIG[profileType as keyof typeof PROFILE_TYPE_CONFIG] || {
    label: profileType,
    color: "text-gray-400",
    bgColor: "bg-gray-500/20",
    icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
  };
}

// Get the icon path for a profile type
export function getProfileTypeIcon(profileType: string): string {
  const config = getProfileTypeConfig(profileType);
  return config.icon;
}

// Reusable Profile Type Icon component
export function ProfileTypeIcon({ 
  profileType, 
  size = 12, 
  className = "" 
}: { 
  profileType: string; 
  size?: number; 
  className?: string;
}): JSX.Element {
  const iconPath = getProfileTypeIcon(profileType);
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      className={className}
    >
      <path d={iconPath} />
    </svg>
  );
}




