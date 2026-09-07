"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PlusCircle, Bookmark, Info, Sparkles, Volume2, Music2 } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "หน้าแรก", href: "/", icon: Home },
    { label: "สำรวจจุดอ่านหนังสือ", href: "/#feed", icon: Compass },
    { label: "เพิ่มจุดใหม่", href: "/spots/new", icon: PlusCircle },
  ];

  const noiseFilters = [
    { label: "เงียบสงบ (Quiet)", href: "/?noiseLevel=quiet", color: "bg-emerald-500" },
    { label: "ปานกลาง (Moderate)", href: "/?noiseLevel=moderate", color: "bg-amber-500" },
    { label: "คึกคัก (Lively)", href: "/?noiseLevel=lively", color: "bg-blue-500" },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 pt-16 z-30 border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-xl">
      <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto">
        <div className="space-y-6">
          {/* Main Navigation */}
          <div>
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
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
                        ? "bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30 shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/80"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Noise Categories Quick Links */}
          <div>
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Volume2 className="w-3 h-3 text-emerald-400" />
              ระดับเสียงบรรยากาศ
            </p>
            <div className="space-y-1">
              {noiseFilters.map((nf) => (
                <Link
                  key={nf.href}
                  href={nf.href}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 transition"
                >
                  <span className={`w-2 h-2 rounded-full ${nf.color}`} />
                  <span>{nf.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Ambient Sound Promo Card in Sidebar */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
            <Music2 className="w-4 h-4" />
            <span>Persistent Audio</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            ฟังเสียงบรรยากาศจริงเพื่อเช็คระดับความเงียบก่อนเดินทางไปนั่งอ่านหนังสือจริง
          </p>
        </div>
      </div>
    </aside>
  );
}
