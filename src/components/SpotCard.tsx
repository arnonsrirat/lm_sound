"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, Pause, MapPin, User, Heart, Sparkles } from "lucide-react";
import { noiseLevelLabels, type NoiseLevel } from "@/lib/validations/spot";
import { useAudio } from "@/context/AudioContext";
import NoiseGauge from "@/components/NoiseGauge";
import { notify } from "@/lib/notify";
import { AmenityBadges } from "@/components/AmenityBadges";
import { getOptimizedImageUrl } from "@/lib/media-url";

export interface SpotCardProps {
  spot: {
    id: string;
    title: string;
    description: string;
    location: string;
    noiseLevel: string;
    noiseScore?: number | null;
    noiseSampleCount?: number;
    noiseSampleTarget?: number;
    imageUrl: string;
    audioUrl: string;
    createdAt?: Date | string;
    authorId: string;
    author?: {
      id: string;
      username: string;
    } | null;
    amenities?: string[];
  };
  currentUserId?: string | null;
  matchScore?: number;
  isTopMatch?: boolean;
}

// แยกสิ่งอำนวยความสะดวกจากเนื้อหา (Spot Amenities Tags)
function getAmenities(title: string, description: string): Array<{ label: string; icon: string }> {
  const text = `${title} ${description}`.toLowerCase();
  const amenities: Array<{ label: string; icon: string }> = [];

  if (text.includes("ปลั๊ก") || text.includes("ไฟ") || text.includes("ชาร์จ")) {
    amenities.push({ label: "มีปลั๊กไฟ", icon: "🔌" });
  }
  if (text.includes("แอร์") || text.includes("เย็น") || text.includes("ห้องสมุด")) {
    amenities.push({ label: "แอร์ฉ่ำ", icon: "❄️" });
  }
  if (text.includes("wifi") || text.includes("เน็ต") || text.includes("ไวไฟ") || text.includes("co-working")) {
    amenities.push({ label: "Wi-Fi", icon: "📶" });
  }
  if (text.includes("กาแฟ") || text.includes("คาเฟ่") || text.includes("เครื่องดื่ม")) {
    amenities.push({ label: "ใกล้คาเฟ่", icon: "☕" });
  }
  if (text.includes("24") || text.includes("ดึก") || text.includes("หอพัก")) {
    amenities.push({ label: "เปิด 24 ชม.", icon: "🌙" });
  }
  if (text.includes("เงียบ") || text.includes("สงบ") || text.includes("silent")) {
    amenities.push({ label: "โซนเงียบ", icon: "🤫" });
  }
  if (text.includes("วิว") || text.includes("ลม") || text.includes("ธรรมชาติ") || text.includes("สวน")) {
    amenities.push({ label: "วิวธรรมชาติ", icon: "🍃" });
  }

  // คืนค่าสูงสุด 3 แท็ก
  return amenities.slice(0, 3);
}

export default function SpotCard({ spot, currentUserId, matchScore, isTopMatch }: SpotCardProps) {
  const { isPlaying, activeTrack, playSpot, togglePlay } = useAudio();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const raw = localStorage.getItem("lmsound_favorites");
      if (raw) {
        const favs: string[] = JSON.parse(raw);
        return favs.includes(spot.id);
      }
    } catch {}
    return false;
  });

  const isThisPlaying = isPlaying && activeTrack.id === spot.id;

  // Sync favorite changes across tabs and components
  useEffect(() => {
    const handleFavSync = () => {
      try {
        const raw = localStorage.getItem("lmsound_favorites");
        if (raw) {
          const favs: string[] = JSON.parse(raw);
          setIsFavorite(favs.includes(spot.id));
        } else {
          setIsFavorite(false);
        }
      } catch {}
    };

    window.addEventListener("lmsound_favorites_updated", handleFavSync);
    return () => window.removeEventListener("lmsound_favorites_updated", handleFavSync);
  }, [spot.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUserId) { notify("กรุณาเข้าสู่ระบบก่อนกดถูกใจสถานที่", "error"); router.push(`/login?next=/spots/${spot.id}`); return; }
    try {
      const raw = localStorage.getItem("lmsound_favorites");
      let favs: string[] = raw ? JSON.parse(raw) : [];
      if (favs.includes(spot.id)) {
        favs = favs.filter((id) => id !== spot.id);
        setIsFavorite(false);
      } else {
        favs.push(spot.id);
        setIsFavorite(true);
      }
      localStorage.setItem("lmsound_favorites", JSON.stringify(favs));
      window.dispatchEvent(new Event("lmsound_favorites_updated"));
      notify(favs.includes(spot.id) ? "เพิ่มสถานที่ในรายการโปรดแล้ว" : "นำสถานที่ออกจากรายการโปรดแล้ว", "success");
    } catch {}
  };

  const noiseConfig =
    noiseLevelLabels[spot.noiseLevel as NoiseLevel] || {
      label: spot.noiseLevel,
      badgeColor: "bg-purple-950/60 text-purple-300 border-purple-500/30",
    };

  const amenities = spot.amenities ?? [];

  const handleTogglePlay = () => {
    if (isThisPlaying) {
      togglePlay();
    } else {
      playSpot({
        id: spot.id,
        title: spot.title,
        subtitle: spot.description,
        category: noiseConfig.label,
        imageUrl: spot.imageUrl,
        audioUrl: spot.audioUrl,
        location: spot.location,
      });
    }
  };

  return (
    <div
      id={`spot-${spot.id}`}
      className={`glass-card rounded-2xl overflow-hidden flex flex-col group relative border bg-[var(--card-bg)] shadow-xl transition-all duration-300 ${
        isThisPlaying
          ? "border-pink-500/80 ring-2 ring-pink-500/50 shadow-2xl living-card-active scale-[1.01]"
          : "border-purple-500/25 hover:border-purple-400/50"
      }`}
      style={{ contentVisibility: "auto", containIntrinsicSize: "360px 460px" }}
    >
      {/* Top Image & Floating Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-purple-950/40">
        <img
          src={getOptimizedImageUrl(spot.imageUrl)}
          alt={spot.title}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
            isThisPlaying ? "scale-105 brightness-95" : "group-hover:scale-105"
          }`}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/35 to-transparent" />

        {/* Favorite Bookmark Button (ปุ่มกดหัวใจจุดโปรด) */}
        <button
          onClick={toggleFavorite}
          type="button"
          aria-label={isFavorite ? "นำออกจากจุดโปรด" : "บันทึกเป็นจุดโปรด"}
          title={isFavorite ? "นำออกจากจุดโปรด" : "บันทึกเป็นจุดโปรด"}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all transform active:scale-90 cursor-pointer shadow-lg z-20 ${
            isFavorite
              ? "bg-rose-500 text-white shadow-rose-500/40 scale-105"
              : "bg-black/40 text-white/75 hover:text-rose-400 hover:bg-black/60 border border-white/20"
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-current animate-pulse" : ""}`} />
        </button>

        {/* Living Sound Visualizer Overlay (แสดงเมื่อการ์ดใบนี้กำลังเล่นเสียง) */}
        {isThisPlaying && (
          <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-pink-400/50 shadow-lg z-20 animate-in fade-in duration-300">
            {/* 6-Bar Animated Audio Waves */}
            <div className="flex items-end gap-1 h-3.5">
              <span className="w-1 bg-pink-400 rounded-full animate-[waveBounce_0.8s_ease-in-out_infinite]" />
              <span className="w-1 bg-fuchsia-400 rounded-full animate-[waveBounce_1.1s_ease-in-out_infinite_0.15s]" />
              <span className="w-1 bg-purple-400 rounded-full animate-[waveBounce_0.9s_ease-in-out_infinite_0.3s]" />
              <span className="w-1 bg-cyan-400 rounded-full animate-[waveBounce_1.2s_ease-in-out_infinite_0.1s]" />
              <span className="w-1 bg-pink-400 rounded-full animate-[waveBounce_0.7s_ease-in-out_infinite_0.25s]" />
              <span className="w-1 bg-fuchsia-400 rounded-full animate-[waveBounce_1.0s_ease-in-out_infinite_0.2s]" />
            </div>
            <span className="text-[10px] font-bold text-pink-200 tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE SOUND</span>
            </span>
          </div>
        )}

        {/* Audio Preview Play Button with Sound Ripple Effect */}
        <div className="absolute bottom-3 right-3 z-20">
          {isThisPlaying && (
            <div className="absolute -inset-1.5 rounded-full border-2 border-pink-400/60 sound-ripple pointer-events-none" />
          )}
          <button
            onClick={handleTogglePlay}
            type="button"
            aria-label={isThisPlaying ? "หยุดฟังเสียงบรรยากาศ" : "ฟังเสียงบรรยากาศ"}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-95 cursor-pointer relative z-10 ${
              isThisPlaying
                ? "bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-purple-500/50 ring-2 ring-pink-300 animate-pulse"
                : "bg-purple-950/85 text-purple-200 hover:text-white hover:bg-purple-600/60 backdrop-blur-md border border-purple-400/40 hover:scale-105"
            }`}
          >
            {isThisPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 ml-0.5 fill-current" />
            )}
          </button>
        </div>
      </div>

      {/* Living Audio Spectrum Wave Indicator */}
      {isThisPlaying && (
        <div className="w-full h-1 bg-gradient-to-r from-pink-500 via-fuchsia-400 to-purple-500 animate-pulse" />
      )}

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* 180-degree Noise Gauge with Active Sound Indicator & Sound Match Badge */}
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex min-w-0 flex-col items-start gap-0.5">
              <NoiseGauge noiseLevel={spot.noiseLevel} noiseScore={spot.noiseScore} />
              <span className="text-[9px] text-purple-300/55">{spot.noiseSampleCount ? `คำนวณจากข้อมูลเสียง ${spot.noiseSampleCount}/${spot.noiseSampleTarget ?? 5} ช่อง` : "รอข้อมูลเสียงสำหรับการคำนวณ"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {matchScore !== undefined && matchScore >= 65 && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-sm ${
                  isTopMatch
                    ? "bg-gradient-to-r from-amber-500/25 to-pink-500/25 text-amber-200 border-amber-400/50 animate-pulse"
                    : "bg-teal-500/20 text-teal-200 border-teal-400/30"
                }`}>
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>{isTopMatch ? "🏆 Best Match" : `${matchScore}% Match`}</span>
                </span>
              )}
              {isThisPlaying && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-400/30 animate-pulse">
                  <span>กำลังเล่น</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-purple-300/80 mb-2">
            <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="truncate">{spot.location}</span>
          </div>

          <Link href={`/spots/${spot.id}`}>
            <h3 className="font-bold text-base text-foreground group-hover:text-purple-400 transition-colors line-clamp-1">
              {spot.title}
            </h3>
          </Link>

          <p className="text-purple-300/60 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {spot.description}
          </p>

          {/* Spot Amenities Tags (ป้ายสิ่งอำนวยความสะดวกย่อ) */}
          <AmenityBadges amenities={amenities} compact />
        </div>

        {/* Footer info & Actions */}
        <div className="pt-3 mt-4 border-t border-purple-500/15 flex items-center justify-between text-xs text-purple-300/70">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 border border-purple-500/30 font-bold text-[10px]">
              <User className="w-3 h-3" />
            </div>
            <span className="truncate max-w-[110px] text-[11px]">
              {spot.author?.username || "ผู้ใช้ทั่วไป"}
            </span>
          </div>

          {/* การจัดการสถานที่ทำได้เฉพาะในระบบหลังบ้าน */}
          <div className="flex items-center gap-1.5">
            <Link
              href={`/spots/${spot.id}`}
              className="text-purple-400 hover:text-fuchsia-300 font-semibold text-xs ml-1 inline-flex items-center gap-1 transition"
            >
              ดูข้อมูล &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
