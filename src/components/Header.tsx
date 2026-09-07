"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Moon, Sun, User as UserIcon, PlusCircle, Sparkles } from "lucide-react";

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
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-indigo-950/70 bg-[#080b14]/85 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto gap-4">
        {/* Left: Brand Logo with official artwork */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-purple-900/30 group-hover:scale-105 transition border border-purple-500/30">
            <img
              src="/logo.png"
              alt="LhobMoom Sound Logo"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight twilight-text group-hover:opacity-90 transition">
              LhobMoom <span className="text-pink-400">Sound</span>
            </span>
            <span className="text-[10px] text-indigo-300/70 uppercase tracking-widest hidden sm:block">
              Spatial & Ambient Soundscape
            </span>
          </div>
        </Link>

        {/* Center: Search Bar (Desktop & Mobile) */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-md mx-2 relative"
        >
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-indigo-400/60 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาจุดอ่านหนังสือ, ตึก, โซนเงียบ..."
              className="w-full pl-10 pr-4 py-2 bg-[#0e1326]/90 border border-indigo-900/40 rounded-full text-sm text-slate-200 placeholder-indigo-300/40 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition"
            />
          </div>
        </form>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Add Spot Button */}
          <Link
            href="/spots/new"
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25 transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-cyan-400" />
            <span>เพิ่มจุดใหม่</span>
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            type="button"
            aria-label="เปลี่ยนธีม"
            className="p-2 rounded-full bg-[#0e1326] border border-indigo-900/50 text-indigo-300 hover:text-cyan-300 hover:border-indigo-700 transition"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User / Login */}
          {currentUser ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0e1326] border border-indigo-900/50 text-xs text-slate-300">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 text-white flex items-center justify-center font-bold text-[11px]">
                {currentUser.username[0]?.toUpperCase() || "U"}
              </div>
              <span className="font-medium hidden sm:inline">{currentUser.username}</span>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white twilight-gradient-btn transition shadow-md shadow-purple-900/30"
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
