"use client";

import { useState, useEffect } from "react";
import { Play, Pause, MapPin, Sparkles, Volume2, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAudio } from "@/context/AudioContext";

interface RecommendedSpot {
  id: string;
  title: string;
  description: string;
  location: string;
  noiseLevel: string;
  imageUrl: string;
  audioUrl: string;
}

interface FeaturedBannerProps {
  spots?: RecommendedSpot[];
  spot?: RecommendedSpot | null;
  /** ใช้ภาพของสถานที่เมื่อแบนเนอร์กำลังแสดงคำแนะนำตามช่วงเวลา */
  useSpotImage?: boolean;
  bannerSettings?: {
    bannerLight: string;
    bannerDark: string;
    bannerTitle: string;
    bannerSubtitle: string;
  };
}

const DEFAULT_RECOMMENDED: RecommendedSpot[] = [
  {
    id: "rec-lib-4",
    title: "หอสมุดกลาง ชั้น 4 โซน Silent Study",
    description: "มุมอ่านหนังสือลับที่เงียบสงบที่สุดในมหาวิทยาลัย บรรยากาศวิวพระอาทิตย์ตกริมทะเลสาบ พร้อมเครื่องเล่นเสียงบรรยากาศจริงช่วยให้โฟกัสได้อย่างลึกซึ้ง",
    location: "อาคารหอสมุดกลาง ชั้น 4 โซน C",
    noiseLevel: "quiet",
    imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg",
  },
  {
    id: "rec-forest-garden",
    title: "สวนป่าใต้ร่มจามจุรี ข้างตึกศิลป์",
    description: "โต๊ะหินอ่อนใต้ร่มไม้ใหญ่ ลมพัดเย็นสบายตลอดบ่าย มีเสียงนกร้องเบาๆ เหมาะสำหรับการอ่านชีทสรุปหรือคิดงานสร้างสรรค์",
    location: "ลานกิจกรรมข้างคณะสถาปัตย์และศิลปกรรม",
    noiseLevel: "quiet",
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/forest_wind.ogg",
  },
  {
    id: "rec-midnight-rain",
    title: "Midnight Rain & Focus Space",
    description: "เสียงสายฝนโปรยปรายยามดึกผสมคลื่นเสียง White Noise เสริมสมาธิการเขียนโค้ดและอ่านตำราสอบแบบ Deep Work",
    location: "ห้องอ่านหนังสือรวม ชั้น 2 ริมระเบียง",
    noiseLevel: "moderate",
    imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg",
  },
  {
    id: "rec-coworking-7",
    title: "Co-Working Space หอพัก 7 (24 ชม.)",
    description: "พื้นที่อ่านหนังสือติดแอร์เย็นฉ่ำ มีเสียงพิมพ์คีย์บอร์ดและบรรยากาศตื่นตัว เหมาะสำหรับคนที่ชอบอ่านเป็นกลุ่ม",
    location: "หอพักในกำกับ อาคาร 7 ชั้น 1",
    noiseLevel: "moderate",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/office_room.ogg",
  },
];

export default function FeaturedBanner({ spots, spot, useSpotImage = false, bannerSettings }: FeaturedBannerProps) {
  const { isPlaying, activeTrack, playSpot, togglePlay } = useAudio();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDark, setIsDark] = useState(false);

  // ติดตามธีมสว่าง/มืด เพื่อสลับภาพแบนเนอร์ที่แอดมินตั้งไว้แยกกัน
  useEffect(() => {
    const updateTheme = () => setIsDark(!document.documentElement.classList.contains("light"));
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Combine provided spots or fallback
  const items: RecommendedSpot[] =
    spots && spots.length > 0
      ? spots.slice(0, 4)
      : spot
      ? [spot, ...DEFAULT_RECOMMENDED.slice(1)]
      : DEFAULT_RECOMMENDED;

  const currentItem = items[currentIndex] || items[0];
  const isThisItemPlaying = isPlaying && activeTrack.id === currentItem.id;

  // Auto slide every 8s if not playing
  useEffect(() => {
    if (isPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [items.length, isPlaying]);

  const handlePlayToggle = () => {
    if (isThisItemPlaying) {
      togglePlay();
    } else {
      playSpot({
        id: currentItem.id,
        title: currentItem.title,
        subtitle: currentItem.description,
        category: currentItem.noiseLevel === "quiet" ? "เงียบสงบ" : "ปานกลาง",
        imageUrl: currentItem.imageUrl,
        audioUrl: currentItem.audioUrl,
        location: currentItem.location,
      });
    }
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  return (
    <section id="recommended" className="relative mb-8 group scroll-mt-20">
      {/* Outer Glow container with Living Sound State */}
      <div
        className={`relative rounded-3xl overflow-hidden border backdrop-blur-xl transition-all duration-500 ${
          isThisItemPlaying
            ? "border-pink-500/70 shadow-[0_0_35px_rgba(236,72,153,0.3)] ring-2 ring-pink-500/40 living-card-active bg-[#120724]"
            : "border-purple-500/35 bg-[#0f071d] shadow-2xl"
        }`}
      >
        {/* Background Image / Ambient Artwork (แบนเนอร์แยกตามธีมสว่าง/มืด — แอดมินตั้งได้) */}
        <div className="absolute inset-0">
          <img
            key={currentItem.id}
            src={
              useSpotImage
                ? currentItem.imageUrl || "/logo.png"
                : isDark
                ? bannerSettings?.bannerDark || currentItem.imageUrl || "/logo.png"
                : bannerSettings?.bannerLight || currentItem.imageUrl || "/logo.png"
            }
            alt={currentItem.title}
            className={`w-full h-full object-cover object-center transition-all duration-1000 ease-out ${
              isThisItemPlaying ? "scale-105 opacity-50 brightness-105" : useSpotImage ? "opacity-45 group-hover:scale-105" : "opacity-30 group-hover:scale-105"
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0414] via-[#0e071c]/90 to-[#180d2e]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0414] via-transparent to-transparent" />
        </div>

        {/* Carousel Navigation Arrows */}
        <button
          onClick={prevSlide}
          aria-label="สไลด์ก่อนหน้า"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-purple-950/60 hover:bg-purple-600/40 border border-purple-500/30 text-purple-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={nextSlide}
          aria-label="สไลด์ถัดไป"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-purple-950/60 hover:bg-purple-600/40 border border-purple-500/30 text-purple-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Banner Content */}
        <div className="relative z-10 p-6 md:p-8 lg:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-3">
            {/* Tag Badge / Living Sound Indicator */}
            {isThisItemPlaying ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-black/60 border border-pink-400/50 text-pink-200 backdrop-blur-md shadow-lg animate-in fade-in duration-300">
                <div className="flex items-end gap-1 h-3.5">
                  <span className="w-1 bg-pink-400 rounded-full animate-[waveBounce_0.8s_ease-in-out_infinite]" />
                  <span className="w-1 bg-fuchsia-400 rounded-full animate-[waveBounce_1.1s_ease-in-out_infinite_0.15s]" />
                  <span className="w-1 bg-purple-400 rounded-full animate-[waveBounce_0.9s_ease-in-out_infinite_0.3s]" />
                  <span className="w-1 bg-cyan-400 rounded-full animate-[waveBounce_1.2s_ease-in-out_infinite_0.1s]" />
                </div>
                <span className="font-bold tracking-wide flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>กำลังถ่ายทอดเสียงสด (LIVE AMBIENT SOUND)</span>
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold purple-pill backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span>{bannerSettings?.bannerTitle || "เสียงแนะนำ (Recommended Soundscape)"}</span>
              </div>
            )}

            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-snug transition-colors ${
              isThisItemPlaying ? "text-pink-100" : "text-white"
            }`}>
              {currentItem.title}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-purple-200/80">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{currentItem.location}</span>
              </div>
              <span className="text-purple-400/50">•</span>
              <div className="inline-flex items-center gap-1.5 text-fuchsia-300 font-medium">
                <Volume2 className="w-3.5 h-3.5" />
                <span>ระดับเสียง: {currentItem.noiseLevel === "quiet" ? "เงียบสงบ" : "ปานกลาง"}</span>
              </div>
            </div>

            <p className="text-purple-200/70 text-xs sm:text-sm line-clamp-2 leading-relaxed pt-1">
              {bannerSettings?.bannerSubtitle || currentItem.description}
            </p>
          </div>

          {/* Action Button */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="relative">
              {isThisItemPlaying && (
                <div className="absolute -inset-1.5 rounded-full border-2 border-pink-400/60 sound-ripple pointer-events-none" />
              )}
              <button
                onClick={handlePlayToggle}
                type="button"
                className={`inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full font-bold text-sm shadow-xl transition-all transform active:scale-95 cursor-pointer relative z-10 ${
                  isThisItemPlaying
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-purple-500/50 ring-2 ring-pink-300 animate-pulse"
                    : "purple-gradient-btn"
                }`}
              >
                {isThisItemPlaying ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    <span>หยุดฟังเสียง</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                    <span>ทดลองฟังเสียงบรรยากาศ</span>
                  </>
                )}
              </button>
            </div>

            {currentItem.id.startsWith("spot-") && (
              <Link
                href={`/spots/${currentItem.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-3.5 rounded-full text-xs font-semibold text-purple-200 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 transition"
              >
                <span>รายละเอียด</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Dot Pagination Indicators (. . . . as drawn in the wireframe!) */}
        <div className="relative z-10 pb-4 pt-1 flex items-center justify-center gap-2">
          {items.map((it, idx) => (
            <button
              key={it.id}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`ไปยังเสียงแนะนำที่ ${idx + 1}`}
              className={`transition-all rounded-full cursor-pointer ${
                currentIndex === idx
                  ? "w-6 h-2 bg-gradient-to-r from-purple-400 to-fuchsia-400 shadow-md shadow-purple-500/50"
                  : "w-2 h-2 bg-purple-400/30 hover:bg-purple-300/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
