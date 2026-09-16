"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useAudio, SLEEP_TIMER_OPTIONS } from "@/context/AudioContext";
import SoundMixerModal from "./SoundMixerModal";
import KeyboardShortcutsModal from "./KeyboardShortcutsModal";
import InteractiveWaveform from "./InteractiveWaveform";
import MobilePlayerSheet from "./MobilePlayerSheet";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Sliders,
  Sparkles,
  Timer,
  Clock,
  Check,
  Keyboard,
  ChevronUp,
} from "lucide-react";

export default function AudioPlayerBar() {
  const pathname = usePathname();
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
    isNowPlayingOpen,
    sleepTimerMinutes,
    sleepTimerRemaining,
    setSleepTimer,
    isSynthesizerFallback,
    currentTime,
    duration,
    isLiveStream,
    seek,
    skipTime,
    pomodoroPhase,
    pomodoroSecondsLeft,
    isStatsModalOpen,
    setIsStatsModalOpen,
  } = useAudio();

  const [prevNonZeroVol, setPrevNonZeroVol] = useState(0.75);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isMobileVolumeOpen, setIsMobileVolumeOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [hudToast, setHudToast] = useState<string | null>(null);
  const hudTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showHud = useCallback((msg: string) => {
    setHudToast(msg);
    if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
    hudTimerRef.current = setTimeout(() => {
      setHudToast(null);
    }, 1300);
  }, []);

  const toggleMute = useCallback(() => {
    if (masterVolume > 0) {
      setPrevNonZeroVol(masterVolume);
      setMasterVolume(0);
    } else {
      setMasterVolume(prevNonZeroVol || 0.5);
    }
  }, [masterVolume, prevNonZeroVol, setMasterVolume]);

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
    const targetSeconds = ratio * duration;
    seek(targetSeconds);
    showHud(`⏱️ ข้ามเวลา: ${formatTime(targetSeconds)} / ${formatTime(duration)}`);
  };

  // Global Keyboard Shortcuts for Focus & Audio Control
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
        showHud(isPlaying ? "⏸️ หยุดชั่วคราว" : "▶️ กำลังเล่นเสียง");
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        toggleMute();
        showHud(masterVolume > 0 ? "🔇 ปิดเสียง (Muted)" : "🔊 เปิดเสียง (Unmuted)");
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const newVol = Math.min(1, Math.round((masterVolume + 0.05) * 100) / 100);
        setMasterVolume(newVol);
        showHud(`🔊 ระดับเสียง: ${Math.round(newVol * 100)}%`);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const newVol = Math.max(0, Math.round((masterVolume - 0.05) * 100) / 100);
        setMasterVolume(newVol);
        showHud(`🔉 ระดับเสียง: ${Math.round(newVol * 100)}%`);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (e.shiftKey) {
          skipTime(5);
          showHud("⏩ ข้ามไปข้างหน้า +5 วิ");
        } else {
          nextTrack();
          showHud("⏭️ แทร็กถัดไป");
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (e.shiftKey) {
          skipTime(-5);
          showHud("⏪ ย้อนกลับ -5 วิ");
        } else {
          prevTrack();
          showHud("⏮️ แทร็กก่อนหน้า");
        }
      } else if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        setIsTimerOpen((prev) => !prev);
      } else if (e.key === "x" || e.key === "X") {
        e.preventDefault();
        setIsMixerOpen(!isMixerOpen);
      } else if (e.key === "?") {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsTimerOpen(false);
        setIsMobileVolumeOpen(false);
        setIsShortcutsOpen(false);
        if (isMixerOpen) setIsMixerOpen(false);
        if (isStatsModalOpen) setIsStatsModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isPlaying,
    masterVolume,
    togglePlay,
    toggleMute,
    setMasterVolume,
    nextTrack,
    prevTrack,
    isMixerOpen,
    setIsMixerOpen,
    isStatsModalOpen,
    setIsStatsModalOpen,
    showHud,
    skipTime,
  ]);

  // Format seconds to mm:ss
  const formatTimerRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const isDesktopHomeWithRightPanel = pathname === "/" && isNowPlayingOpen;
  const isAdminRoute = pathname.startsWith("/admin");
  const desktopInset = isAdminRoute ? "md:left-64 lg:left-72" : "md:left-60 lg:left-64";

  if (pathname === "/login" || pathname === "/register") return null;

  return (
    <>
      <div
        className={`lmsound-audio-player fixed z-30 transition-all ${
          /* บนมือถือ: ลอยอยู่เหนือ BottomNav (bottom-[60px]) ขอบมน สไตล์ Floating Player */
          /* บน Desktop: เต็มจอชิดขอบล่างตาม sidebar inset */
          `bottom-[72px] md:bottom-0 left-2 right-2 ${desktopInset} rounded-2xl md:rounded-none overflow-hidden`
        } bg-[var(--header-bg)]/95 backdrop-blur-2xl border border-purple-500/30 md:border-x-0 md:border-b-0 md:border-t shadow-[0_-10px_30px_rgba(112,26,117,0.3)] ${
          isDesktopHomeWithRightPanel ? "xl:hidden" : ""
        }`}
      >
        {/* Interactive Top Scrubbing Progress Track */}
        <div
          onClick={handleScrubClick}
          className="relative w-full h-1 sm:h-1.5 hover:h-2 bg-purple-950/40 cursor-pointer group transition-all select-none overflow-hidden"
          title={
            isLiveStream || duration <= 0
              ? `Live Session: ${formatTime(currentTime)}`
              : `ตำแหน่งเวลา: ${formatTime(currentTime)} / ${formatTime(duration)} (คลิกเพื่อเลื่อนเวลา)`
          }
        >
          {isLiveStream || duration <= 0 ? (
            <div
              className={`h-full w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400 ${
                isPlaying ? "animate-pulse" : "opacity-40"
              }`}
            />
          ) : (
            <div
              className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 relative transition-[width] duration-150"
              style={{
                width: `${duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0}%`,
              }}
            >
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-md shadow-fuchsia-500/80 ring-2 ring-fuchsia-400 opacity-0 group-hover:opacity-100 transition-opacity translate-x-1/2" />
            </div>
          )}
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 md:h-20 flex items-center justify-between gap-2 sm:gap-4 relative">
          {/* Left Side: Track Info & Animated Equalizer (Tap to expand on mobile) */}
          <div
            onClick={() => {
              if (typeof window !== "undefined" && window.innerWidth < 768) {
                setIsMobileSheetOpen(true);
              }
            }}
            className="flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1 sm:flex-initial sm:w-1/3 cursor-pointer md:cursor-default group"
          >
            <div className="relative group flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-purple-950/50 border border-purple-500/30 shrink-0 overflow-hidden shadow-inner group-hover:border-pink-400/50 transition-colors">
              {isPlaying ? (
                /* Animated Equalizer Bars */
                <div className="flex items-end gap-[2px] sm:gap-[3px] h-3.5 sm:h-5">
                  <span className="w-0.5 sm:w-1 bg-purple-400 rounded-full eq-bar-1" />
                  <span className="w-0.5 sm:w-1 bg-fuchsia-400 rounded-full eq-bar-2" />
                  <span className="w-0.5 sm:w-1 bg-pink-400 rounded-full eq-bar-3" />
                  <span className="w-0.5 sm:w-1 bg-cyan-400 rounded-full eq-bar-4" />
                </div>
              ) : (
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h4 className="text-xs sm:text-sm font-semibold text-foreground truncate max-w-[90px] xs:max-w-[120px] sm:max-w-[200px] group-hover:text-pink-300 md:group-hover:text-foreground transition-colors">
                  {activeTrack.title}
                </h4>
                <span className="hidden md:inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                  {activeTrack.category}
                </span>
                {isSynthesizerFallback && (
                  <span
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shrink-0 animate-in fade-in duration-200"
                    title="ระบบสังเคราะห์เสียง Web Audio ทำงานต่อเนื่อง แม้เครือข่ายภายนอกขัดข้อง"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Web Audio Synth
                  </span>
                )}
                {/* Mobile Expand Sheet Hint Icon */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMobileSheetOpen(true);
                  }}
                  className="md:hidden p-0.5 text-purple-400/70 hover:text-white"
                  title="ขยายเครื่องเล่นเสียงเต็มจอ"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10px] sm:text-xs text-purple-300/70 truncate max-w-[100px] xs:max-w-[130px] sm:max-w-[200px]">
                {activeTrack.location || activeTrack.subtitle}
              </p>
            </div>
          </div>

          {/* Center: Playback Controls & Scrubber */}
          <div className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 shrink-0">
            <div className="flex items-center justify-center gap-1.5 sm:gap-4">
              <button
                onClick={prevTrack}
                title="แทร็กก่อนหน้า (หรือกด Shift + ← เพื่อย้อนหลัง 5 วิ)"
                className="p-1.5 sm:p-2 text-purple-300/80 hover:text-white hover:bg-purple-600/20 rounded-full transition-colors cursor-pointer"
              >
                <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Glowing Play/Pause Button */}
              <button
                onClick={togglePlay}
                title={isPlaying ? "หยุดชั่วคราว (Space)" : "เล่นเสียงบรรยากาศ (Space)"}
                className={`flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full text-white shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer ${
                  isPlaying
                    ? "purple-gradient-btn shadow-purple-500/40 hover:shadow-purple-500/60 ring-2 ring-purple-400/40"
                    : "bg-white text-zinc-950 hover:bg-purple-100 shadow-white/20"
                }`}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={nextTrack}
                title="แทร็กถัดไป (หรือกด Shift + → เพื่อข้าม 5 วิ)"
                className="p-1.5 sm:p-2 text-purple-300/80 hover:text-white hover:bg-purple-600/20 rounded-full transition-colors cursor-pointer"
              >
                <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Desktop Micro-Waveform Spectrum Visualizer */}
              <div className="hidden xl:flex items-center pl-2 border-l border-purple-500/20">
                <InteractiveWaveform
                  isPlaying={isPlaying}
                  barCount={16}
                  heightClass="h-5"
                  colorTheme="fuchsia"
                />
              </div>
            </div>

            {/* Time display & mini scrubber */}
            <div className="hidden sm:flex items-center gap-2 text-[10px] sm:text-[11px] font-mono text-purple-300/70 select-none">
              <span>{formatTime(currentTime)}</span>
              <div
                className="w-24 md:w-32 lg:w-40 h-1 bg-purple-950/60 hover:h-1.5 rounded-full relative overflow-hidden group cursor-pointer transition-all"
                onClick={handleScrubClick}
                title="คลิกเพื่อเลื่อนตำแหน่งเวลา"
              >
                {isLiveStream || duration <= 0 ? (
                  <div
                    className={`h-full w-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 ${
                      isPlaying ? "animate-pulse" : "opacity-40"
                    }`}
                  />
                ) : (
                  <div
                    className="h-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 rounded-full"
                    style={{
                      width: `${duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0}%`,
                    }}
                  />
                )}
              </div>
              <span>{isLiveStream || duration <= 0 ? "Live ∞" : formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Side: Sleep Timer, Mobile Volume, Desktop Volume & Mixer Trigger */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-3 w-auto sm:w-1/3">
            {/* Active Pomodoro Badge Pill */}
            {pomodoroPhase !== "idle" && pomodoroSecondsLeft !== null && (
              <button
                onClick={() => setIsMixerOpen(true)}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl border border-rose-400/40 bg-rose-950/40 text-rose-200 hover:bg-rose-900/40 text-xs font-semibold cursor-pointer animate-pulse"
                title={`Pomodoro ${pomodoroPhase === "focus" ? "ช่วงโฟกัสอ่านหนังสือ" : "ช่วงพักสายตา"} (คลิกเพื่อจัดการ)`}
              >
                <span>{pomodoroPhase === "focus" ? "🍅" : "☕"}</span>
                <span className="font-mono text-[11px] font-bold">
                  {Math.floor(pomodoroSecondsLeft / 60)}:
                  {pomodoroSecondsLeft % 60 < 10 ? "0" : ""}
                  {pomodoroSecondsLeft % 60}
                </span>
              </button>
            )}

            {/* Focus / Sleep Timer Trigger Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsTimerOpen(!isTimerOpen);
                  setIsMobileVolumeOpen(false);
                }}
                className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  sleepTimerRemaining !== null
                    ? "bg-fuchsia-600/30 border-fuchsia-400/60 text-fuchsia-200 shadow-md shadow-fuchsia-500/20 animate-pulse"
                    : "bg-purple-950/40 border-purple-500/20 text-purple-300/90 hover:bg-purple-600/20 hover:text-white"
                }`}
                title={
                  sleepTimerRemaining !== null
                    ? `ตัวตั้งเวลา: เหลืออีก ${formatTimerRemaining(sleepTimerRemaining)}`
                    : "ตั้งเวลาโฟกัส / ดับเสียงอัตโนมัติ"
                }
              >
                <Timer className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${sleepTimerRemaining !== null ? "text-fuchsia-300" : "text-purple-400"}`} />
                {sleepTimerRemaining !== null ? (
                  <span className="font-mono text-[11px] sm:text-xs font-bold text-fuchsia-200">
                    {formatTimerRemaining(sleepTimerRemaining)}
                  </span>
                ) : (
                  <span className="hidden lg:inline text-[11px]">Timer</span>
                )}
              </button>

              {/* Timer Popover Menu */}
              {isTimerOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsTimerOpen(false)}
                  />
                  <div className="absolute right-0 bottom-full mb-3 z-50 w-64 glass-panel border border-purple-500/40 rounded-2xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-purple-500/20">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <Clock className="w-3.5 h-3.5 text-fuchsia-400" />
                        <span>ตั้งเวลาโฟกัส / ปิดเสียง</span>
                      </div>
                      {sleepTimerRemaining !== null && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 font-bold">
                          {formatTimerRemaining(sleepTimerRemaining)}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-purple-300/70 mb-2.5">
                      หรี่เสียงลงนุ่มนวลใน 30 วิสุดท้ายก่อนหยุดเสียง
                    </p>
                    <div className="space-y-1">
                      {SLEEP_TIMER_OPTIONS.map((opt) => {
                        const isSelected = sleepTimerMinutes === opt.minutes;
                        return (
                          <button
                            key={String(opt.minutes)}
                            onClick={() => {
                              setSleepTimer(opt.minutes);
                              setIsTimerOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition text-left cursor-pointer ${
                              isSelected
                                ? "bg-purple-600/30 text-white font-semibold border border-purple-400/40"
                                : "text-purple-200 hover:bg-purple-500/15 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{opt.label}</span>
                              {opt.tag && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300">
                                  {opt.tag}
                                </span>
                              )}
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-fuchsia-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Quick Volume Trigger */}
            <div className="relative sm:hidden">
              <button
                onClick={() => {
                  setIsMobileVolumeOpen(!isMobileVolumeOpen);
                  setIsTimerOpen(false);
                }}
                className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                  masterVolume === 0
                    ? "bg-red-950/40 border-red-500/30 text-red-400"
                    : "bg-purple-950/40 border-purple-500/20 text-purple-300 hover:bg-purple-600/20 hover:text-white"
                }`}
                title="ปรับระดับเสียงมือถือ"
              >
                {masterVolume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-purple-400" />
                )}
              </button>

              {/* Mobile Volume Slider Floating Popover */}
              {isMobileVolumeOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsMobileVolumeOpen(false)}
                  />
                  <div className="absolute right-0 bottom-full mb-3 z-50 w-48 glass-panel border border-purple-500/40 rounded-2xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-white">ระดับเสียง</span>
                      <span className="text-[10px] font-mono text-purple-300">
                        {Math.round(masterVolume * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleMute}
                        className="text-purple-300 hover:text-white cursor-pointer"
                      >
                        {masterVolume === 0 ? (
                          <VolumeX className="w-4 h-4 text-red-400" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-purple-400" />
                        )}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={masterVolume}
                        onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-purple-950/80 rounded-lg appearance-none cursor-pointer accent-purple-400"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Master Volume Slider (Desktop / Tablet) */}
            <div className="hidden sm:flex items-center gap-2.5">
              <button
                onClick={toggleMute}
                className="text-purple-300/80 hover:text-white transition-colors cursor-pointer"
                title={masterVolume === 0 ? "เปิดเสียง" : "ปิดเสียง"}
              >
                {masterVolume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-purple-400" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={masterVolume}
                onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                className="w-16 md:w-20 lg:w-28 h-1.5 bg-purple-950/60 rounded-lg appearance-none cursor-pointer accent-purple-400"
                title={`ระดับเสียงรวม: ${Math.round(masterVolume * 100)}%`}
              />
            </div>

            {/* Keyboard Shortcuts Trigger Button */}
            <button
              onClick={() => setIsShortcutsOpen(true)}
              className="hidden lg:flex p-2 rounded-xl border border-purple-500/20 bg-purple-950/40 text-purple-300 hover:text-white hover:bg-purple-600/20 transition-colors cursor-pointer"
              title="คีย์ลัดสำหรับสมาธิ (กด ? เพื่อเปิด)"
            >
              <Keyboard className="w-4 h-4 text-purple-400" />
            </button>

            {/* Sound Mixer Drawer Button */}
            <button
              onClick={() => setIsMixerOpen(!isMixerOpen)}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                isMixerOpen
                  ? "bg-purple-500/20 border-purple-500/50 text-purple-200 shadow-sm shadow-purple-500/20"
                  : "bg-purple-950/40 border-purple-500/20 text-purple-200 hover:bg-purple-600/20 hover:text-white"
              }`}
              title="เปิดหน้าต่าง Sound Mixer (กด X)"
            >
              <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
              <span className="hidden md:inline">Mixer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating HUD Toast for Hotkey Action */}
      {hudToast && (
        <div className="fixed bottom-[125px] md:bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl glass-panel border border-purple-400/50 text-white text-xs font-semibold shadow-2xl animate-in fade-in zoom-in-95 duration-100 flex items-center gap-2 pointer-events-none">
          <span>{hudToast}</span>
        </div>
      )}

      {/* Mixer Modal */}
      <SoundMixerModal />

      {/* Keyboard Shortcuts Guide Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Mobile Fullscreen Sound Sheet */}
      <MobilePlayerSheet
        isOpen={isMobileSheetOpen}
        onClose={() => setIsMobileSheetOpen(false)}
      />
    </>
  );
}
