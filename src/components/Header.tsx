"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Moon, Sun, User as UserIcon, PlusCircle, LogOut, ShieldCheck } from "lucide-react";

export interface HeaderSettings {
  logoLight: string;
  logoDark: string;
  siteName: string;
  siteTagline: string;
  role?: "USER" | "ADMIN";
}

export default function Header({
  currentUser,
  settings,
}: {
  currentUser?: { userId: string; username: string } | null;
  settings?: HeaderSettings;
}) {
  const logoLight = settings?.logoLight || "/logo.png";
  const logoDark = settings?.logoDark || "/logo.png";
  const siteName = settings?.siteName || "LM Sound";
  const siteTagline = settings?.siteTagline || "Spatial & Ambient Soundscape";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("lmsound-theme");
    if (savedTheme === "light") {
      setIsDark(false);
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  }, []);

  // สลับโลโก้ตามธีมสว่าง/มืด (แอดมินตั้งค่าแยกได้)
  useEffect(() => {
    document.querySelectorAll<HTMLImageElement>(".logo-theme-img").forEach((img) => {
      const light = img.dataset.logoLight;
      const dark = img.dataset.logoDark;
      if (light && dark) {
        img.src = isDark ? dark : light;
      }
    });
  }, [isDark, logoLight, logoDark]);

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
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      localStorage.setItem("lmsound-theme", "dark");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("lmsound-theme", "light");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-purple-500/20 bg-[var(--header-bg)] backdrop-blur-xl shadow-lg transition-colors">
      <div className="flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto gap-4">
        {/* Left: Brand Logo as in wireframe */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="relative w-10 h-10 rounded-2xl overflow-hidden shadow-lg shadow-purple-600/30 group-hover:scale-105 transition border border-purple-400/40 p-0.5 bg-gradient-to-tr from-purple-600 to-fuchsia-500">
            {/* โลโก้แยกตามธีมสว่าง/มืด (แอดมินตั้งได้) */}
            <img
              src="/logo.png"
              alt={`${siteName} Logo`}
              data-logo-light={logoLight}
              data-logo-dark={logoDark}
              className="w-full h-full object-cover rounded-[14px] logo-theme-img"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight purple-gradient-text group-hover:opacity-90 transition">
              {siteName}
            </span>
            <span className="text-[10px] text-purple-300/80 uppercase tracking-widest hidden sm:block font-medium">
              {siteTagline}
            </span>
          </div>
        </Link>

        {/* Center: Search Bar ("ค้นหา" as in wireframe) */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-md mx-2 relative"
        >
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-purple-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาเสียงบรรยากาศ, จุดอ่านหนังสือ, โซนเงียบ..."
              className="w-full pl-10 pr-4 py-2 bg-purple-950/25 border border-purple-500/25 rounded-full text-sm text-foreground placeholder:text-purple-300/50 focus:outline-none focus:border-purple-500/70 focus:ring-2 focus:ring-purple-500/20 transition shadow-inner"
            />
          </div>
        </form>

        {/* Right: Theme Toggle ("เปลี่ยนแนว สว่าง กับ ดาร์ก") & Login */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Add Spot Button */}
          <Link
            href="/spots/new"
            className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold purple-pill hover:bg-purple-600/20 transition shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>เพิ่มจุดใหม่</span>
          </Link>

          {/* Theme Toggle ("เปลี่ยนแนว สว่าง กับ ดาร์ก" as annotated in wireframe) */}
          <button
            onClick={toggleTheme}
            type="button"
            aria-label="เปลี่ยนแนว สว่าง กับ ดาร์ก"
            title={isDark ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดดาร์ก"}
            className="p-2 rounded-full bg-purple-950/30 border border-purple-500/30 text-purple-300 hover:text-white hover:border-purple-400 hover:bg-purple-600/20 transition shadow-sm cursor-pointer"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-300 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-purple-700 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* User / Login as annotated in wireframe */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              {settings?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/20 via-purple-600/30 to-fuchsia-600/20 text-amber-300 border border-amber-500/40 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-500/10 transition shadow-sm"
                  title="เข้าสู่แผงควบคุมแอดมิน"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">หลังบ้าน (Admin)</span>
                </Link>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold text-[10px]">
                  {currentUser.username[0]?.toUpperCase() || "U"}
                </div>
                <span className="font-medium hidden sm:inline">{currentUser.username}</span>
                {settings?.role === "ADMIN" && (
                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                    Admin
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-full text-purple-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                title="ออกจากระบบ"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold purple-gradient-btn transition"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
