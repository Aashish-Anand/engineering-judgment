// Vercel sets VERCEL_PROJECT_PRODUCTION_URL at build time; without it, canonical and og:image URLs would point at localhost.
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const fallbackUrl = vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000";

export const siteConfig = {
  name: "Engineering Judgment",
  title: "Engineering Judgment — Architecture Under Pressure",
  description:
    "Real-world bottlenecks, failure modes, and architecture trade-offs for backend and distributed systems engineers — explained in an engineering notebook style.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? fallbackUrl).replace(/\/$/, ""),
};

type PageSocial = { title: string; description: string; path: string; type?: "website" | "article" };

/** Open Graph and Twitter fields for one route. A page's openGraph replaces the layout's, so the shared fields repeat here; the image comes from the nearest opengraph-image file. */
export function socialMetadata({ title, description, path, type = "website" }: PageSocial) {
  return {
    alternates: { canonical: path },
    openGraph: { title, description, type, url: path, siteName: siteConfig.name, locale: "en_US" },
    twitter: { card: "summary_large_image" as const, title, description },
  };
}
