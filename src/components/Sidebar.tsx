"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, Flame, PlusCircle, Volume2, Music2, Sliders, ShieldCheck } from "lucide-react";
import { useAudio } from "@/context/AudioContext";

export default function Sidebar({ logoDark, role }: { logoDark?: string; role?: "USER" | "ADMIN" }) {
  const pathname = usePathname();
  const { setIsMixerOpen, setIsNowPlayingOpen, isPlaying } = useAudio();

  const navItems = [
    { label: "Home (หน้าแรก)", href: "/", icon: Home },
    { label: "เสียงแนะนำ", href: "/#recommended", icon: Sparkles },
    { label: "เสียงยอดนิยม", href: "/#popular", icon: Flame },
    { label: "เพิ่มจุดใหม่", href: "/spots/new", icon: PlusCircle },
    ...(role === "ADMIN" ? [{ label: "จัดการระบบ (Admin)", href: "/admin", icon: ShieldCheck }] : []),
  ];

  const noiseFilters = [
    { label: "เงียบสงบ (Quiet)", href: "/?noiseLevel=quiet", color: "bg-purple-400" },
    { label: "ปานกลาง (Moderate)", href: "/?noiseLevel=moderate", color: "bg-fuchsia-400" },
    { label: "คึกคัก (Lively)", href: "/?noiseLevel=lively", color: "bg-cyan-400" },
  ];

  return (
    <aside className="hidden md:flex w-60 lg:w-64 flex-col fixed inset-y-0 left-0 pt-16 z-30 border-r border-purple-500/20 bg-[var(--sidebar-bg)] backdrop-blur-xl shadow-xl transition-colors">
      <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto">
        <div className="space-y-6">
          {/* Main Navigation - "nav bar ไว้ใส่หน้าต่างๆ" */}
          <div>
            <p className="px-3 text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-2">
              เมนูหลัก
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition ${
                      isActive
                        ? "bg-purple-600/25 text-purple-200 font-semibold border border-purple-500/40 shadow-sm"
                        : "text-purple-200/70 hover:text-white hover:bg-purple-600/15"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-purple-400" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Noise Categories Quick Links */}
          <div>
            <p className="px-3 text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-purple-400" />
              ระดับเสียงบรรยากาศ
            </p>
            <div className="space-y-1">
              {noiseFilters.map((nf) => (
                <Link
                  key={nf.href}
                  href={nf.href}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-purple-200/70 hover:text-white hover:bg-purple-600/15 transition"
                >
                  <span className={`w-2 h-2 rounded-full ${nf.color} shadow-sm`} />
                  <span>{nf.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Sound Mixer & Now Playing shortcuts */}
          <div className="pt-2 border-t border-purple-500/15 space-y-1.5">
            <button
              onClick={() => setIsMixerOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-purple-200 bg-purple-950/30 hover:bg-purple-600/20 border border-purple-500/20 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                <span>Sound Mixer</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                Mix
              </span>
            </button>

            <button
              onClick={() => setIsNowPlayingOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-purple-200 bg-purple-950/30 hover:bg-purple-600/20 border border-purple-500/20 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Music2 className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>เวลา sound เล่น</span>
              </div>
              {isPlaying && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Brand Ambient Card */}
        <div className="rounded-2xl overflow-hidden border border-purple-500/30 bg-gradient-to-b from-purple-950/40 to-[#0d071a] text-xs shadow-lg mt-4">
          <div className="h-20 w-full relative overflow-hidden">
            <img
              src={logoDark || "/logo.png"}
              alt="LM Sound Logo"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d071a] via-[#0d071a]/40 to-transparent" />
          </div>
          <div className="p-3 pt-1">
            <div className="flex items-center gap-1.5 text-purple-300 font-semibold mb-1 text-[11px]">
              <Music2 className="w-3.5 h-3.5 text-pink-400" />
              <span>Spatial Soundscape</span>
            </div>
            <p className="text-purple-300/60 text-[10px] leading-relaxed">
              ฟังเสียงบรรยากาศจริงก่อนเดินทาง เพื่อค้นพบมุมอ่านหนังสือที่ดีที่สุด
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
