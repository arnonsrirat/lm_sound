"use client";

import React from "react";
import { useAudio, AMBIENCE_PRESETS } from "@/context/AudioContext";
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
  History,
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
    applyAmbiencePreset,
    activePresetId,
    recentlyPlayed,
    clearRecentlyPlayed,
    playSpot,
    currentTime,
    duration,
    isLiveStream,
    seek,
  } = useAudio();
  const [mixerEnabled, setMixerEnabled] = React.useState(false);

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
  };

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
        className="fixed bottom-20 right-3 z-40 flex items-center gap-2 px-3 py-2.5 rounded-full purple-gradient-btn shadow-2xl hover:scale-105 transition-all text-xs font-semibold cursor-pointer border border-purple-400/40 xl:bottom-6 xl:right-6"
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
    <aside className="fixed inset-x-2 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 flex max-h-[calc(100dvh-6rem)] w-auto min-w-0 shrink-0 flex-col overflow-y-auto overscroll-contain touch-pan-y isolate rounded-3xl border border-purple-500/25 bg-[var(--card-bg)]/95 p-4 shadow-2xl backdrop-blur-2xl transition-all duration-300 xl:fixed xl:right-6 xl:top-20 xl:bottom-auto xl:h-[calc(100dvh-6rem)] xl:max-h-[calc(100dvh-6rem)] xl:w-72 xl:overflow-y-auto xl:overscroll-contain xl:rounded-3xl xl:bg-[var(--card-bg)]/95 xl:p-4 2xl:w-80 2xl:p-5">
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
      <div className="relative group w-full aspect-[16/10] max-h-44 rounded-2xl overflow-hidden border border-purple-500/30 bg-[#120a26] shadow-xl mb-3 flex items-center justify-center xl:aspect-square xl:max-h-48">
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
      <div className="mb-3">
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
      <div className="flex items-center justify-center gap-3 mb-3">
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

      <div className="mb-3 rounded-2xl border border-purple-500/20 bg-purple-950/25 px-3 py-2">
        <div className="mb-1.5 flex items-center justify-between text-[10px] text-purple-200/70">
          <span>{isLiveStream ? "เสียงสด / วนบรรยากาศ" : formatTime(currentTime)}</span>
          <span>{isLiveStream ? "LIVE" : formatTime(duration)}</span>
        </div>
        <input
          type="range"
          min="0"
          max={Math.max(duration, 0.01)}
          step="0.1"
          value={isLiveStream ? 0 : Math.min(currentTime, duration || 0)}
          disabled={isLiveStream || duration <= 0}
          onChange={(event) => seek(Number(event.target.value))}
          aria-label="เลื่อนตำแหน่งเพลง"
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-purple-900/50 accent-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-40"
        />
      </div>

      {/* Master Volume Bar */}
      <div className="p-3 rounded-2xl bg-purple-950/25 border border-purple-500/20 mb-3">
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
      <details
        open={mixerEnabled}
        onToggle={(event) => setMixerEnabled(event.currentTarget.open)}
        className="space-y-3 pt-3 border-t border-purple-500/15 group"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between py-2">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-purple-500" />
            <span>เพิ่มมิกซ์เสียง</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-[10px] text-purple-300/70">{mixerEnabled ? "เปิดใช้งาน" : "ต้องการเพิ่มเสียงไหม?"}</span>
            <span className={`relative h-5 w-9 rounded-full transition-colors ${mixerEnabled ? "bg-emerald-500" : "bg-purple-900/70"}`} aria-hidden="true">
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${mixerEnabled ? "translate-x-4" : "translate-x-0.5"}`} />
            </span>
          </span>
        </summary>

        {/* Quick Focus Recipe 1-Click Chips */}
        <div className="grid grid-cols-2 gap-1.5">
          {AMBIENCE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyAmbiencePreset(preset.id)}
              type="button"
              title={`${preset.name} (${preset.thaiName}) - ${preset.description}`}
              className={`px-2 py-1.5 rounded-xl text-[10px] font-bold text-left transition flex items-center gap-1.5 border cursor-pointer ${
                activePresetId === preset.id
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-pink-400 shadow-sm shadow-purple-900/40 scale-[1.02]"
                  : "bg-purple-950/40 hover:bg-purple-800/40 text-purple-200 border-purple-500/20 hover:border-purple-400/40"
              }`}
            >
              <span className="text-xs">{preset.emoji}</span>
              <span className="truncate">{preset.name}</span>
            </button>
          ))}
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

        {/* Recently Played History Queue */}
        {recentlyPlayed && recentlyPlayed.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-200">
                <History className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>เพิ่งเปิดฟังล่าสุด</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                  {recentlyPlayed.length}
                </span>
              </div>
              <button
                type="button"
                onClick={clearRecentlyPlayed}
                className="text-[10px] text-purple-400/60 hover:text-red-400 transition cursor-pointer"
                title="ล้างประวัติการฟัง"
              >
                ล้าง
              </button>
            </div>
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-0.5">
              {recentlyPlayed.map((track) => {
                const isCurrent = track.id === activeTrack.id;
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => playSpot(track)}
                    className={`w-full flex items-center gap-2 p-1.5 rounded-xl text-left transition border cursor-pointer ${
                      isCurrent
                        ? "bg-purple-600/30 border-purple-400/50 text-white shadow-sm ring-1 ring-purple-400/30"
                        : "bg-purple-950/20 border-purple-500/15 hover:bg-purple-900/30 text-purple-200/90"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 bg-purple-900/50 flex items-center justify-center">
                      {track.imageUrl ? (
                        <img
                          src={track.imageUrl}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Music2 className="w-3.5 h-3.5 text-purple-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold truncate leading-tight">
                        {track.title}
                      </p>
                      <p className="text-[9px] text-purple-300/60 truncate leading-tight">
                        {track.location || track.subtitle}
                      </p>
                    </div>
                    {isCurrent && isPlaying ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0 mr-1" />
                    ) : (
                      <Play className="w-3 h-3 text-purple-400/50 group-hover:text-white shrink-0 mr-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </details>
    </aside>
  );
}
