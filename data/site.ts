const fallbackUrl = "http://localhost:3000";

export const siteConfig = {
  name: "Engineering Judgment",
  title: "Engineering Judgment — Architecture Under Pressure",
  description:
    "Real-world bottlenecks, failure modes, and architecture trade-offs for backend and distributed systems engineers — explained in an engineering notebook style.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? fallbackUrl).replace(/\/$/, ""),
};
