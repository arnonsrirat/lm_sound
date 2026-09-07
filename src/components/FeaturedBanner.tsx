"use client";

import { useState, useRef } from "react";
import { Play, Pause, MapPin, Sparkles, Volume2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface FeaturedBannerProps {
  spot?: {
    id: string;
    title: string;
    description: string;
    location: string;
    noiseLevel: string;
    imageUrl: string;
    audioUrl: string;
  } | null;
}

export default function FeaturedBanner({ spot }: FeaturedBannerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fallback featured data if no spot is in DB yet
  const featured = spot || {
    id: "featured-default",
    title: "หอสมุดกลาง ชั้น 4 โซน Silent Study",
    description: "มุมอ่านหนังสือที่เงียบที่สุดในมหาวิทยาลัย แสงธรรมชาติพร้อมปลั๊กไฟทุกโต๊ะ และเสียงบรรยากาศความสงบที่ช่วยให้โฟกัสได้อย่างล้ำลึก",
    location: "อาคารหอสมุดกลาง ชั้น 4 โซน C",
    noiseLevel: "quiet",
    imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1400&q=80",
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg",
  };

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(featured.audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onerror = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/80 shadow-2xl mb-8 group">
      {/* Background Image with Ambient Glow */}
      <div className="absolute inset-0">
        <img
          src={featured.imageUrl}
          alt={featured.title}
          className="w-full h-full object-cover object-center opacity-35 group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
      </div>

      {/* Banner Content */}
      <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>จุดอ่านหนังสือแนะนำประจำสัปดาห์</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
            {featured.title}
          </h1>

          <div className="flex items-center gap-2 text-xs md:text-sm text-slate-300">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{featured.location}</span>
            <span className="text-slate-600">•</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
              <Volume2 className="w-3.5 h-3.5" />
              ระดับเสียง: เงียบสงบ
            </span>
          </div>

          <p className="text-slate-400 text-xs sm:text-sm line-clamp-2 leading-relaxed pt-1">
            {featured.description}
          </p>
        </div>

        {/* Listen Action */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={togglePlay}
            type="button"
            className={`inline-flex items-center gap-3 px-6 py-3.5 rounded-full font-bold text-sm shadow-xl transition-all transform active:scale-95 ${
              isPlaying
                ? "bg-emerald-500 text-slate-950 shadow-emerald-500/40 ring-4 ring-emerald-500/20 animate-pulse"
                : "bg-slate-100 text-slate-950 hover:bg-emerald-400 hover:text-slate-950 shadow-black/50"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>หยุดฟังเสียง</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>ทดลองฟังเสียงบรรยากาศ</span>
              </>
            )}
          </button>

          {featured.id !== "featured-default" && (
            <Link
              href={`/spots/${featured.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-3.5 rounded-full text-sm font-semibold text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 transition"
            >
              <span>ดูข้อมูลเต็ม</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
