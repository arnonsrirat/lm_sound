"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Moon, Sun, User as UserIcon, PlusCircle, LogOut, ShieldCheck, MapPin, Play, X, Flame } from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import StudyStatsModal from "@/components/StudyStatsModal";
import { getOptimizedImageUrl } from "@/lib/media-url";

export interface HeaderSettings {
  logoLight: string;
  logoDark: string;
  siteName: string;
  siteTagline: string;
  role?: "USER" | "ADMIN";
}

interface AutocompleteSpot {
  id: string;
  title: string;
  location: string;
  noiseLevel: string;
  imageUrl?: string;
  audioUrl?: string;
  description?: string;
}

export default function Header({
  currentUser,
  settings,
}: {
  currentUser?: { userId: string; username: string } | null;
  settings?: HeaderSettings;
}) {
  const logoLight = settings?.logoLight || "/logo-light.png";
  const logoDark = settings?.logoDark || "/logo.png";
  const siteName = settings?.siteName || "LM Sound";
  const siteTagline = settings?.siteTagline || "Spatial & Ambient Soundscape";
  const router = useRouter();
  const searchParams = useSearchParams();
  const { playSpot, studyStats, isStatsModalOpen, setIsStatsModalOpen } = useAudio();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [isDark, setIsDark] = useState(false);
  const [searchResults, setSearchResults] = useState<AutocompleteSpot[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("lmsound-theme");
    const nextIsDark = savedTheme === "dark";
    if (!nextIsDark) {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
    requestAnimationFrame(() => setIsDark(nextIsDark));
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

  // ปิด Dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Instant Autocomplete Search Fetcher with Debounce
  useEffect(() => {
    const query = searchTerm.trim();
    if (!query) {
      setSearchResults([]);
      setIsSearching(false);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/spots?search=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults((data.spots || []).slice(0, 5));
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    } else {
      params.delete("search");
    }
    router.push(`/?${params.toString()}`);
  };

  const handleSelectResult = (spot: AutocompleteSpot) => {
    setShowDropdown(false);
    router.push(`/spots/${spot.id}`);
  };

  const handleQuickPlay = (e: React.MouseEvent, spot: AutocompleteSpot) => {
    e.stopPropagation();
    setShowDropdown(false);
    playSpot({
      id: spot.id,
      title: spot.title,
      subtitle: spot.description || spot.location,
      category: spot.noiseLevel,
      imageUrl: spot.imageUrl,
      audioUrl: spot.audioUrl,
      location: spot.location,
    });
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
      <div className="flex h-16 items-center justify-between px-2 sm:px-6 md:px-8 max-w-7xl mx-auto gap-1.5 sm:gap-4 min-w-0">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0 group">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl overflow-hidden shadow-lg shadow-purple-600/30 group-hover:scale-105 transition border border-purple-400/40 p-0.5 bg-gradient-to-tr from-purple-600 to-fuchsia-500">
            <img
              src={isDark ? logoDark : logoLight}
              alt={`${siteName} Logo`}
              data-logo-light={logoLight}
              data-logo-dark={logoDark}
              className="w-full h-full object-cover rounded-[14px] logo-theme-img"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold text-sm sm:text-lg tracking-tight purple-gradient-text group-hover:opacity-90 transition truncate max-w-[76px] sm:max-w-none">
              {siteName}
            </span>
            <span className="text-[10px] text-purple-300/80 uppercase tracking-widest hidden lg:block font-medium">
              {siteTagline}
            </span>
          </div>
        </Link>

        {/* Center: Search Bar with Instant Autocomplete Dropdown */}
        <div
          ref={searchContainerRef}
          className="flex-1 min-w-0 max-w-[170px] xs:max-w-[240px] sm:max-w-md mx-1 sm:mx-2 relative"
        >
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="absolute left-3 w-3.5 sm:w-4 h-3.5 sm:h-4 text-purple-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                if (searchTerm.trim()) setShowDropdown(true);
              }}
              placeholder="ค้นหาจุดอ่านหนังสือ..."
              className="w-full pl-8 sm:pl-10 pr-7 sm:pr-8 py-1.5 sm:py-2 bg-purple-950/25 border border-purple-500/25 rounded-full text-xs sm:text-sm text-foreground placeholder:text-purple-300/50 focus:outline-none focus:border-purple-500/70 focus:ring-2 focus:ring-purple-500/20 transition shadow-inner"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setShowDropdown(false);
                }}
                className="absolute right-2.5 p-0.5 rounded-full hover:bg-purple-500/20 text-purple-400 hover:text-white transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Autocomplete Dropdown Results */}
          {showDropdown && searchTerm.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-purple-500/35 bg-[#0e071e]/95 backdrop-blur-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-2 border-b border-purple-500/20 flex items-center justify-between text-[11px] text-purple-300/70">
                <span>ผลการค้นหาด่วน ({searchResults.length})</span>
                {isSearching && <span className="animate-pulse text-fuchsia-300">กำลังค้นหา...</span>}
              </div>

              {searchResults.length > 0 ? (
                <div className="p-1.5 divide-y divide-purple-500/10 max-h-72 overflow-y-auto scrollbar-none">
                  {searchResults.map((spot) => (
                    <div
                      key={spot.id}
                      onClick={() => handleSelectResult(spot)}
                      className="p-2 rounded-xl flex items-center justify-between gap-2.5 hover:bg-purple-600/20 transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {spot.imageUrl ? (
                          <img
                            src={getOptimizedImageUrl(spot.imageUrl)}
                            alt={spot.title}
                            className="w-10 h-10 rounded-lg object-cover shrink-0 border border-purple-500/30"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-purple-900/40 flex items-center justify-center text-purple-300 shrink-0">
                            <MapPin className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0 text-left">
                          <p className="text-xs font-bold text-white group-hover:text-fuchsia-300 transition truncate">
                            {spot.title}
                          </p>
                          <p className="text-[10px] text-purple-300/70 truncate flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-pink-400 shrink-0" />
                            <span>{spot.location}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${
                            spot.noiseLevel === "quiet"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : spot.noiseLevel === "lively"
                              ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                              : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          }`}
                        >
                          {spot.noiseLevel === "quiet"
                            ? "เงียบ"
                            : spot.noiseLevel === "lively"
                            ? "คึกคัก"
                            : "ปานกลาง"}
                        </span>
                        {spot.audioUrl && (
                          <button
                            onClick={(e) => handleQuickPlay(e, spot)}
                            type="button"
                            title="ฟังเสียงบรรยากาศทันที"
                            className="p-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-white transition shadow cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-current" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : !isSearching ? (
                <div className="p-4 text-center text-xs text-purple-300/60">
                  ไม่พบจุดอ่านหนังสือที่ตรงกับ &ldquo;{searchTerm}&rdquo;
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleSearchSubmit}
                className="w-full py-2 bg-purple-900/30 hover:bg-purple-900/60 text-center text-xs font-bold text-purple-200 border-t border-purple-500/20 transition cursor-pointer"
              >
                ดูผลการค้นหาทั้งหมดบนหน้าฟีด &rarr;
              </button>
            </div>
          )}
        </div>

        {/* Right: Theme Toggle & Login */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0 min-w-0">
          <Link href="/spots/new" className="hidden">
            <PlusCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>เพิ่มจุดใหม่</span>
          </Link>

          {/* Daily Study Streak Badge */}
          <button
            onClick={() => setIsStatsModalOpen(true)}
            type="button"
            aria-label="ดูสถิติการอ่านและสตรีคประจำวัน"
            title={`สตรีคอ่านหนังสือ: ${studyStats.streakDays || 0} วัน (${studyStats.todayMinutes} นาทีวันนี้)`}
            className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-orange-500/20 to-rose-500/15 border border-orange-500/40 text-orange-200 hover:text-white hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/15 transition cursor-pointer shadow-sm group"
          >
            <Flame className="w-3.5 h-3.5 text-orange-400 group-hover:scale-110 group-hover:text-amber-300 transition-transform animate-pulse" />
            <span className="text-xs font-bold text-amber-300">
              {studyStats.streakDays || 0}
              <span className="text-[10px] font-normal text-orange-200/90 ml-0.5">วัน</span>
            </span>
            <span className="text-[10px] text-zinc-400 hidden sm:inline">
              | {studyStats.todayMinutes}น.
            </span>
          </button>

          {/* Theme Toggle */}
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

          {/* User / Login */}
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
              <div className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-1.5 rounded-full bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 min-w-0 max-w-[42px] sm:max-w-[180px]">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold text-[10px]">
                  {currentUser.username[0]?.toUpperCase() || "U"}
                </div>
                <span className="font-medium hidden sm:inline truncate">{currentUser.username}</span>
                {settings?.role === "ADMIN" && (
                  <span className="hidden sm:inline text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
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

      {/* Study Stats & Streak Modal */}
      <StudyStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
      />
    </header>
  );
}
