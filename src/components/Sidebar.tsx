"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Headphones, Home } from "lucide-react";
import CampusMiniMap from "./CampusMiniMap";
import type { CampusMapSpot } from "./CampusMapInner";

export default function Sidebar({
  logoLight,
  logoDark,
  role,
  spots = [],
}: {
  logoLight?: string;
  logoDark?: string;
  role?: "USER" | "ADMIN";
  spots?: CampusMapSpot[];
}) {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  useEffect(() => { const update = () => setIsDark(document.documentElement.classList.contains("dark")); update(); const observer = new MutationObserver(update); observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] }); return () => observer.disconnect(); }, []);
  return (
    <aside className="hidden md:flex w-60 lg:w-64 flex-col fixed inset-y-0 left-0 pt-16 z-30 border-r border-purple-500/20 bg-[var(--sidebar-bg)] backdrop-blur-xl shadow-xl">
      <div className="flex-1 p-3 overflow-y-auto scrollbar-none space-y-4">
        <div>
          <p className="px-3 text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-2">
            เมนูหลัก
          </p>
          <Link
            href="/"
            className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition cursor-pointer ${
              pathname === "/"
                ? "bg-purple-600/25 text-purple-100 border border-purple-500/40 shadow-sm"
                : "text-purple-200/70 hover:bg-purple-600/15"
            }`}
          >
            <Home className="w-4 h-4 text-purple-400" />
            <span>Home (หน้าหลัก)</span>
          </Link>
          <Link
            href="/relaxation"
            className={`mt-2 flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition cursor-pointer ${
              pathname === "/relaxation"
                ? "bg-purple-600/25 text-purple-100 border border-purple-500/40 shadow-sm"
                : "text-purple-200/70 hover:bg-purple-600/15"
            }`}
          >
            <Headphones className="w-4 h-4 text-fuchsia-400" />
            <span>เพลงผ่อนคลาย</span>
          </Link>
        </div>

        {/* แผนที่วิทยาเขต (Interactive Mini Campus Map) */}
        <div>
          <p className="px-3 text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-1">
            สำรวจวิทยาเขต
          </p>
          <CampusMiniMap spots={spots} />
        </div>
      </div>

      <div className="m-3 rounded-2xl overflow-hidden border border-purple-500/30 bg-gradient-to-b from-purple-950/40 to-[#0d071a] text-xs">
        <img
          src={isDark ? (logoDark || "/logo.png") : (logoLight || "/logo.png")}
          alt="LM Sound"
          className="h-16 w-full object-cover"
        />
        <div className="p-2.5">
          <p className="text-purple-300 font-semibold">Spatial Soundscape</p>
          <p className="text-purple-300/60 text-[11px] mt-0.5">
            เสียงบรรยากาศสำหรับการอ่านหนังสือ
          </p>
        </div>
      </div>
    </aside>
  );
}

