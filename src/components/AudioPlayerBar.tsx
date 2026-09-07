"use client";

import React, { useState } from "react";
import { useAudio } from "@/context/AudioContext";
import SoundMixerModal from "./SoundMixerModal";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Sliders,
  Sparkles,
} from "lucide-react";

export default function AudioPlayerBar() {
  const {
    isPlaying,
    togglePlay,
    masterVolume,
    setMasterVolume,
    activeTrack,
    nextTrack,
    prevTrack,
    isMixerOpen,
    setIsMixerOpen,
  } = useAudio();

  const [prevNonZeroVol, setPrevNonZeroVol] = useState(0.75);

  const toggleMute = () => {
    if (masterVolume > 0) {
      setPrevNonZeroVol(masterVolume);
      setMasterVolume(0);
    } else {
      setMasterVolume(prevNonZeroVol || 0.5);
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/90 backdrop-blur-2xl border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          {/* Left Side: Track Info & Animated Equalizer */}
          <div className="flex items-center gap-3.5 min-w-0 w-1/4 sm:w-1/3">
            <div className="relative group flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-500/20 to-indigo-500/20 border border-white/10 shrink-0 overflow-hidden">
              {isPlaying ? (
                /* Animated Equalizer Bars */
                <div className="flex items-end gap-[3px] h-5">
                  <span className="w-1 bg-teal-400 rounded-full animate-[bounce_0.8s_infinite_ease-in-out]" />
                  <span className="w-1 bg-teal-300 rounded-full animate-[bounce_1.2s_infinite_ease-in-out_0.2s]" />
                  <span className="w-1 bg-indigo-400 rounded-full animate-[bounce_0.9s_infinite_ease-in-out_0.4s]" />
                  <span className="w-1 bg-teal-400 rounded-full animate-[bounce_1.1s_infinite_ease-in-out_0.1s]" />
                </div>
              ) : (
                <Sparkles className="w-5 h-5 text-teal-400/80 group-hover:scale-110 transition-transform" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-white truncate">
                  {activeTrack.title}
                </h4>
                <span className="hidden md:inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
                  {activeTrack.category}
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate mt-0.5">
                {activeTrack.subtitle}
              </p>
            </div>
          </div>

          {/* Center: Playback Controls */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 flex-1">
            <button
              onClick={prevTrack}
              title="แทร็กก่อนหน้า"
              className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            {/* Glowing Big Play/Pause Button */}
            <button
              onClick={togglePlay}
              title={isPlaying ? "หยุดชั่วคราว" : "เล่นเสียงบรรยากาศ"}
              className={`flex items-center justify-center w-12 h-12 rounded-full text-white shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer ${
                isPlaying
                  ? "bg-gradient-to-r from-teal-500 to-indigo-600 shadow-teal-500/30 hover:shadow-teal-500/50"
                  : "bg-white text-zinc-950 hover:bg-zinc-100 shadow-white/20"
              }`}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              title="แทร็กถัดไป"
              className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Right Side: Master Volume & Mixer Trigger */}
          <div className="flex items-center justify-end gap-3 w-1/4 sm:w-1/3">
            {/* Master Volume Slider (Hidden on small screens) */}
            <div className="hidden sm:flex items-center gap-2.5">
              <button
                onClick={toggleMute}
                className="text-zinc-400 hover:text-white transition-colors"
                title={masterVolume === 0 ? "เปิดเสียง" : "ปิดเสียง"}
              >
                {masterVolume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={masterVolume}
                onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                className="w-20 lg:w-28 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                title={`ระดับเสียงรวม: ${Math.round(masterVolume * 100)}%`}
              />
            </div>

            {/* Sound Mixer Drawer Button */}
            <button
              onClick={() => setIsMixerOpen(!isMixerOpen)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                isMixerOpen
                  ? "bg-teal-500/20 border-teal-500/40 text-teal-300 shadow-sm shadow-teal-500/20"
                  : "bg-zinc-900 border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white"
              }`}
              title="เปิดหน้าต่าง Sound Mixer"
            >
              <Sliders className="w-4 h-4 text-teal-400" />
              <span className="hidden md:inline">Mixer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mixer Modal */}
      <SoundMixerModal />
    </>
  );
}
