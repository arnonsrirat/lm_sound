import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/context/AudioContext";
import AudioPlayerBar from "@/components/AudioPlayerBar";
import AmbientAura from "@/components/AmbientAura";
import { getSiteSettings } from "@/lib/site-settings";
import ToastViewport from "@/components/ToastViewport";
import InstallAppPrompt from "@/components/InstallAppPrompt";
import FaviconSync from "@/components/FaviconSync";
import SitePreloader from "@/components/SitePreloader";

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
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: settings.siteName || "LMSound",
    },
    formatDetection: {
      telephone: false,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ธีมเทศกาลที่แอดมินตั้งไว้ (สลับชุดสีทั้งเว็บ) — fallback เป็น default ถ้า DB ไม่พร้อม
  const settings = await getSiteSettings();
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const minute = now.getHours() * 60 + now.getMinutes();
  const toMinute = (value: string) => { const [hours, minutes] = value.split(":").map(Number); return (hours || 0) * 60 + (minutes || 0); };
  const hasDateWindow = Boolean(settings.festivalStartDate && settings.festivalEndDate);
  const inDateWindow = !hasDateWindow || (day >= settings.festivalStartDate && day <= settings.festivalEndDate);
  const inTimeWindow = !hasDateWindow || (toMinute(settings.festivalStartTime) <= toMinute(settings.festivalEndTime) ? minute >= toMinute(settings.festivalStartTime) && minute <= toMinute(settings.festivalEndTime) : minute >= toMinute(settings.festivalStartTime) || minute <= toMinute(settings.festivalEndTime));
  const activeFestivalTheme = inDateWindow && inTimeWindow ? settings.festivalTheme : "default";
  const festivalClass =
    activeFestivalTheme !== "default" ? `festival-${activeFestivalTheme}` : "";

  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased light ${festivalClass}`}
      style={{
        ["--theme-bg-light" as string]: `url(${settings.bgLight || "/dreamy-lake-bg.png"})`,
        ["--theme-primary" as string]: settings.primaryColor || "#8b5cf6",
        ["--theme-accent" as string]: settings.accentColor || "#0284c7",
        ["--theme-surface" as string]: settings.surfaceColor || "#ffffff",
        ["--theme-background" as string]: settings.backgroundColor || "#fbf9ff",
        ["--theme-foreground" as string]: settings.foregroundColor || "#1f1035",
      }}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-purple-500/30 selection:text-purple-200 transition-colors relative">
        <AudioProvider>
          <SitePreloader />
          <AmbientAura />
          <ToastViewport />
          <InstallAppPrompt />
          <FaviconSync light={settings.logoLight} dark={settings.logoDark} />
          <div className="lmsound-page-shell flex-1 flex flex-col relative z-0">{children}</div>
          <AudioPlayerBar />
        </AudioProvider>
      </body>
    </html>
  );
}
