import { neoAccents, renderSocialCard, socialImageSize, socialImageType } from "@/components/og/SocialCard";
import { topicCatalog } from "@/data/topics/catalog";

export const alt = "Engineering Judgment: production architecture blueprints";
export const size = socialImageSize;
export const contentType = socialImageType;

export default function Image() {
  return renderSocialCard({
    label: "BLUEPRINTS",
    title: "Real bottlenecks, failure modes, and the trade-offs behind them.",
    accent: neoAccents.coral,
    footnote: `${topicCatalog.length} production blueprints`,
  });
}
