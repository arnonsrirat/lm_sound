"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SpotCard from "./SpotCard";
import { Filter, AlertCircle, PlusCircle } from "lucide-react";
import Link from "next/link";

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
  const initialNoise = searchParams.get("noiseLevel") || "all";
  const initialSearch = searchParams.get("search") || "";

  // Instant Client-side State
  const [activeNoise, setActiveNoise] = useState<string>(initialNoise);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);

  useEffect(() => {
    const noise = searchParams.get("noiseLevel") || "all";
    const search = searchParams.get("search") || "";
    setActiveNoise(noise);
    setSearchQuery(search);
  }, [searchParams]);

  const filterOptions = [
    { key: "all", label: "ทั้งหมด" },
    { key: "quiet", label: "เงียบสงบ" },
    { key: "moderate", label: "ปานกลาง" },
    { key: "lively", label: "คึกคัก / มีเสียง" },
  ];

  const handleFilterClick = (key: string) => {
    setActiveNoise(key);
    const url = new URL(window.location.href);
    if (key === "all") {
      url.searchParams.delete("noiseLevel");
    } else {
      url.searchParams.set("noiseLevel", key);
    }
    window.history.replaceState(null, "", url.toString());
  };

  // Instant 0ms In-Memory Filtering
  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => {
      const matchNoise = activeNoise === "all" || spot.noiseLevel === activeNoise;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        spot.title.toLowerCase().includes(q) ||
        spot.description.toLowerCase().includes(q) ||
        spot.location.toLowerCase().includes(q);
      return matchNoise && matchSearch;
    });
  }, [spots, activeNoise, searchQuery]);

  return (
    <section id="popular" className="space-y-6 scroll-mt-20">
      {/* Feed Controls Header matching wireframe: 'เสียงยอดนิยม' and 'ดูทั้งหมด' */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-purple-500/20">
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

        {/* Right side of header: 'ดูทั้งหมด' & Filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {filterOptions.map((opt) => {
              const active = activeNoise === opt.key;
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

          {/* 'ดูทั้งหมด' link as annotated in wireframe */}
          <button
            type="button"
            onClick={() => handleFilterClick("all")}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold purple-pill hover:bg-purple-600/25 transition cursor-pointer flex items-center gap-1"
          >
            <span>ดูทั้งหมด</span>
          </button>
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
              setSearchQuery("");
              const url = new URL(window.location.href);
              url.searchParams.delete("search");
              window.history.replaceState(null, "", url.toString());
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
            <SpotCard key={spot.id} spot={spot} currentUserId={currentUserId} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-indigo-900/60 bg-[#0d1226]/40">
          <div className="w-12 h-12 rounded-full bg-[#10162e] flex items-center justify-center text-indigo-400 mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">ยังไม่พบจุดอ่านหนังสือที่ค้นหา</h3>
          <p className="text-xs text-indigo-300/60 max-w-sm mx-auto mt-1 mb-5">
            ลองปรับเปลี่ยนคำค้นหาหรือระดับเสียงรบกวน หรือเป็นคนแรกที่แนะนำมุมลับนี้ให้กับเพื่อนๆ
          </p>
          <Link
            href="/spots/new"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-semibold text-white twilight-gradient-btn transition shadow-lg shadow-purple-900/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span>แนะนำจุดอ่านหนังสือใหม่</span>
          </Link>
        </div>
      )}
    </section>
  );
}
