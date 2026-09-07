"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Pause, MapPin, Volume2, Trash2, Edit3, User, Sparkles } from "lucide-react";
import { noiseLevelLabels, type NoiseLevel } from "@/lib/validations/spot";
import { deleteSpotAction } from "@/actions/spot";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const noiseConfig =
    noiseLevelLabels[spot.noiseLevel as NoiseLevel] || {
      label: spot.noiseLevel,
      badgeColor: "bg-slate-700/50 text-slate-300 border-slate-600",
    };

  const isOwner = currentUserId && spot.authorId === currentUserId;

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(spot.audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onerror = () => {
        console.warn("Could not play audio track");
        setIsPlaying(false);
      };
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          console.warn("Audio playback failed:", e);
          setIsPlaying(false);
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
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col group relative border border-indigo-900/40 bg-[#0d1226]/70 shadow-xl">
      {/* Top Image & Floating Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-[#0a0e1c]">
        <img
          src={spot.imageUrl}
          alt={spot.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080b14] via-[#080b14]/30 to-transparent" />

        {/* Noise Level Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-md ${noiseConfig.badgeColor}`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            {noiseConfig.label}
          </span>
        </div>

        {/* Audio Preview Play Button in Twilight Style */}
        <button
          onClick={togglePlay}
          type="button"
          aria-label={isPlaying ? "หยุดฟังเสียงบรรยากาศ" : "ฟังเสียงบรรยากาศ"}
          className={`absolute bottom-3 right-3 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-95 cursor-pointer ${
            isPlaying
              ? "bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-purple-500/50 animate-pulse ring-2 ring-pink-400/50"
              : "bg-[#0b0f20]/90 text-cyan-300 hover:text-white hover:bg-gradient-to-tr hover:from-cyan-500 hover:to-purple-600 backdrop-blur-md border border-purple-500/30"
          }`}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-0.5 fill-current" />}
        </button>

        {/* Playing indicator bars */}
        {isPlaying && (
          <div className="absolute bottom-3 left-3 flex items-end gap-1 h-5 px-2.5 py-1 rounded-full bg-[#080b14]/85 backdrop-blur-md border border-purple-500/30">
            <span className="w-1 bg-gradient-to-t from-cyan-400 to-purple-400 animate-bounce h-2" style={{ animationDelay: "0ms" }} />
            <span className="w-1 bg-gradient-to-t from-cyan-400 to-pink-400 animate-bounce h-4" style={{ animationDelay: "150ms" }} />
            <span className="w-1 bg-gradient-to-t from-purple-400 to-pink-400 animate-bounce h-3" style={{ animationDelay: "300ms" }} />
            <span className="text-[10px] text-pink-300 font-medium ml-1">กำลังเล่น</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-indigo-300/70 mb-2">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{spot.location}</span>
          </div>

          <Link href={`/spots/${spot.id}`}>
            <h3 className="font-semibold text-lg text-slate-100 group-hover:text-purple-300 transition-colors line-clamp-1">
              {spot.title}
            </h3>
          </Link>

          <p className="text-indigo-200/60 text-sm mt-2 line-clamp-2 leading-relaxed">
            {spot.description}
          </p>
        </div>

        {/* Footer info & Actions */}
        <div className="pt-4 mt-4 border-t border-indigo-950/80 flex items-center justify-between text-xs text-indigo-300/70">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-cyan-300 border border-purple-500/30">
              <User className="w-3 h-3" />
            </div>
            <span className="truncate max-w-[120px]">
              {spot.author?.username || "นิรนาม"}
            </span>
          </div>

          {/* Action buttons (Owner or Detail view) */}
          <div className="flex items-center gap-2">
            {isOwner && (
              <>
                <Link
                  href={`/spots/${spot.id}/edit`}
                  className="p-1.5 rounded-lg hover:bg-purple-500/10 text-indigo-400 hover:text-cyan-300 transition"
                  title="แก้ไขจุดอ่านหนังสือ"
                >
                  <Edit3 className="w-4 h-4" />
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-1.5 rounded-lg hover:bg-rose-500/10 text-indigo-400 hover:text-rose-400 transition cursor-pointer"
                  title="ลบจุดอ่านหนังสือ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}

            <Link
              href={`/spots/${spot.id}`}
              className="text-cyan-400 hover:text-purple-300 font-medium ml-1 inline-flex items-center gap-1 transition"
            >
              ดูข้อมูล &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
