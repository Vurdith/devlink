import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://devlink.ink";
  
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/settings/", "/messages/", "/escrow/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
