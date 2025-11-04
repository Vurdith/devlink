export const PROFILE_TYPE_CONFIG = {
  DEVELOPER: { label: "Developer", color: "text-blue-400", bgColor: "bg-blue-500/20" },
  CLIENT: { label: "Client", color: "text-green-400", bgColor: "bg-green-500/20" },
  STUDIO: { label: "Studio", color: "text-purple-400", bgColor: "bg-purple-500/20" },
  INFLUENCER: { label: "Influencer", color: "text-red-400", bgColor: "bg-red-500/20" },
  INVESTOR: { label: "Investor", color: "text-yellow-400", bgColor: "bg-yellow-500/20" },
  GUEST: { label: "Guest", color: "text-gray-400", bgColor: "bg-gray-500/20" }
};

export function getProfileTypeConfig(profileType: string) {
  return PROFILE_TYPE_CONFIG[profileType as keyof typeof PROFILE_TYPE_CONFIG] || {
    label: profileType,
    color: "text-gray-400",
    bgColor: "bg-gray-500/20"
  };
}
