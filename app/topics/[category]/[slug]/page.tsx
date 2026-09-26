import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articleComponents } from "@/components/articles/registry";
import { getTopicByRoute, getTopicStaticParams } from "@/data/topics/catalog";

type PageProps = {
  params: Promise<{ category: string; slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getTopicStaticParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const topic = getTopicByRoute(category, slug);
  if (!topic) return {};

  return {
    title: topic.meta.title,
    description: topic.meta.subtitle,
    alternates: { canonical: topic.href },
    openGraph: {
      title: topic.meta.title,
      description: topic.meta.subtitle,
      type: "article",
      url: topic.href,
    },
  };
}

export default async function TopicPage({ params }: PageProps) {
  const { category, slug } = await params;
  const topic = getTopicByRoute(category, slug);

  if (!topic) {
    notFound();
  }

  const Article = articleComponents[topic.id];
  return <Article />;
}
