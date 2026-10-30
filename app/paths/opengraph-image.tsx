import { neoAccents, renderSocialCard, socialImageSize, socialImageType } from "@/components/og/SocialCard";
import { learningPaths } from "@/data/learning-paths";

export const alt = "Engineering Judgment learning paths";
export const size = socialImageSize;
export const contentType = socialImageType;

export default function Image() {
  return renderSocialCard({
    label: "LEARNING PATHS",
    title: "Follow a path, not a pile of articles.",
    accent: neoAccents.mint,
    footnote: `${learningPaths.length} ordered tracks · core to advanced`,
  });
}
