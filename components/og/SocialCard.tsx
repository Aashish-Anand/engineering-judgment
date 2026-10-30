import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { siteConfig } from "@/data/site";
import { getTopicByRoute } from "@/data/topics/catalog";

/* Link-preview cards for X, Slack, and LinkedIn, rendered by the opengraph-image routes at build time. */

export const socialImageSize = { width: 1200, height: 630 };
export const socialImageType = "image/png";

const ink = "#20231f";
const paper = "#faf7ee";
const surface = "#fffdf7";
const grid = "#e6e3d6";
const muted = "#55594f";

/** The bright dark-mode accents from app/category-colors.css; they carry ink text on a cream card. */
export const categoryAccents: Record<string, string> = {
  DATA: "#86b2ff",
  CORRECTNESS: "#4ff0a0",
  TRAFFIC: "#ffc53d",
  MESSAGING: "#b99cff",
  RELIABILITY: "#3fe6d6",
  PERFORMANCE: "#9ba8ff",
  DEPLOYMENT: "#ff7eb0",
};

/** Neo palette swatches (components/Neo.module.css) for the non-article pages. */
export const neoAccents = { coral: "#ff805e", yellow: "#f5e974", mint: "#bfdfc5", lilac: "#cfc0ef" };

const fonts = Promise.all([
  readFile(join(process.cwd(), "assets/fonts/PlusJakartaSans-ExtraBold.ttf")),
  readFile(join(process.cwd(), "assets/fonts/JetBrainsMono-SemiBold.ttf")),
]);

type SocialCard = {
  /** Short uppercase label in the coloured band, e.g. the article category. */
  label: string;
  title: string;
  accent: string;
  /** Small mono line under the title, e.g. difficulty and reading time. */
  footnote: string;
};

/** Long titles step down so every catalog title fits in four lines. */
function titleSize(title: string) {
  if (title.length > 64) return 60;
  if (title.length > 44) return 68;
  return 84;
}

export async function renderSocialCard({ label, title, accent, footnote }: SocialCard) {
  const [jakarta, mono] = await fonts;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: "44px 58px 58px 44px",
          backgroundColor: paper,
          backgroundImage: `linear-gradient(${grid} 2px, transparent 2px), linear-gradient(90deg, ${grid} 2px, transparent 2px)`,
          backgroundSize: "42px 42px",
          fontFamily: "Jakarta",
          color: ink,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            border: `4px solid ${ink}`,
            backgroundColor: surface,
            boxShadow: `14px 14px 0 ${ink}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 32px",
              backgroundColor: accent,
              borderBottom: `4px solid ${ink}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 48,
                  height: 48,
                  backgroundColor: neoAccents.coral,
                  border: `3px solid ${ink}`,
                  boxShadow: `4px 4px 0 ${ink}`,
                  fontSize: 22,
                }}
              >
                EJ
              </div>
              <div style={{ fontSize: 26, letterSpacing: -0.5 }}>{siteConfig.name}</div>
            </div>
            <div
              style={{
                display: "flex",
                padding: "8px 16px",
                backgroundColor: ink,
                color: accent,
                fontFamily: "JetBrains Mono",
                fontSize: 22,
                letterSpacing: 2,
              }}
            >
              {label}
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 40px" }}>
            <div style={{ fontSize: titleSize(title), lineHeight: 1.08, letterSpacing: -2.5 }}>{title}</div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "18px 32px",
              borderTop: `3px solid ${ink}`,
              fontFamily: "JetBrains Mono",
              fontSize: 20,
              color: muted,
            }}
          >
            <div>{footnote}</div>
            <div>Architecture Under Pressure</div>
          </div>
        </div>
      </div>
    ),
    {
      ...socialImageSize,
      fonts: [
        { name: "Jakarta", data: jakarta, weight: 800, style: "normal" },
        { name: "JetBrains Mono", data: mono, weight: 600, style: "normal" },
      ],
    },
  );
}

/** The card for a blueprint, or its quiz when a label suffix is given. */
export async function renderTopicCard(params: Promise<{ category: string; slug: string }>, labelSuffix = "") {
  const { category, slug } = await params;
  const topic = getTopicByRoute(category, slug);
  if (!topic) notFound();
  const { meta } = topic;
  return renderSocialCard({
    label: meta.category + labelSuffix,
    title: meta.title,
    accent: categoryAccents[meta.category] ?? categoryAccents.DATA,
    footnote: `${meta.difficulty} · ${meta.readingTime}`,
  });
}
