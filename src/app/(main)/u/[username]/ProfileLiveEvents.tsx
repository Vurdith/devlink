"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    __devlink_profile_live_hook?: boolean;
  }
}

function clearProfileCaches() {
  try {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("navbar-profile-")) {
        sessionStorage.removeItem(key);
      }
    });
  } catch {
    // sessionStorage can be unavailable in private browsing or embedded contexts.
  }
}

export function ProfileLiveEvents() {
  useEffect(() => {
    if (window.__devlink_profile_live_hook) return;
    window.__devlink_profile_live_hook = true;

    const handleProfileUpdated = () => {
      clearProfileCaches();
    };

    const handleFollowToggled = () => {
      clearProfileCaches();
      window.location.reload();
    };

    window.addEventListener("devlink:profile-updated", handleProfileUpdated);
    window.addEventListener("devlink:follow-toggled", handleFollowToggled);

    return () => {
      window.removeEventListener("devlink:profile-updated", handleProfileUpdated);
      window.removeEventListener("devlink:follow-toggled", handleFollowToggled);
      window.__devlink_profile_live_hook = false;
    };
  }, []);

  return null;
}
