"use client";

import { useAudio } from "@/context/AudioContext";
import { Play, Pause, Navigation, Volume2 } from "lucide-react";
import NoiseGauge from "./NoiseGauge";
import InteractiveWaveform from "./InteractiveWaveform";
import { AmenityBadges } from "./AmenityBadges";

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
    amenities?: string[];
  };
}

export default function SpotDetailInteractive({ spot }: SpotDetailInteractiveProps) {
  const {
    isPlaying,
    activeTrack,
    playSpot,
    togglePlay,
    currentTime,
    duration,
    isLiveStream,
    seek,
    skipTime,
  } = useAudio();

  const isThisPlaying = isPlaying && activeTrack.id === spot.id;

  const formatTime = (secs: number) => {
    if (!isFinite(secs) || isNaN(secs) || secs < 0) return "0:00";
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  const handleScrubClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isLiveStream || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seek(ratio * duration);
  };

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
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-5">
      <AmenityBadges amenities={spot.amenities} />
      {/* Audio Engine Bar & Play Action with Living Sound State */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border backdrop-blur-xl transition-all duration-300 flex flex-col gap-4 ${
          isThisPlaying
            ? "border-pink-500/70 shadow-[0_0_30px_rgba(236,72,153,0.3)] ring-2 ring-pink-500/40 living-card-active bg-purple-950/60"
            : "border-purple-500/30 bg-purple-950/40 shadow-lg"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              {isThisPlaying && (
                <div className="absolute -inset-1.5 rounded-full border-2 border-pink-400/60 sound-ripple pointer-events-none" />
              )}
              <button
                onClick={handlePlayToggle}
                type="button"
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer shrink-0 relative z-10 ${
                  isThisPlaying
                    ? "bg-gradient-to-tr from-pink-500 to-purple-600 shadow-purple-500/50 ring-2 ring-pink-300 animate-pulse"
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
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-white">
                  {isThisPlaying ? "กำลังถ่ายทอดเสียงบรรยากาศสด" : "ฟังเสียงบรรยากาศจริง"}
                </span>
                {isThisPlaying && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-400/40 text-[10px] font-bold">
                    <div className="flex items-end gap-0.5 h-2.5">
                      <span className="w-0.5 bg-pink-400 rounded-full animate-[waveBounce_0.8s_ease-in-out_infinite]" />
                      <span className="w-0.5 bg-fuchsia-400 rounded-full animate-[waveBounce_1.1s_ease-in-out_infinite_0.15s]" />
                      <span className="w-0.5 bg-cyan-400 rounded-full animate-[waveBounce_0.9s_ease-in-out_infinite_0.3s]" />
                    </div>
                    <span>LIVE SOUND</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-purple-300/70 mt-0.5">
                เล่นต่อเนื่องข้ามหน้าผ่านระบบ Persistent Audio Engine
              </p>
            </div>
          </div>

          {/* Dynamic Sound Waveform Strip & Google Maps Action */}
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <InteractiveWaveform
              isPlaying={isThisPlaying}
              barCount={24}
              heightClass="h-8"
              className="hidden xs:flex"
            />

            <button
              onClick={handleNavigateGoogleMaps}
              type="button"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-950/40 transition active:scale-95 cursor-pointer border border-cyan-400/30 shrink-0"
            >
              <Navigation className="w-4 h-4" />
              <span>นำทาง (Google Maps)</span>
            </button>
          </div>
        </div>

        {/* Track Duration & Seek Scrubber (shown when active) */}
        {isThisPlaying && (
          <div className="w-full pt-3 mt-1 border-t border-purple-500/20 flex flex-col gap-1.5 animate-in fade-in duration-300">
            <div className="flex items-center justify-between text-xs font-mono text-purple-300">
              <div className="flex items-center gap-1.5">
                <span className="text-white font-bold">{formatTime(currentTime)}</span>
                <span className="text-purple-400/50">/</span>
                <span className="text-purple-300/80">
                  {isLiveStream || duration <= 0 ? "Live Stream ∞" : formatTime(duration)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => skipTime(-5)}
                  type="button"
                  title="ย้อนหลัง 5 วินาที"
                  className="px-2 py-0.5 rounded bg-purple-900/40 hover:bg-purple-800/60 text-[10px] text-purple-200 border border-purple-500/30 transition cursor-pointer"
                >
                  -5s
                </button>
                <button
                  onClick={() => skipTime(5)}
                  type="button"
                  title="ข้ามไปข้างหน้า 5 วินาที"
                  className="px-2 py-0.5 rounded bg-purple-900/40 hover:bg-purple-800/60 text-[10px] text-purple-200 border border-purple-500/30 transition cursor-pointer"
                >
                  +5s
                </button>
              </div>
            </div>

            {/* Scrubber Track */}
            <div
              onClick={handleScrubClick}
              className="w-full h-2 bg-purple-950/80 rounded-full cursor-pointer overflow-hidden relative group border border-purple-500/20"
              title="คลิกเพื่อเลื่อนตำแหน่งเวลา"
            >
              {isLiveStream || duration <= 0 ? (
                <div className="h-full w-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 animate-pulse" />
              ) : (
                <div
                  className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 rounded-full relative transition-[width] duration-150"
                  style={{
                    width: `${duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0}%`,
                  }}
                />
              )}
            </div>
          </div>
        )}
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
