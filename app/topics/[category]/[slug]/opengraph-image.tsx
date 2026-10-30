import { renderTopicCard, socialImageSize, socialImageType } from "@/components/og/SocialCard";
import { getTopicStaticParams } from "@/data/topics/catalog";

export const alt = "Engineering Judgment production blueprint";
export const size = socialImageSize;
export const contentType = socialImageType;
export const dynamicParams = false;

export function generateStaticParams() {
  return getTopicStaticParams();
}

export default function Image({ params }: { params: Promise<{ category: string; slug: string }> }) {
  return renderTopicCard(params);
}
