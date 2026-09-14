"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Pause, MapPin, Trash2, Edit3, User, Heart } from "lucide-react";
import { noiseLevelLabels, type NoiseLevel } from "@/lib/validations/spot";
import { deleteSpotAction } from "@/actions/spot";
import { useAudio } from "@/context/AudioContext";
import NoiseGauge from "@/components/NoiseGauge";

export interface SpotCardProps {
  spot: {
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
  };
  currentUserId?: string | null;
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

export default function SpotCard({ spot, currentUserId }: SpotCardProps) {
  const { isPlaying, activeTrack, playSpot, togglePlay } = useAudio();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const isThisPlaying = isPlaying && activeTrack.id === spot.id;

  // โหลดสถานะ Favorite จาก LocalStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("lmsound_favorites");
      if (raw) {
        const favs: string[] = JSON.parse(raw);
        setIsFavorite(favs.includes(spot.id));
      }
    } catch {}

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
    } catch {}
  };

  const noiseConfig =
    noiseLevelLabels[spot.noiseLevel as NoiseLevel] || {
      label: spot.noiseLevel,
      badgeColor: "bg-purple-950/60 text-purple-300 border-purple-500/30",
    };

  const isOwner = currentUserId && spot.authorId === currentUserId;
  const amenities = getAmenities(spot.title, spot.description);

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

  const handleDelete = async () => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบจุด "${spot.title}"?`)) return;
    setIsDeleting(true);
    try {
      const res = await deleteSpotAction(spot.id);
      if (!res.success) {
        alert(res.error || "เกิดข้อผิดพลาดในการลบ");
      }
    } catch (err) {
      alert("ไม่สามารถลบได้");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      id={`spot-${spot.id}`}
      className={`glass-card rounded-2xl overflow-hidden flex flex-col group relative border bg-[var(--card-bg)] shadow-xl transition-all duration-300 ${
        isThisPlaying
          ? "border-pink-500/60 shadow-pink-500/20 ring-1 ring-pink-500/30"
          : "border-purple-500/25 hover:border-purple-400/50"
      }`}
    >
      {/* Top Image & Floating Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-purple-950/40">
        <img
          src={spot.imageUrl}
          alt={spot.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
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

        {/* Audio Wave Visualizer Overlay (แสดงเมื่อการ์ดใบนี้กำลังเล่นเสียง) */}
        {isThisPlaying && (
          <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-pink-400/40 shadow-lg z-20 animate-in fade-in duration-300">
            {/* 6-Bar Animated Audio Waves */}
            <div className="flex items-end gap-1 h-3.5">
              <span className="w-1 bg-pink-400 rounded-full animate-[waveBounce_0.8s_ease-in-out_infinite]" />
              <span className="w-1 bg-fuchsia-400 rounded-full animate-[waveBounce_1.1s_ease-in-out_infinite_0.15s]" />
              <span className="w-1 bg-purple-400 rounded-full animate-[waveBounce_0.9s_ease-in-out_infinite_0.3s]" />
              <span className="w-1 bg-cyan-400 rounded-full animate-[waveBounce_1.2s_ease-in-out_infinite_0.1s]" />
              <span className="w-1 bg-pink-400 rounded-full animate-[waveBounce_0.7s_ease-in-out_infinite_0.25s]" />
              <span className="w-1 bg-fuchsia-400 rounded-full animate-[waveBounce_1.0s_ease-in-out_infinite_0.2s]" />
            </div>
            <span className="text-[10px] font-bold text-pink-200 tracking-wide">
              กำลังเล่นเสียงบรรยากาศ
            </span>
          </div>
        )}

        {/* Audio Preview Play Button in Purple Theme */}
        <button
          onClick={handleTogglePlay}
          type="button"
          aria-label={isThisPlaying ? "หยุดฟังเสียงบรรยากาศ" : "ฟังเสียงบรรยากาศ"}
          className={`absolute bottom-3 right-3 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-95 cursor-pointer z-20 ${
            isThisPlaying
              ? "bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-purple-500/50 animate-pulse ring-2 ring-pink-400/50"
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

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* 180-degree Noise Gauge */}
          <div className="mb-2.5">
            <NoiseGauge noiseLevel={spot.noiseLevel} />
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
          {amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {amenities.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-500/15 text-purple-200 border border-purple-400/20 backdrop-blur-sm"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </span>
              ))}
            </div>
          )}
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

          {/* Action buttons (Owner or Detail view) */}
          <div className="flex items-center gap-1.5">
            {isOwner && (
              <>
                <Link
                  href={`/spots/${spot.id}/edit`}
                  className="p-1.5 rounded-lg hover:bg-purple-500/20 text-purple-400 hover:text-white transition"
                  title="แก้ไขจุดอ่านหนังสือ"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-1.5 rounded-lg hover:bg-rose-500/20 text-purple-400 hover:text-rose-400 transition cursor-pointer"
                  title="ลบจุดอ่านหนังสือ"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}

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
