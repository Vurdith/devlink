import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth";

export interface RobloxProfile {
  sub: string;
  name: string;
  nickname: string;
  picture: string;
  updated_at: string;
}

export default function Roblox<P extends RobloxProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "roblox",
    name: "Roblox",
    type: "oauth",
    authorization: {
      url: "https://authorize.roblox.com/v1/authorize",
      params: {
        scope: "openid profile",
        response_type: "code",
      },
    },
    token: "https://apis.roblox.com/oauth/v1/token",
    userinfo: "https://apis.roblox.com/oauth/v1/userinfo",
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name,
        email: "", // Roblox doesn't provide email
        image: profile.picture,
      };
    },
    options,
  };
}








