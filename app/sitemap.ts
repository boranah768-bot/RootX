import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://rootx.fun",
      lastModified: new Date(),
    },
  ];
}