"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import SpotCard from "./SpotCard";
import { Filter, AlertCircle, Sparkles, Dices, Heart, Volume2 } from "lucide-react";
import { useAudio, AMBIENCE_PRESETS } from "@/context/AudioContext";

interface SpotFeedProps {
  spots: Array<{
    id: string;
    title: string;
    description: string;
    location: string;
    noiseLevel: string;
    imageUrl: string;
    audioUrl: string;
    createdAt?: Date | string;
    authorId: string;
    author?: {
      id: string;
      username: string;
    } | null;
  }>;
  currentUserId?: string | null;
}

export default function SpotFeed({ spots, currentUserId }: SpotFeedProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { applyAmbiencePreset, activePresetId, playSpot } = useAudio();

  const activeNoise = searchParams.get("noiseLevel") || "all";
  const searchQuery = searchParams.get("search") || "";

  // Filter Categories: Level + Mood/Time-of-day + Favorites
  const [activeMoodFilter, setActiveMoodFilter] = useState<string>("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isRollingDice, setIsRollingDice] = useState(false);
  const [highlightedSpotId, setHighlightedSpotId] = useState<string | null>(null);

  // Sync Favorites from localStorage
  useEffect(() => {
    const loadFavs = () => {
      try {
        const raw = localStorage.getItem("lmsound_favorites");
        if (raw) {
          setFavorites(JSON.parse(raw));
        } else {
          setFavorites([]);
        }
      } catch {
        setFavorites([]);
      }
    };
    loadFavs();
    window.addEventListener("lmsound_favorites_updated", loadFavs);
    return () => window.removeEventListener("lmsound_favorites_updated", loadFavs);
  }, []);

  const filterOptions = [
    { key: "all", label: "ทั้งหมด" },
    { key: "quiet", label: "🤫 เงียบสงบ" },
    { key: "moderate", label: "🔉 ปานกลาง" },
    { key: "lively", label: "🔊 คึกคัก / มีเสียง" },
    { key: "mood-night", label: "🌙 รอบดึก 24 ชม." },
    { key: "mood-cafe", label: "☕ คาเฟ่ & ชิลล์" },
    { key: "favorites", label: `❤️ จุดโปรด (${favorites.length})` },
  ];

  const handleFilterClick = (key: string) => {
    if (key.startsWith("mood-") || key === "favorites") {
      setActiveMoodFilter(key);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("noiseLevel");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    } else {
      setActiveMoodFilter("all");
      const params = new URLSearchParams(searchParams.toString());
      if (key === "all") {
        params.delete("noiseLevel");
      } else {
        params.set("noiseLevel", key);
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  // Lucky Spot Shuffle (สุ่มจุดอ่านหนังสือ & เล่นเสียงบรรยากาศทันที 🎲)
  const handleLuckyShuffle = () => {
    if (spots.length === 0 || isRollingDice) return;
    setIsRollingDice(true);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * spots.length);
      const chosenSpot = spots[randomIndex];

      setIsRollingDice(false);
      setHighlightedSpotId(chosenSpot.id);

      // เริ่มเล่นเสียงทันที
      playSpot({
        id: chosenSpot.id,
        title: chosenSpot.title,
        subtitle: chosenSpot.description,
        category: chosenSpot.noiseLevel,
        imageUrl: chosenSpot.imageUrl,
        audioUrl: chosenSpot.audioUrl,
        location: chosenSpot.location,
      });

      // เลื่อนจอไปยังการ์ดที่สุ่มได้
      const targetElement = document.getElementById(`spot-${chosenSpot.id}`);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      // ปลดไฮไลต์หลังจาก 3 วินาที
      setTimeout(() => setHighlightedSpotId(null), 3500);
    }, 600);
  };

  // Instant In-Memory Filtering
  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => {
      // 1. Noise Filter
      if (activeMoodFilter === "all" && activeNoise !== "all") {
        if (spot.noiseLevel !== activeNoise) return false;
      }

      // 2. Mood Filters
      if (activeMoodFilter === "mood-night") {
        const text = `${spot.title} ${spot.description}`.toLowerCase();
        if (!text.includes("24") && !text.includes("ดึก") && !text.includes("หอพัก")) return false;
      } else if (activeMoodFilter === "mood-cafe") {
        const text = `${spot.title} ${spot.description}`.toLowerCase();
        if (!text.includes("คาเฟ่") && !text.includes("กาแฟ") && !text.includes("วิศวะ")) return false;
      } else if (activeMoodFilter === "favorites") {
        if (!favorites.includes(spot.id)) return false;
      }

      // 3. Search Query
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const matchTitle = spot.title.toLowerCase().includes(q);
        const matchDesc = spot.description.toLowerCase().includes(q);
        const matchLoc = spot.location.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchLoc) return false;
      }

      return true;
    });
  }, [spots, activeNoise, activeMoodFilter, favorites, searchQuery]);

  return (
    <section id="popular" className="space-y-6 scroll-mt-20">
      {/* 1-Click Quick Ambience Presets Banner (โหมดบรรยากาศ 1-คลิก) */}
      <div className="rounded-2xl p-3 sm:p-4 border border-purple-500/30 bg-gradient-to-r from-[#170a36]/80 via-[#100624]/90 to-[#190938]/80 backdrop-blur-xl shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-fuchsia-500/20 text-fuchsia-400">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            </span>
            <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
              โหมดบรรยากาศสำเร็จรูป 1-คลิก (Quick Ambience Presets)
            </span>
          </div>
          <span className="text-[11px] text-purple-300/70 hidden md:inline">
            กดปุ่มเดียว ระบบ Sound Mixer จะปรับสัดส่วนเสียงให้อัตโนมัติ
          </span>
        </div>

        {/* Preset Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {AMBIENCE_PRESETS.map((preset) => {
            const isActive = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyAmbiencePreset(preset.id)}
                className={`p-2.5 rounded-xl border text-left transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-pink-400 shadow-md shadow-pink-500/30 scale-[1.02]"
                    : "bg-[#1f1142]/60 hover:bg-[#2c185c]/80 text-purple-200 border-purple-500/25 hover:border-fuchsia-400/40"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-base">{preset.emoji}</span>
                  {isActive && (
                    <span className="flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                    </span>
                  )}
                </div>
                <div className="font-bold text-xs truncate">{preset.name}</div>
                <div className="text-[10px] text-purple-300/60 truncate mt-0.5">
                  {preset.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feed Controls Header: 'เสียงยอดนิยม' & Filters & Lucky Spot Button */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-purple-500/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-fuchsia-400">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl md:text-2xl font-extrabold text-foreground flex items-center gap-2">
                <span>เสียงยอดนิยม</span>
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full purple-pill font-medium">
                {filteredSpots.length} รายการ
              </span>
            </div>
            <p className="text-xs text-purple-300/70 mt-0.5">
              รวมเสียงบรรยากาศและมุมอ่านหนังสือยอดฮิตที่มีผู้ฟังมากที่สุด
            </p>
          </div>
        </div>

        {/* Right side: Lucky Spot Button + Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Lucky Spot Shuffle Button (ปุ่มสุ่มจุดอ่านหนังสือ 🎲) */}
          <button
            type="button"
            onClick={handleLuckyShuffle}
            disabled={isRollingDice}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-900/30 transition transform active:scale-95 cursor-pointer border border-amber-300/40"
            title="สุ่มจุดอ่านหนังสือและเปิดเสียงบรรยากาศทันที"
          >
            <Dices className={`w-4 h-4 ${isRollingDice ? "animate-dice" : ""}`} />
            <span>{isRollingDice ? "กำลังสุ่ม..." : "สุ่มที่อ่านหนังสือ 🎲"}</span>
          </button>

          {/* Filter Chips (ระดับเสียง, ช่วงเวลา, และจุดโปรด) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {filterOptions.map((opt) => {
              const active =
                opt.key === "all"
                  ? activeNoise === "all" && activeMoodFilter === "all"
                  : opt.key.startsWith("mood-") || opt.key === "favorites"
                  ? activeMoodFilter === opt.key
                  : activeNoise === opt.key && activeMoodFilter === "all";

              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleFilterClick(opt.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                    active
                      ? "purple-gradient-btn font-bold shadow-md shadow-purple-900/40 scale-105"
                      : "bg-purple-950/25 text-purple-300 hover:text-white hover:bg-purple-600/20 border border-purple-500/20"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {searchQuery && (
        <div className="flex items-center gap-2 text-xs text-purple-300/80 -mt-2">
          <span>
            ผลการค้นหาสำหรับ: &ldquo;<span className="text-fuchsia-300 font-semibold">{searchQuery}</span>&rdquo;
          </span>
          <button
            type="button"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete("search");
              router.replace(`${pathname}?${params.toString()}`, { scroll: false });
            }}
            className="text-[11px] text-purple-400 hover:text-cyan-300 underline cursor-pointer"
          >
            ล้างคำค้นหา
          </button>
        </div>
      )}

      {/* Grid of Spots */}
      {filteredSpots.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300">
          {filteredSpots.map((spot) => (
            <div
              key={spot.id}
              className={`transition-all duration-500 rounded-2xl ${
                highlightedSpotId === spot.id
                  ? "ring-4 ring-amber-400 shadow-2xl shadow-amber-500/50 scale-[1.03]"
                  : ""
              }`}
            >
              <SpotCard spot={spot} currentUserId={currentUserId} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-purple-900/60 bg-[#0d061c]/40">
          <div className="w-12 h-12 rounded-full bg-[#180933] flex items-center justify-center text-purple-400 mx-auto mb-3">
            {activeMoodFilter === "favorites" ? (
              <Heart className="w-6 h-6 text-rose-400" />
            ) : (
              <AlertCircle className="w-6 h-6" />
            )}
          </div>
          <h3 className="text-base font-semibold text-slate-200">
            {activeMoodFilter === "favorites"
              ? "ยังไม่มีจุดโปรดที่คุณบันทึกไว้"
              : "ยังไม่พบจุดอ่านหนังสือที่ค้นหา"}
          </h3>
          <p className="text-xs text-purple-300/60 max-w-sm mx-auto mt-1 mb-5">
            {activeMoodFilter === "favorites"
              ? "กดไอคอนหัวใจ ❤️ บนการ์ดสถานที่เพื่อบันทึกไว้เปิดฟังซ้ำได้สะดวกรวดเร็ว"
              : "ลองปรับเปลี่ยนตัวกรอง หรือเป็นคนแรกที่แนะนำมุมลับนี้ให้กับเพื่อนๆ"}
          </p>
          <button
            type="button"
            onClick={() => handleFilterClick("all")}
            className="px-4 py-2 rounded-xl purple-gradient-btn text-xs font-bold transition cursor-pointer"
          >
            แสดงจุดอ่านหนังสือทั้งหมด
          </button>
        </div>
      )}
    </section>
  );
}
