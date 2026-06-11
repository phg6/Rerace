import type { Metadata, Viewport } from "next";
import { Geist, Zen_Dots } from "next/font/google";
import "../globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BottomTabs } from "@/components/BottomTabs";
import { AdSlot } from "@/components/AdSlot";
import { CommandMenu } from "@/components/CommandMenu";
import { PwaRegister } from "@/components/PwaRegister";
import { SITE } from "@/lib/site";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const zenDots = Zen_Dots({
  variable: "--font-zen",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Live Motorsport Streams, Replays & News`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "motorsport streams", "F1 live stream", "Formula 1 replays", "MotoGP live",
    "NASCAR stream", "IndyCar live", "WEC stream", "WRC live", "racing news",
  ],
  applicationName: SITE.name,
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — Live Motorsport Streams, Replays & News`,
    description: SITE.description,
    url: SITE.url,
  },
  twitter: {
    card: "summary_large_image",
    site: "@Rerace_",
  },
  robots: { index: true, follow: true },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SITE.name,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${zenDots.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Navbar adSlot={<AdSlot slotKey="mega-menu" />} />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
        <BottomTabs />
        <CommandMenu />
        <PwaRegister />
      </body>
    </html>
  );
}
