import { neoAccents, renderSocialCard, socialImageSize, socialImageType } from "@/components/og/SocialCard";
import { topicCatalog } from "@/data/topics/catalog";

export const alt = "Engineering Judgment blueprint library";
export const size = socialImageSize;
export const contentType = socialImageType;

export default function Image() {
  return renderSocialCard({
    label: "LIBRARY",
    title: "Find your next engineering problem.",
    accent: neoAccents.yellow,
    footnote: `${topicCatalog.length} blueprints · search by symptom`,
  });
}
