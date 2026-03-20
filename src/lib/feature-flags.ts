type FeatureFlag = 
  | "ENABLE_MESSAGING"
  | "ENABLE_ESCROW"
  | "ENABLE_VERIFICATION"
  | "ENABLE_2FA"
  | "ENABLE_PWA"
  | "ENABLE_ANALYTICS"
  | "MAINTENANCE_MODE"
  | "NEW_FEED_ALGORITHM";

type FeatureFlagValue = boolean | string | number;

const defaultFlags: Record<FeatureFlag, FeatureFlagValue> = {
  ENABLE_MESSAGING: true,
  ENABLE_ESCROW: true,
  ENABLE_VERIFICATION: true,
  ENABLE_2FA: false,
  ENABLE_PWA: true,
  ENABLE_ANALYTICS: true,
  MAINTENANCE_MODE: false,
  NEW_FEED_ALGORITHM: false,
};

function parseEnvValue(value: string | undefined, defaultValue: FeatureFlagValue): FeatureFlagValue {
  if (value === undefined) return defaultValue;
  if (typeof defaultValue === "boolean") {
    return value === "true" || value === "1";
  }
  if (typeof defaultValue === "number") {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return value;
}

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  const envValue = process.env[`FEATURE_${flag}`];
  const value = parseEnvValue(envValue, defaultFlags[flag]);
  return Boolean(value);
}

export function getFeatureFlag(flag: FeatureFlag): FeatureFlagValue {
  const envValue = process.env[`FEATURE_${flag}`];
  return parseEnvValue(envValue, defaultFlags[flag]);
}

export function getAllFeatureFlags(): Record<FeatureFlag, FeatureFlagValue> {
  const flags: Record<string, FeatureFlagValue> = {};
  for (const [key, defaultValue] of Object.entries(defaultFlags)) {
    const envValue = process.env[`FEATURE_${key}`];
    flags[key] = parseEnvValue(envValue, defaultValue);
  }
  return flags as Record<FeatureFlag, FeatureFlagValue>;
}

export const featureFlags = {
  isMessagingEnabled: () => isFeatureEnabled("ENABLE_MESSAGING"),
  isEscrowEnabled: () => isFeatureEnabled("ENABLE_ESCROW"),
  isVerificationEnabled: () => isFeatureEnabled("ENABLE_VERIFICATION"),
  is2FAEnabled: () => isFeatureEnabled("ENABLE_2FA"),
  isPWAEnabled: () => isFeatureEnabled("ENABLE_PWA"),
  isAnalyticsEnabled: () => isFeatureEnabled("ENABLE_ANALYTICS"),
  isMaintenanceMode: () => isFeatureEnabled("MAINTENANCE_MODE"),
  useNewFeedAlgorithm: () => isFeatureEnabled("NEW_FEED_ALGORITHM"),
};
