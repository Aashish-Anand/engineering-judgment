import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";
import { topicCatalog } from "@/data/topics/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.url,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...topicCatalog.flatMap((topic) => [{
      url: `${siteConfig.url}${topic.href}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }, {
      url: `${siteConfig.url}${topic.href}/quiz`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }]),
  ];
}
