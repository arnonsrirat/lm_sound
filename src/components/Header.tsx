"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Headphones, Moon, Sun, User as UserIcon, PlusCircle } from "lucide-react";

export default function Header({
  currentUser,
}: {
  currentUser?: { userId: string; username: string } | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [isDark, setIsDark] = useState(true);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    } else {
      params.delete("search");
    }
    router.push(`/?${params.toString()}`);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    // In current dark-first design, this can toggle document element class
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto gap-4">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition">
            <Headphones className="w-5 h-5 text-slate-950" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-slate-100 tracking-tight group-hover:text-emerald-400 transition">
              หลบมุม <span className="text-emerald-400 font-extrabold">Sound</span>
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest hidden sm:block">
              Campus Secret Study Spots
            </span>
          </div>
        </Link>

        {/* Center: Search Bar (Desktop & Mobile) */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-md mx-2 relative"
        >
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาจุดอ่านหนังสือ, ตึก, โซน..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-full text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition"
            />
          </div>
        </form>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Add Spot Button */}
          <Link
            href="/spots/new"
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>เพิ่มจุดใหม่</span>
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            type="button"
            aria-label="เปลี่ยนธีม"
            className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-slate-700 transition"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User / Login */}
          {currentUser ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px]">
                {currentUser.username[0]?.toUpperCase() || "U"}
              </div>
              <span className="font-medium hidden sm:inline">{currentUser.username}</span>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition shadow-md shadow-emerald-500/20"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>เข้าสู่ระบบ</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
