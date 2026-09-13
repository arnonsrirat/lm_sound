"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";

export default function Sidebar({ logoDark }: { logoDark?: string; role?: "USER" | "ADMIN" }) {
  const pathname = usePathname();
  return <aside className="hidden md:flex w-60 lg:w-64 flex-col fixed inset-y-0 left-0 pt-16 z-30 border-r border-purple-500/20 bg-[var(--sidebar-bg)] backdrop-blur-xl shadow-xl">
    <div className="flex-1 p-4">
      <p className="px-3 text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-2">เมนูหลัก</p>
      <Link href="/" className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition cursor-pointer ${pathname === "/" ? "bg-purple-600/25 text-purple-100 border border-purple-500/40" : "text-purple-200/70 hover:bg-purple-600/15"}`}>
        <Home className="w-4 h-4 text-purple-400" /><span>Home (หน้าหลัก)</span>
      </Link>
    </div>
    <div className="m-4 rounded-2xl overflow-hidden border border-purple-500/30 bg-gradient-to-b from-purple-950/40 to-[#0d071a] text-xs">
      <img src={logoDark || "/logo.png"} alt="LM Sound" className="h-20 w-full object-cover" />
      <div className="p-3"><p className="text-purple-300 font-semibold">Spatial Soundscape</p><p className="text-purple-300/60 mt-1">เสียงบรรยากาศสำหรับการอ่านหนังสือ</p></div>
    </div>
  </aside>;
}
