import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/context/AudioContext";
import AudioPlayerBar from "@/components/AudioPlayerBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LM Sound - Ambient Soundscapes & Relaxation",
  description:
    "แอปพลิเคชันเสียงบรรยากาศสำหรับสมาธิ การทำงาน และการพักผ่อน พร้อมระบบเสียง Persistent Web Audio และ Sound Mixer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 selection:bg-teal-500/30 selection:text-teal-200">
        <AudioProvider>
          <div className="flex-1 pb-24 flex flex-col">{children}</div>
          <AudioPlayerBar />
        </AudioProvider>
      </body>
    </html>
  );
}
