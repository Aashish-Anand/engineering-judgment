import { neoAccents, renderSocialCard, socialImageSize, socialImageType } from "@/components/og/SocialCard";

export const alt = "Engineering Judgment spaced review";
export const size = socialImageSize;
export const contentType = socialImageType;

export default function Image() {
  return renderSocialCard({
    label: "SPACED REVIEW",
    title: "Revisit the decisions that matter.",
    accent: neoAccents.lilac,
    footnote: "Missed decisions return in 3 days",
  });
}
