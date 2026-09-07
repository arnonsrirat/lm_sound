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

  const featured = spot || {
    id: "featured-default",
    title: "หอสมุดกลาง ชั้น 4 โซน Silent Study",
    description: "มุมอ่านหนังสือลับที่เงียบสงบที่สุดในมหาวิทยาลัย บรรยากาศวิวพระอาทิตย์ตกริมทะเลสาบ พร้อมเครื่องเล่นเสียงบรรยากาศจริงช่วยให้โฟกัสได้อย่างลึกซึ้ง",
    location: "อาคารหอสมุดกลาง ชั้น 4 โซน C",
    noiseLevel: "quiet",
    imageUrl: "/logo.png",
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
    <div className="relative rounded-3xl overflow-hidden border border-purple-500/20 bg-gradient-to-r from-[#0d1224] to-[#14122b] shadow-2xl mb-8 group">
      {/* Background Image / Ambient Artwork */}
      <div className="absolute inset-0">
        <img
          src={featured.imageUrl || "/logo.png"}
          alt={featured.title}
          className="w-full h-full object-cover object-center opacity-30 group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080b14] via-[#080b14]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080b14] via-transparent to-transparent" />
      </div>

      {/* Banner Content */}
      <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Spatial & Ambient Soundscape Platform</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
            {featured.title}
          </h1>

          <div className="flex items-center gap-2 text-xs md:text-sm text-indigo-200">
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{featured.location}</span>
            <span className="text-indigo-600">•</span>
            <span className="inline-flex items-center gap-1 text-pink-400 font-medium">
              <Volume2 className="w-3.5 h-3.5" />
              ระดับเสียง: เงียบสงบ
            </span>
          </div>

          <p className="text-indigo-200/70 text-xs sm:text-sm line-clamp-2 leading-relaxed pt-1">
            {featured.description}
          </p>
        </div>

        {/* Listen Action in Twilight Gradient */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={togglePlay}
            type="button"
            className={`inline-flex items-center gap-3 px-6 py-3.5 rounded-full font-bold text-sm shadow-xl transition-all transform active:scale-95 ${
              isPlaying
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-purple-500/50 ring-4 ring-purple-500/30 animate-pulse"
                : "text-white twilight-gradient-btn"
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
                <span>ทดลองฟังเสียงบรรยากาศจริง</span>
              </>
            )}
          </button>

          {featured.id !== "featured-default" && (
            <Link
              href={`/spots/${featured.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-3.5 rounded-full text-sm font-semibold text-indigo-200 bg-[#0e1326]/80 hover:bg-[#161c38] border border-indigo-900/60 transition"
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
