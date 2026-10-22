import type { Metadata } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ReadingProgress } from "@/components/ReadingProgress";
import { BackToTop } from "@/components/BackToTop";
import { siteConfig } from "@/data/site";
import { themeInitScript } from "@/data/theme";
import "./globals.css";
import "./theme.css";
import "./category-colors.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  title: {
    default: siteConfig.title,
    template: "%s | Engineering Judgment",
  },
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: siteConfig.title,
    description:
      "Real-world bottlenecks, failure modes, and architecture trade-offs — explained without the usual system-design fluff.",
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: siteConfig.name,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
    >
      <head><Script id="appearance-preference" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeInitScript }} /></head>
      <body id="top" className="min-h-screen flex flex-col bg-paper text-ink font-sans antialiased" suppressHydrationWarning>
        <ReadingProgress />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <BackToTop />
      </body>
    </html>
  );
}

