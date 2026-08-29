import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://rootx.fun",
      lastModified: "2026-08-27",
    },
  ];
}