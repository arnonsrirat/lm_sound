"use client";

import React from "react";
import { useAudio } from "@/context/AudioContext";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Sliders,
  Sparkles,
  Music2,
  MapPin,
  X,
  CloudRain,
  Radio,
  Wind,
  Waves,
  Headphones,
} from "lucide-react";

export default function NowPlayingSidebar() {
  const {
    isPlaying,
    togglePlay,
    masterVolume,
    setMasterVolume,
    activeTrack,
    nextTrack,
    prevTrack,
    mixerChannels,
    setChannelVolume,
    toggleChannel,
    isNowPlayingOpen,
    setIsNowPlayingOpen,
  } = useAudio();

  const toggleMute = () => {
    if (masterVolume > 0) {
      setMasterVolume(0);
    } else {
      setMasterVolume(0.75);
    }
  };

  const getChannelIcon = (id: string) => {
    switch (id) {
      case "rain":
        return <CloudRain className="w-3.5 h-3.5 text-cyan-400" />;
      case "whitenoise":
        return <Radio className="w-3.5 h-3.5 text-purple-300" />;
      case "ambient":
        return <Wind className="w-3.5 h-3.5 text-pink-400" />;
      case "waves":
        return <Waves className="w-3.5 h-3.5 text-indigo-300" />;
      default:
        return <Music2 className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  if (!isNowPlayingOpen) {
    return (
      <button
        onClick={() => setIsNowPlayingOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full purple-gradient-btn shadow-2xl hover:scale-105 transition-all text-xs font-semibold cursor-pointer border border-purple-400/40"
        title="เปิดแผงควบคุมเสียง (เวลา sound เล่น)"
      >
        <Headphones className="w-4 h-4 animate-bounce" />
        <span>เวลา sound เล่น</span>
        {isPlaying && (
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        )}
      </button>
    );
  }

  return (
    <aside className="w-full xl:w-80 2xl:w-88 shrink-0 flex flex-col glass-panel rounded-3xl p-5 border border-purple-500/25 shadow-2xl relative overflow-hidden transition-all duration-300">
      {/* Background ambient lighting */}
      <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-pink-600/10 blur-3xl pointer-events-none" />

      {/* Top Header in Panel */}
      <div className="flex items-center justify-between pb-4 border-b border-purple-500/15 mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Music2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider purple-gradient-text">
              เวลา Sound เล่น
            </h3>
            <p className="text-[10px] text-purple-300/60 flex items-center gap-1">
              {isPlaying ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>กำลังถ่ายทอดเสียงสด</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
                  <span>หยุดชั่วคราว</span>
                </>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsNowPlayingOpen(false)}
          className="p-1.5 rounded-full text-purple-300/70 hover:text-white hover:bg-purple-500/20 transition cursor-pointer"
          title="ย่อแผงควบคุม"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Artwork / Vinyl Cover */}
      <div className="relative group w-full aspect-square max-h-56 rounded-2xl overflow-hidden border border-purple-500/30 bg-[#120a26] shadow-xl mb-4 flex items-center justify-center">
        {activeTrack.imageUrl ? (
          <img
            src={activeTrack.imageUrl}
            alt={activeTrack.title}
            className={`w-full h-full object-cover transition-all duration-700 ${
              isPlaying ? "scale-105 brightness-95" : "scale-100 brightness-75"
            }`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900/60 to-indigo-950/80 flex items-center justify-center">
            <Music2 className="w-12 h-12 text-purple-400/40" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#0d071c] via-transparent to-transparent opacity-80" />

        {/* Dynamic Center Vinyl / Equalizer Indicator */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {isPlaying ? (
            <div className="flex items-end gap-1.5 bg-black/60 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-purple-400/30 shadow-lg">
              <span className="w-1.5 bg-cyan-400 rounded-full eq-bar-1" />
              <span className="w-1.5 bg-purple-400 rounded-full eq-bar-2" />
              <span className="w-1.5 bg-pink-400 rounded-full eq-bar-3" />
              <span className="w-1.5 bg-cyan-300 rounded-full eq-bar-4" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-purple-950/70 backdrop-blur-md border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-md">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
          )}
        </div>

        {/* Category Pill on Image */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-purple-950/80 backdrop-blur-md text-purple-200 border border-purple-400/30">
            {activeTrack.category}
          </span>
        </div>
      </div>

      {/* Track Info */}
      <div className="mb-4">
        <h4 className="text-base font-bold text-foreground tracking-tight line-clamp-1">
          {activeTrack.title}
        </h4>
        <div className="flex items-center gap-1.5 text-xs text-purple-400 mt-1">
          {activeTrack.location ? (
            <>
              <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="line-clamp-1 font-medium">{activeTrack.location}</span>
            </>
          ) : (
            <span className="line-clamp-1 font-medium">{activeTrack.subtitle}</span>
          )}
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-4 mb-5">
        <button
          onClick={prevTrack}
          className="p-2 text-foreground/80 hover:text-purple-400 hover:bg-purple-500/20 rounded-full transition cursor-pointer"
          title="เสียงก่อนหน้า"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        <button
          onClick={togglePlay}
          className="w-13 h-13 rounded-full purple-gradient-btn flex items-center justify-center text-white shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer"
          title={isPlaying ? "หยุดเสียงชั่วคราว" : "เล่นเสียง"}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          )}
        </button>

        <button
          onClick={nextTrack}
          className="p-2 text-foreground/80 hover:text-purple-400 hover:bg-purple-500/20 rounded-full transition cursor-pointer"
          title="เสียงถัดไป"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Master Volume Bar */}
      <div className="p-3 rounded-2xl bg-purple-950/25 border border-purple-500/20 mb-5">
        <div className="flex items-center justify-between text-xs text-foreground mb-2">
          <button
            onClick={toggleMute}
            className="flex items-center gap-1.5 text-foreground hover:text-purple-500 transition cursor-pointer"
          >
            {masterVolume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-purple-500" />
            )}
            <span className="text-[11px] font-bold">ระดับเสียงรวม</span>
          </button>
          <span className="font-mono text-[11px] text-foreground font-bold">
            {Math.round(masterVolume * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={masterVolume}
          onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-purple-900/40 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
      </div>

      {/* Sound Mixer Channels */}
      <div className="space-y-3 pt-3 border-t border-purple-500/15">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-purple-500" />
            <span>Sound Mixer ผสมเสียง</span>
          </span>
          <span className="text-[10px] text-purple-400 font-bold uppercase">Real-time</span>
        </div>

        <div className="space-y-2.5">
          {mixerChannels.map((channel) => (
            <div
              key={channel.id}
              className="flex flex-col gap-1 p-2 rounded-xl bg-purple-950/20 border border-purple-500/15 hover:border-purple-500/35 transition"
            >
              <div className="flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => toggleChannel(channel.id)}
                  className="flex items-center gap-1.5 text-foreground hover:text-purple-500 transition cursor-pointer"
                >
                  {getChannelIcon(channel.id)}
                  <span className={channel.enabled ? "font-semibold" : "line-through text-purple-400/50"}>
                    {channel.name}
                  </span>
                </button>
                <span className="font-mono text-[10px] text-foreground font-bold">
                  {channel.enabled ? `${Math.round(channel.volume * 100)}%` : "ปิด"}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={channel.volume}
                disabled={!channel.enabled}
                onChange={(e) => setChannelVolume(channel.id, parseFloat(e.target.value))}
                className="w-full h-1 bg-purple-900/40 rounded appearance-none cursor-pointer accent-purple-500 disabled:opacity-30"
              />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
