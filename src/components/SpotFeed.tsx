"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SpotCard from "./SpotCard";
import { Volume2, Sparkles, Filter, AlertCircle, PlusCircle, Search } from "lucide-react";
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
    <section id="feed" className="space-y-6 scroll-mt-20">
      {/* Feed Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <span>จุดอ่านหนังสือยอดนิยม</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-400 font-normal border border-slate-700">
              {filteredSpots.length} จุด
            </span>
          </h2>
          {searchQuery && (
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span>
                ผลการค้นหาสำหรับ: &ldquo;<span className="text-emerald-400 font-semibold">{searchQuery}</span>&rdquo;
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  const url = new URL(window.location.href);
                  url.searchParams.delete("search");
                  window.history.replaceState(null, "", url.toString());
                }}
                className="text-[11px] text-slate-500 hover:text-slate-300 underline"
              >
                ล้างคำค้นหา
              </button>
            </div>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
          {filterOptions.map((opt) => {
            const active = activeNoise === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => handleFilterClick(opt.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  active
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20 scale-105"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Spots */}
      {filteredSpots.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300">
          {filteredSpots.map((spot) => (
            <SpotCard key={spot.id} spot={spot} currentUserId={currentUserId} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-slate-800 bg-slate-900/30">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">ยังไม่พบจุดอ่านหนังสือที่ค้นหา</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            ลองปรับเปลี่ยนคำค้นหาหรือระดับเสียงรบกวน หรือเป็นคนแรกที่แนะนำมุมลับนี้ให้กับเพื่อนๆ
          </p>
          <Link
            href="/spots/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>แนะนำจุดอ่านหนังสือใหม่</span>
          </Link>
        </div>
      )}
    </section>
  );
}
