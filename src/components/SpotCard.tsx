"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, Pause, MapPin, Volume2, Trash2, Edit3, User } from "lucide-react";
import { noiseLevelLabels, type NoiseLevel } from "@/lib/validations/spot";
import { deleteSpotAction } from "@/actions/spot";
import { useAudio } from "@/context/AudioContext";

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

export default function SpotCard({ spot, currentUserId }: SpotCardProps) {
  const { isPlaying, activeTrack, playSpot, togglePlay } = useAudio();
  const [isDeleting, setIsDeleting] = useState(false);

  const isThisPlaying = isPlaying && activeTrack.id === spot.id;

  const noiseConfig =
    noiseLevelLabels[spot.noiseLevel as NoiseLevel] || {
      label: spot.noiseLevel,
      badgeColor: "bg-purple-950/60 text-purple-300 border-purple-500/30",
    };

  const isOwner = currentUserId && spot.authorId === currentUserId;

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
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col group relative border border-purple-500/25 bg-[var(--card-bg)] shadow-xl">
      {/* Top Image & Floating Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-purple-950/40">
        <img
          src={spot.imageUrl}
          alt={spot.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/30 to-transparent" />

        {/* Noise Level Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${noiseConfig.badgeColor}`}
          >
            <Volume2 className="w-3.5 h-3.5 text-purple-400" />
            {noiseConfig.label}
          </span>
        </div>

        {/* Audio Preview Play Button in Purple Theme */}
        <button
          onClick={handleTogglePlay}
          type="button"
          aria-label={isThisPlaying ? "หยุดฟังเสียงบรรยากาศ" : "ฟังเสียงบรรยากาศ"}
          className={`absolute bottom-3 right-3 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-95 cursor-pointer ${
            isThisPlaying
              ? "bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-purple-500/50 animate-pulse ring-2 ring-pink-400/50"
              : "bg-purple-950/80 text-purple-200 hover:text-white hover:bg-purple-600/50 backdrop-blur-md border border-purple-400/40"
          }`}
        >
          {isThisPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 ml-0.5 fill-current" />
          )}
        </button>

        {/* Playing indicator bars */}
        {isThisPlaying && (
          <div className="absolute bottom-3 left-3 flex items-end gap-1 h-5 px-2.5 py-1 rounded-full bg-purple-950/90 backdrop-blur-md border border-purple-500/30">
            <span className="w-1 bg-purple-400 animate-bounce h-2" style={{ animationDelay: "0ms" }} />
            <span className="w-1 bg-fuchsia-400 animate-bounce h-4" style={{ animationDelay: "150ms" }} />
            <span className="w-1 bg-pink-400 animate-bounce h-3" style={{ animationDelay: "300ms" }} />
            <span className="text-[10px] text-purple-200 font-medium ml-1">กำลังเล่น</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
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
