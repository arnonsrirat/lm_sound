"use client";

import { useAudio } from "@/context/AudioContext";
import { Play, Pause, Navigation, ExternalLink, Volume2, MapPin } from "lucide-react";
import NoiseGauge from "./NoiseGauge";

interface SpotDetailInteractiveProps {
  spot: {
    id: string;
    title: string;
    description: string;
    location: string;
    noiseLevel: string;
    imageUrl: string;
    audioUrl: string;
    latitude?: number | null;
    longitude?: number | null;
  };
}

export default function SpotDetailInteractive({ spot }: SpotDetailInteractiveProps) {
  const { isPlaying, activeTrack, playSpot, togglePlay } = useAudio();

  const isThisPlaying = isPlaying && activeTrack.id === spot.id;

  const handlePlayToggle = () => {
    if (isThisPlaying) {
      togglePlay();
    } else {
      playSpot({
        id: spot.id,
        title: spot.title,
        subtitle: spot.description,
        category: spot.noiseLevel,
        imageUrl: spot.imageUrl,
        audioUrl: spot.audioUrl,
        location: spot.location,
      });
    }
  };

  const handleNavigateGoogleMaps = () => {
    const lat = spot.latitude ?? 7.80822;
    const lng = spot.longitude ?? 99.93869;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-5">
      {/* Audio Engine Bar & Play Action */}
      <div className="p-4 sm:p-5 rounded-2xl border border-purple-500/30 bg-purple-950/40 backdrop-blur-xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            onClick={handlePlayToggle}
            type="button"
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
              isThisPlaying
                ? "purple-gradient-btn shadow-purple-500/50 ring-2 ring-purple-300 animate-pulse"
                : "bg-white text-zinc-950 hover:bg-purple-100 shadow-white/20"
            }`}
            title={isThisPlaying ? "หยุดชั่วคราว" : "เล่นเสียงบรรยากาศ"}
          >
            {isThisPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold text-white">
                {isThisPlaying ? "กำลังเล่นเสียงบรรยากาศ" : "ฟังเสียงบรรยากาศจริง"}
              </span>
              {isThisPlaying && (
                <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-[10px] font-bold">
                  LIVE
                </span>
              )}
            </div>
            <p className="text-xs text-purple-300/70 mt-0.5">
              เล่นต่อเนื่องข้ามหน้าผ่านระบบ Persistent Audio Engine
            </p>
          </div>
        </div>

        {/* Buttons Action Group */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleNavigateGoogleMaps}
            type="button"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-950/40 transition active:scale-95 cursor-pointer border border-cyan-400/30"
          >
            <Navigation className="w-4 h-4" />
            <span>นำทาง (Google Maps)</span>
          </button>
        </div>
      </div>

      {/* Noise Level Gauge Details */}
      <div className="p-4 rounded-2xl border border-purple-500/20 bg-[#120a26]/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-fuchsia-400" />
          <span className="text-xs font-semibold text-purple-200">ระดับเสียงบรรยากาศ:</span>
        </div>
        <NoiseGauge noiseLevel={spot.noiseLevel} />
      </div>
    </div>
  );
}
