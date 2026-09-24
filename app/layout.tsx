import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono, Shantell_Sans } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

const shantellSans = Shantell_Sans({
  subsets: ["latin"],
  variable: "--font-hand",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Engineering Judgment — Architecture Under Pressure",
    template: "%s | Engineering Judgment",
  },
  description:
    "Real-world bottlenecks, failure modes, and architecture trade-offs for backend and distributed systems engineers — explained in an engineering notebook style.",
  openGraph: {
    title: "Engineering Judgment — Architecture Under Pressure",
    description:
      "Real-world bottlenecks, failure modes, and architecture trade-offs — explained without the usual system-design fluff.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} ${shantellSans.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-paper text-ink font-sans antialiased" suppressHydrationWarning>
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
