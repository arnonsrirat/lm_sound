"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useAudio, SLEEP_TIMER_OPTIONS } from "@/context/AudioContext";
import InteractiveWaveform from "./InteractiveWaveform";
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Sliders,
  Sparkles,
  Headphones,
  Timer,
  Clock,
  Radio,
  CloudRain,
  Wind,
  Waves,
  SlidersHorizontal,
  RotateCcw,
  Flame,
} from "lucide-react";

interface MobilePlayerSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobilePlayerSheet({
  isOpen,
  onClose,
}: MobilePlayerSheetProps) {
  const {
    isPlaying,
    togglePlay,
    activeTrack,
    nextTrack,
    prevTrack,
    masterVolume,
    setMasterVolume,
    mixerChannels,
    setChannelVolume,
    toggleChannel,
    currentTime,
    duration,
    isLiveStream,
    seek,
    skipTime,
    acousticMode,
    acousticSpaces,
    setAcousticSpace,
    binauralMode,
    binauralPresets,
    setBinauralMode,
    sleepTimerMinutes,
    sleepTimerRemaining,
    setSleepTimer,
    isSynthesizerFallback,
    eqPresetId,
    eqBands,
    eqPresets,
    setEqPreset,
    setEqBand,
    resetEq,
    pomodoroPhase,
    pomodoroSecondsLeft,
    startPomodoro,
    studyStats,
    setIsStatsModalOpen,
  } = useAudio();

  const [activeTab, setActiveTab] = useState<"player" | "mixer" | "brainwave">(
    "player"
  );
  const [isTimerDropdownOpen, setIsTimerDropdownOpen] = useState(false);

  if (!isOpen) return null;

  // Format seconds to mm:ss
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

  const getChannelIcon = (id: string) => {
    switch (id) {
      case "rain":
        return <CloudRain className="w-4 h-4 text-purple-400" />;
      case "whitenoise":
        return <Radio className="w-4 h-4 text-fuchsia-400" />;
      case "ambient":
        return <Wind className="w-4 h-4 text-pink-400" />;
      case "waves":
        return <Waves className="w-4 h-4 text-cyan-400" />;
      default:
        return <Sliders className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Backdrop overlay */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Bottom Sheet */}
      <div className="relative z-10 w-full max-h-[92vh] flex flex-col bg-gradient-to-b from-[#1a0f30] to-[#0d071a] border-t border-purple-500/40 rounded-t-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-250">
        {/* Drag Handle & Header */}
        <div className="pt-3 pb-2 px-6 flex items-center justify-between border-b border-purple-500/20 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-purple-300/80 font-semibold">
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
            <span>กำลังเล่น • NOW PLAYING</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsStatsModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-amber-300 text-[11px] font-bold shadow-sm"
              title="สถิติการอ่านและสตรีค"
            >
              <Flame className="w-3 h-3 text-orange-400 animate-pulse" />
              <span>{studyStats.streakDays || 0} วัน</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-purple-950/60 text-purple-300 hover:text-white border border-purple-500/30 transition cursor-pointer"
              title="ยุบเครื่องเล่นลง"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-purple-500/20 bg-purple-950/40 shrink-0">
          <button
            onClick={() => setActiveTab("player")}
            className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === "player"
                ? "border-fuchsia-400 text-white bg-purple-600/20"
                : "border-transparent text-purple-300/70 hover:text-purple-200"
            }`}
          >
            เครื่องเล่นเสียง
          </button>
          <button
            onClick={() => setActiveTab("mixer")}
            className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === "mixer"
                ? "border-fuchsia-400 text-white bg-purple-600/20"
                : "border-transparent text-purple-300/70 hover:text-purple-200"
            }`}
          >
            ผสมเสียง (Mixer)
          </button>
          <button
            onClick={() => setActiveTab("brainwave")}
            className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === "brainwave"
                ? "border-fuchsia-400 text-white bg-purple-600/20"
                : "border-transparent text-purple-300/70 hover:text-purple-200"
            }`}
          >
            คลื่นสมอง มิติ & EQ
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {activeTab === "player" && (
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Large Spot Cover Image with Living Ambient Glow */}
              <div className="relative w-56 h-56 rounded-3xl overflow-hidden shadow-2xl border-2 border-purple-500/40 group mt-1">
                {activeTrack.imageUrl ? (
                  <Image
                    src={activeTrack.imageUrl}
                    alt={activeTrack.title}
                    fill
                    className={`object-cover transition-transform duration-700 ${
                      isPlaying ? "scale-105" : "scale-100 opacity-80"
                    }`}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-purple-900 to-indigo-900 flex items-center justify-center">
                    <Sparkles className="w-16 h-16 text-purple-300/50 animate-pulse" />
                  </div>
                )}
                {isPlaying && (
                  <div className="absolute inset-0 ring-4 ring-pink-400/40 rounded-3xl pointer-events-none sound-ripple" />
                )}
              </div>

              {/* Title, Subtitle & Badges */}
              <div className="w-full space-y-1">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {activeTrack.title}
                  </h3>
                  {isSynthesizerFallback && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      Synth
                    </span>
                  )}
                </div>
                <p className="text-xs text-purple-300/70">
                  {activeTrack.location || activeTrack.subtitle}
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {activeTrack.category}
                  </span>
                  {binauralMode !== "off" && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-400/30 font-medium">
                      🧠 {binauralMode.toUpperCase()}
                    </span>
                  )}
                  {acousticMode !== "natural" && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-medium">
                      ✨ {acousticMode}
                    </span>
                  )}
                </div>
              </div>

              {/* Harmonic Spectrum Visualizer (32 Bars Full-width) */}
              <div className="w-full py-2 flex items-center justify-center">
                <InteractiveWaveform
                  isPlaying={isPlaying}
                  barCount={28}
                  heightClass="h-10"
                  colorTheme="fuchsia"
                />
              </div>

              {/* Seek Progress Scrubber Bar */}
              <div className="w-full space-y-1.5 pt-1">
                <div
                  onClick={handleScrubClick}
                  className="w-full h-2.5 bg-purple-950/80 rounded-full cursor-pointer overflow-hidden relative group border border-purple-500/30"
                  title="แตะเพื่อเลื่อนเวลา"
                >
                  {isLiveStream || duration <= 0 ? (
                    <div
                      className={`h-full w-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 ${
                        isPlaying ? "animate-pulse" : "opacity-40"
                      }`}
                    />
                  ) : (
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-cyan-400 rounded-full relative transition-[width] duration-150"
                      style={{
                        width: `${
                          duration > 0
                            ? Math.min(100, (currentTime / duration) * 100)
                            : 0
                        }%`,
                      }}
                    >
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-lg ring-2 ring-pink-400" />
                    </div>
                  )}
                </div>

                {/* Time Indicators & Jump Controls */}
                <div className="flex items-center justify-between text-xs font-mono text-purple-300/80 px-1">
                  <span>{formatTime(currentTime)}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => skipTime(-5)}
                      className="px-2 py-0.5 rounded-md bg-purple-900/40 text-[11px] text-purple-200 border border-purple-500/20 active:scale-95"
                    >
                      -5s
                    </button>
                    <button
                      onClick={() => skipTime(5)}
                      className="px-2 py-0.5 rounded-md bg-purple-900/40 text-[11px] text-purple-200 border border-purple-500/20 active:scale-95"
                    >
                      +5s
                    </button>
                  </div>
                  <span>
                    {isLiveStream || duration <= 0
                      ? "Live ∞"
                      : formatTime(duration)}
                  </span>
                </div>
              </div>

              {/* Large Thumb-Friendly Playback Controls */}
              <div className="flex items-center justify-center gap-6 pt-2">
                <button
                  onClick={prevTrack}
                  className="p-3 text-purple-300 hover:text-white rounded-full transition active:scale-95 cursor-pointer"
                  title="แทร็กก่อนหน้า"
                >
                  <SkipBack className="w-6 h-6" />
                </button>

                {/* Giant Play/Pause Button */}
                <button
                  onClick={togglePlay}
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl transition-all transform active:scale-95 cursor-pointer ${
                    isPlaying
                      ? "purple-gradient-btn shadow-purple-500/50 ring-4 ring-pink-400/40"
                      : "bg-white text-zinc-950 shadow-white/30"
                  }`}
                  title={isPlaying ? "หยุดชั่วคราว" : "เล่นเสียง"}
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-current" />
                  ) : (
                    <Play className="w-7 h-7 fill-current ml-1" />
                  )}
                </button>

                <button
                  onClick={nextTrack}
                  className="p-3 text-purple-300 hover:text-white rounded-full transition active:scale-95 cursor-pointer"
                  title="แทร็กถัดไป"
                >
                  <SkipForward className="w-6 h-6" />
                </button>
              </div>

              {/* Sleep Timer, Pomodoro & Master Volume Bar */}
              <div className="w-full pt-4 border-t border-purple-500/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {/* Sleep Timer Pill */}
                  <div className="relative">
                    <button
                      onClick={() => setIsTimerDropdownOpen(!isTimerDropdownOpen)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        sleepTimerRemaining !== null
                          ? "bg-fuchsia-600/30 border-fuchsia-400 text-fuchsia-200"
                          : "bg-purple-950/60 border-purple-500/30 text-purple-300"
                      }`}
                    >
                      <Timer className="w-3.5 h-3.5" />
                      <span>
                        {sleepTimerRemaining !== null
                          ? formatTime(sleepTimerRemaining)
                          : "ตั้งเวลา"}
                      </span>
                    </button>

                    {isTimerDropdownOpen && (
                      <div className="absolute left-0 bottom-full mb-2 w-44 glass-panel border border-purple-500/40 rounded-2xl p-2 shadow-2xl z-20 space-y-1">
                        {SLEEP_TIMER_OPTIONS.map((opt) => (
                          <button
                            key={String(opt.minutes)}
                            onClick={() => {
                              setSleepTimer(opt.minutes);
                              setIsTimerDropdownOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                              sleepTimerMinutes === opt.minutes
                                ? "bg-purple-600 text-white"
                                : "text-purple-200 hover:bg-white/10"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pomodoro Quick Pill */}
                  {pomodoroPhase !== "idle" && pomodoroSecondsLeft !== null ? (
                    <button
                      onClick={() => setActiveTab("mixer")}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-rose-400/40 bg-rose-950/60 text-rose-200 animate-pulse cursor-pointer"
                      title="กำลังจับเวลา Pomodoro (แตะเพื่อดูรายละเอียด)"
                    >
                      <span>{pomodoroPhase === "focus" ? "🍅" : "☕"}</span>
                      <span>{formatTime(pomodoroSecondsLeft)}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => startPomodoro("classic")}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-purple-500/30 bg-purple-950/60 text-purple-300 hover:text-white cursor-pointer"
                      title="เริ่มรอบ Pomodoro 25/5 นาที"
                    >
                      <span>🍅</span>
                      <span>Pomodoro</span>
                    </button>
                  )}
                </div>

                {/* Master Volume Slider */}
                <div className="flex items-center gap-2 flex-1">
                  <Volume2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={masterVolume}
                    onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-purple-950/80 rounded-lg appearance-none cursor-pointer accent-purple-400"
                  />
                  <span className="text-[10px] font-mono text-purple-300 w-8 text-right">
                    {Math.round(masterVolume * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "mixer" && (
            <div className="space-y-3">
              <p className="text-xs text-purple-300/80">
                ปรับระดับเสียงบรรยากาศแต่ละช่องเพื่อสร้างสมาธิเฉพาะคุณ:
              </p>
              {mixerChannels.map((ch) => (
                <div
                  key={ch.id}
                  className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/20 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getChannelIcon(ch.id)}
                      <span className="text-xs font-bold text-white">
                        {ch.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-purple-300">
                        {ch.enabled ? `${Math.round(ch.volume * 100)}%` : "Off"}
                      </span>
                      <button
                        onClick={() => toggleChannel(ch.id)}
                        className="p-1 rounded bg-purple-900/40 text-purple-300 text-xs"
                      >
                        {ch.enabled ? (
                          <Volume2 className="w-3.5 h-3.5" />
                        ) : (
                          <VolumeX className="w-3.5 h-3.5 text-red-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={ch.enabled ? ch.volume : 0}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setChannelVolume(ch.id, v);
                      if (!ch.enabled && v > 0) toggleChannel(ch.id);
                    }}
                    className="w-full h-1.5 bg-purple-950/80 rounded-lg appearance-none cursor-pointer accent-purple-400"
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === "brainwave" && (
            <div className="space-y-4">
              {/* Binaural Beats Quick Selector */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-pink-300">
                  <Headphones className="w-4 h-4" />
                  <span>คลื่นความถี่สมอง (Binaural Beats)</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {binauralPresets.map((p) => {
                    const isSelected = binauralMode === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() =>
                          setBinauralMode(isSelected ? "off" : p.id)
                        }
                        className={`p-2.5 rounded-xl border text-left transition ${
                          isSelected
                            ? "bg-pink-950/50 border-pink-400 text-white"
                            : "bg-purple-950/40 border-purple-500/20 text-purple-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">
                            {p.emoji} {p.name}
                          </span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                          )}
                        </div>
                        <p className="text-[10px] text-purple-300/70 mt-0.5">
                          {p.benefits}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Spatial Acoustics Mode */}
              <div className="space-y-2 pt-2 border-t border-purple-500/20">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                  <Sparkles className="w-4 h-4" />
                  <span>มิติเสียงอะคูสติก (Spatial Acoustics)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {acousticSpaces.map((s) => {
                    const isSelected = acousticMode === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setAcousticSpace(s.id)}
                        className={`p-2.5 rounded-xl border text-left transition ${
                          isSelected
                            ? "bg-cyan-950/50 border-cyan-400 text-white"
                            : "bg-purple-950/40 border-purple-500/20 text-purple-200"
                        }`}
                      >
                        <div className="text-base">{s.emoji}</div>
                        <div className="text-xs font-bold mt-1">
                          {s.thaiName}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Studio Equalizer & Tone Presets */}
              <div className="space-y-2 pt-2 border-t border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>อีควอไลเซอร์ (Studio Equalizer)</span>
                  </div>
                  <button
                    onClick={resetEq}
                    type="button"
                    className="inline-flex items-center gap-1 text-[10px] text-purple-300/70 hover:text-amber-300"
                    title="รีเซ็ตเป็น Flat"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>คืนค่า Flat</span>
                  </button>
                </div>

                {/* EQ Presets */}
                <div className="grid grid-cols-2 xs:grid-cols-3 gap-1.5">
                  {eqPresets.map((preset) => {
                    const isSelected = eqPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => setEqPreset(preset.id)}
                        type="button"
                        className={`p-2 rounded-xl border text-left transition flex flex-col justify-between ${
                          isSelected
                            ? "bg-amber-950/40 border-amber-400 text-white shadow-sm"
                            : "bg-purple-950/40 border-purple-500/20 text-purple-200/90"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span>{preset.emoji}</span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          )}
                        </div>
                        <div className="text-[10px] font-bold mt-1 truncate">
                          {preset.thaiName}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* 3-Band Sliders */}
                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 space-y-2 mt-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-amber-300">ทุ้ม (Bass 120Hz)</span>
                      <span className="font-mono text-white">
                        {eqBands.bass > 0 ? `+${eqBands.bass}` : eqBands.bass} dB
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      step="1"
                      value={eqBands.bass}
                      onChange={(e) => setEqBand("bass", parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-purple-950/80 rounded-lg appearance-none accent-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-amber-300">กลาง (Mid 1kHz)</span>
                      <span className="font-mono text-white">
                        {eqBands.mid > 0 ? `+${eqBands.mid}` : eqBands.mid} dB
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      step="1"
                      value={eqBands.mid}
                      onChange={(e) => setEqBand("mid", parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-purple-950/80 rounded-lg appearance-none accent-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-amber-300">แหลม (Treble 6kHz)</span>
                      <span className="font-mono text-white">
                        {eqBands.treble > 0 ? `+${eqBands.treble}` : eqBands.treble} dB
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      step="1"
                      value={eqBands.treble}
                      onChange={(e) => setEqBand("treble", parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-purple-950/80 rounded-lg appearance-none accent-amber-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
