import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DatabaseMigrationArticle } from "@/components/articles/DatabaseMigrationArticle";
import { FlashSaleArticle } from "@/components/articles/FlashSaleArticle";

import * as dbArticle from "@/data/topics/safely-migrate-production-database";
import * as flashSaleArticle from "@/data/topics/survive-flash-sale";

const VALID_TOPICS: Record<string, Record<string, boolean>> = {
  database: { "safely-migrate-production-database": true },
  traffic: { "survive-flash-sale": true },
};

type PageProps = {
  params: Promise<{ category: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, slug } = await params;
  if (!VALID_TOPICS[category]?.[slug]) return {};

  if (slug === "survive-flash-sale") {
    return {
      title: `${flashSaleArticle.meta.title} | Architecture Under Pressure`,
      description: flashSaleArticle.meta.subtitle,
      openGraph: {
        title: flashSaleArticle.meta.title,
        description: flashSaleArticle.meta.subtitle,
        type: "article",
      },
    };
  }

  return {
    title: `${dbArticle.meta.title} | Architecture Under Pressure`,
    description: dbArticle.meta.subtitle,
    openGraph: {
      title: dbArticle.meta.title,
      description: dbArticle.meta.subtitle,
      type: "article",
    },
  };
}

export default async function TopicPage({ params }: PageProps) {
  const { category, slug } = await params;

  if (!VALID_TOPICS[category]?.[slug]) {
    notFound();
  }

  if (slug === "survive-flash-sale") {
    return <FlashSaleArticle />;
  }

  return <DatabaseMigrationArticle />;
}
