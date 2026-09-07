"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PlusCircle, Volume2, Music2 } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "หน้าแรก", href: "/", icon: Home },
    { label: "สำรวจจุดอ่านหนังสือ", href: "/#feed", icon: Compass },
    { label: "เพิ่มจุดใหม่", href: "/spots/new", icon: PlusCircle },
  ];

  const noiseFilters = [
    { label: "เงียบสงบ (Quiet)", href: "/?noiseLevel=quiet", color: "bg-cyan-400" },
    { label: "ปานกลาง (Moderate)", href: "/?noiseLevel=moderate", color: "bg-purple-400" },
    { label: "คึกคัก (Lively)", href: "/?noiseLevel=lively", color: "bg-pink-400" },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 pt-16 z-30 border-r border-indigo-950/70 bg-[#080b14]/75 backdrop-blur-xl">
      <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto">
        <div className="space-y-6">
          {/* Main Navigation */}
          <div>
            <p className="px-3 text-[11px] font-semibold text-indigo-400/60 uppercase tracking-wider mb-2">
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
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? "bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30 shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-[#11172e]/60"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Noise Categories Quick Links */}
          <div>
            <p className="px-3 text-[11px] font-semibold text-indigo-400/60 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Volume2 className="w-3 h-3 text-purple-400" />
              ระดับเสียงบรรยากาศ
            </p>
            <div className="space-y-1">
              {noiseFilters.map((nf) => (
                <Link
                  key={nf.href}
                  href={nf.href}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-[#11172e]/60 transition"
                >
                  <span className={`w-2 h-2 rounded-full ${nf.color}`} />
                  <span>{nf.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Brand Card with Logo Artwork */}
        <div className="rounded-2xl overflow-hidden border border-purple-500/20 bg-gradient-to-b from-[#11162d] to-[#0d1020] text-xs shadow-lg">
          <div className="h-24 w-full relative overflow-hidden">
            <img
              src="/logo.png"
              alt="LhobMoom Sound Ambient Art"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1020] via-transparent to-transparent" />
          </div>
          <div className="p-3 pt-1">
            <div className="flex items-center gap-1.5 text-purple-300 font-semibold mb-1 text-[11px]">
              <Music2 className="w-3.5 h-3.5 text-pink-400" />
              <span>Spatial Soundscape</span>
            </div>
            <p className="text-indigo-300/60 text-[10px] leading-relaxed">
              ฟังเสียงบรรยากาศจริงก่อนเดินทาง เพื่อค้นพบมุมอ่านหนังสือที่ดีที่สุด
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
