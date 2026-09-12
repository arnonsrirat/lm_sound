import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/context/AudioContext";
import AudioPlayerBar from "@/components/AudioPlayerBar";
import { getSiteSettings } from "@/lib/site-settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `${settings.siteName} - Ambient Soundscapes & Relaxation`,
    description: settings.bannerSubtitle,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ธีมเทศกาลที่แอดมินตั้งไว้ (สลับชุดสีทั้งเว็บ) — fallback เป็น default ถ้า DB ไม่พร้อม
  const settings = await getSiteSettings();
  const festivalClass =
    settings.festivalTheme !== "default" ? `festival-${settings.festivalTheme}` : "";

  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark ${festivalClass}`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-purple-500/30 selection:text-purple-200 transition-colors">
        <AudioProvider>
          <div className="flex-1 flex flex-col">{children}</div>
          <AudioPlayerBar />
        </AudioProvider>
      </body>
    </html>
  );
}
