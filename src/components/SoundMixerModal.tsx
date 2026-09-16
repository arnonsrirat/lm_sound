"use client";

import React, { useState } from "react";
import { useAudio, SLEEP_TIMER_OPTIONS } from "@/context/AudioContext";
import {
  X,
  Sliders,
  CloudRain,
  Radio,
  Wind,
  Waves,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Timer,
  Clock,
  Share2,
  Check,
  BookmarkPlus,
  Trash2,
  Bookmark,
  Headphones,
  SlidersHorizontal,
  Bell,
  Play,
  Square,
  SkipForward,
} from "lucide-react";

export default function SoundMixerModal() {
  const {
    isMixerOpen,
    setIsMixerOpen,
    mixerChannels,
    setChannelVolume,
    toggleChannel,
    focusRecipes,
    applyFocusRecipe,
    activePresetId,
    sleepTimerMinutes,
    sleepTimerRemaining,
    setSleepTimer,
    getShareableUrl,
    customBlends,
    saveCustomBlend,
    deleteCustomBlend,
    applyCustomBlend,
    acousticMode,
    acousticSpaces,
    setAcousticSpace,
    binauralMode,
    binauralVolume,
    binauralPresets,
    setBinauralMode,
    setBinauralVolume,
    eqPresetId,
    eqBands,
    eqPresets,
    setEqPreset,
    setEqBand,
    resetEq,
    pomodoroPhase,
    pomodoroPresetId,
    pomodoroSecondsLeft,
    pomodoroTotalSeconds,
    pomodoroPresets,
    startPomodoro,
    stopPomodoro,
    skipPomodoroPhase,
    playChime,
  } = useAudio();

  const [isCopied, setIsCopied] = useState(false);
  const [isChimeTesting, setIsChimeTesting] = useState(false);
  const [newBlendName, setNewBlendName] = useState("");
  const [newBlendEmoji, setNewBlendEmoji] = useState("🎧");
  const [isSavingBlend, setIsSavingBlend] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveBlend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlendName.trim()) return;
    saveCustomBlend(newBlendName.trim(), newBlendEmoji);
    setNewBlendName("");
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsSavingBlend(false);
    }, 1500);
  };

  const handleCopyShare = async () => {
    try {
      const url = getShareableUrl();
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2200);
    } catch {
      // Fallback
    }
  };

  if (!isMixerOpen) return null;

  const getChannelIcon = (id: string) => {
    switch (id) {
      case "rain":
        return <CloudRain className="w-5 h-5 text-purple-400" />;
      case "whitenoise":
        return <Radio className="w-5 h-5 text-fuchsia-400" />;
      case "ambient":
        return <Wind className="w-5 h-5 text-pink-400" />;
      case "waves":
        return <Waves className="w-5 h-5 text-cyan-400" />;
      default:
        return <Sliders className="w-5 h-5 text-purple-400" />;
    }
  };

  const activeRecipe = focusRecipes.find((r) => r.id === activePresetId);
  const isCustomMode = activePresetId === "custom";

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div
        className="fixed inset-0"
        onClick={() => setIsMixerOpen(false)}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-xl glass-panel border border-purple-500/30 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-7 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold purple-gradient-text">
                Sound Mixer & Focus Recipe
              </h2>
              <p className="text-xs text-purple-300/70">
                ผสมผสานเสียงบรรยากาศและเลือกพรีเซ็ตสมาธิ (Real-time Web Audio)
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMixerOpen(false)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Mode Indicator */}
        <div className="mt-4 p-3 rounded-2xl bg-purple-950/40 border border-purple-500/25 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-purple-300/80">
              สถานะเสียงปัจจุบัน:
            </span>
            {activeRecipe ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/30 text-fuchsia-200 border border-purple-400/40">
                <span>{activeRecipe.emoji}</span>
                <span>{activeRecipe.name}</span>
                <span className="text-[10px] text-purple-300/70">({activeRecipe.thaiName})</span>
              </span>
            ) : isCustomMode ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-200 border border-amber-400/30">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>โหมดกำหนดเอง (Custom)</span>
              </span>
            ) : (
              <span className="text-xs text-purple-300/60 font-medium">
                ระดับเสียงเริ่มต้น
              </span>
            )}
          </div>

          {/* Quick Reset to Deep Focus if in custom mode */}
          {isCustomMode && (
            <button
              onClick={() => applyFocusRecipe("deep-focus")}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-purple-300 hover:text-white hover:bg-purple-500/20 transition cursor-pointer"
              title="รีเซ็ตเป็น Deep Focus"
            >
              <RotateCcw className="w-3 h-3" />
              <span>รีเซ็ตพรีเซ็ต</span>
            </button>
          )}
        </div>

        {/* Focus Recipe 4 Modes Section */}
        <div className="mt-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-fuchsia-400 animate-pulse" />
              <span>Focus Recipe พรีเซ็ตโฟกัสสำเร็จรูป</span>
            </div>
            <span className="text-[10px] text-purple-400/80 font-medium">
              คลิกเดียวปรับระดับ 4 ช่องเสียง
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {focusRecipes.map((recipe) => {
              const isActive = activePresetId === recipe.id;
              return (
                <button
                  key={recipe.id}
                  onClick={() => applyFocusRecipe(recipe.id)}
                  type="button"
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative flex flex-col justify-between gap-1.5 ${
                    isActive
                      ? "bg-gradient-to-br from-purple-900/80 to-pink-950/70 border-pink-400/70 text-white shadow-lg shadow-purple-900/30 ring-1 ring-pink-400/40 scale-[1.01]"
                      : "bg-[#180d33]/60 hover:bg-[#231349]/80 border-purple-500/20 text-purple-200 hover:border-purple-400/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{recipe.emoji}</span>
                      <div>
                        <div className="font-bold text-xs text-white">
                          {recipe.name}
                        </div>
                        <div className="text-[10px] text-purple-300/70">
                          {recipe.thaiName}
                        </div>
                      </div>
                    </div>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/30 text-pink-200 border border-pink-400/40">
                        <CheckCircle2 className="w-3 h-3 text-pink-400" />
                        <span>เปิดอยู่</span>
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-purple-950/80 text-purple-300/80 border border-purple-500/20">
                        {recipe.tag}
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-purple-300/60 leading-relaxed line-clamp-2 mt-0.5">
                    {recipe.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* User Custom Blends Section */}
        <div className="mt-4 mb-6 p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-fuchsia-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                สูตรผสมเสียงของฉัน (My Blends)
              </span>
              {customBlends && customBlends.length > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300">
                  {customBlends.length}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsSavingBlend(!isSavingBlend)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-purple-600/20 border border-purple-500/30 text-purple-200 hover:bg-purple-600/30 hover:text-white transition cursor-pointer"
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-fuchsia-300" />
              <span>{isSavingBlend ? "ปิดฟอร์ม" : "+ บันทึกสูตรปัจจุบัน"}</span>
            </button>
          </div>

          {/* Form to Save Current Blend */}
          {isSavingBlend && (
            <form onSubmit={handleSaveBlend} className="mb-3 p-3 rounded-xl bg-purple-900/30 border border-purple-400/30 animate-in fade-in duration-150">
              <div className="text-[11px] font-semibold text-purple-200 mb-2">
                ตั้งชื่อสูตรผสมเสียงที่กำลังเปิดอยู่:
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {/* Emoji Selectors */}
                <div className="flex items-center gap-1 shrink-0">
                  {["🎧", "🌧️", "☕", "🌙", "📖", "💡"].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewBlendEmoji(emoji)}
                      className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition cursor-pointer ${
                        newBlendEmoji === emoji
                          ? "bg-purple-600 border border-purple-400 text-white"
                          : "bg-purple-950/60 hover:bg-purple-800/40 text-purple-300 border border-purple-500/20"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="เช่น อ่านหนังสือสอบไฟนอล"
                  value={newBlendName}
                  onChange={(e) => setNewBlendName(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-purple-950/80 border border-purple-500/30 text-xs text-white placeholder:text-purple-400/50 focus:outline-none focus:border-purple-400"
                  maxLength={30}
                />

                <button
                  type="submit"
                  disabled={!newBlendName.trim()}
                  className="px-3 py-1.5 rounded-lg purple-gradient-btn text-xs font-bold text-white transition disabled:opacity-40 cursor-pointer shrink-0"
                >
                  {saveSuccess ? "บันทึกแล้ว!" : "บันทึก"}
                </button>
              </div>
            </form>
          )}

          {/* List of Saved Custom Blends */}
          {customBlends && customBlends.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {customBlends.map((blend) => (
                <div
                  key={blend.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-purple-950/40 border border-purple-500/20 hover:border-purple-400/40 transition group"
                >
                  <button
                    type="button"
                    onClick={() => applyCustomBlend(blend)}
                    className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer"
                    title="คลิกเพื่อใช้งานสูตรนี้"
                  >
                    <span className="text-base">{blend.emoji}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">
                        {blend.name}
                      </div>
                      <div className="text-[9px] text-purple-300/60 truncate font-mono">
                        {Object.entries(blend.volumes)
                          .filter(([, vol]) => vol > 0)
                          .map(([key, vol]) => `${key[0].toUpperCase()}:${Math.round(vol * 100)}%`)
                          .join(" • ") || "Muted"}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteCustomBlend(blend.id)}
                    className="p-1.5 rounded-lg text-purple-400/50 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer shrink-0"
                    title="ลบสูตรนี้"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            !isSavingBlend && (
              <p className="text-[11px] text-purple-300/60 text-center py-1">
                ยังไม่มีสูตรส่วนตัว ปรับแต่ง Slider ด้านล่างแล้วกด &ldquo;+ บันทึกสูตรปัจจุบัน&rdquo; เพื่อเก็บไว้ใช้ซ้ำได้
              </p>
            )
          )}
        </div>

        {/* Channels List */}
        <div className="space-y-3.5 pt-2 border-t border-purple-500/15">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-purple-300 uppercase tracking-wider">
              ปรับระดับเสียงแยกแต่ละช่อง (Manual Sliders)
            </div>
            {isCustomMode && (
              <span className="text-[10px] font-semibold text-amber-300/90">
                • กำลังปรับแต่งเอง
              </span>
            )}
          </div>

          {mixerChannels.map((channel) => {
            const isMuted = !channel.enabled || channel.volume === 0;
            return (
              <div
                key={channel.id}
                className={`p-3 rounded-2xl border transition-all ${
                  channel.enabled
                    ? "bg-purple-950/40 border-purple-500/25"
                    : "bg-purple-950/10 border-purple-500/10 opacity-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    {getChannelIcon(channel.id)}
                    <span className="text-sm font-semibold text-white">
                      {channel.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-purple-300/90 w-9 text-right font-medium">
                      {channel.enabled ? `${Math.round(channel.volume * 100)}%` : "Off"}
                    </span>
                    <button
                      onClick={() => toggleChannel(channel.id)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        channel.enabled
                          ? "text-purple-400 hover:bg-purple-500/20 border-purple-500/30"
                          : "text-purple-400/40 hover:bg-white/5 border-purple-500/10"
                      }`}
                      title={channel.enabled ? "ปิดเสียงนี้" : "เปิดเสียงนี้"}
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 text-red-400" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-purple-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Volume Slider */}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={channel.enabled ? channel.volume : 0}
                  onChange={(e) => {
                    const newVol = parseFloat(e.target.value);
                    setChannelVolume(channel.id, newVol);
                    if (!channel.enabled && newVol > 0) {
                      toggleChannel(channel.id);
                    }
                  }}
                  className="w-full h-1.5 bg-purple-950/80 rounded-lg appearance-none cursor-pointer accent-purple-400 hover:accent-purple-300"
                />
              </div>
            );
          })}
        </div>

        {/* Spatial Acoustics & Reverb Mode Section */}
        <div className="mt-6 pt-4 border-t border-purple-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                มิติเสียงบรรยากาศ (Spatial Acoustics & Reverb)
              </span>
            </div>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              DSP Convolver
            </span>
          </div>
          <p className="text-[11px] text-purple-300/70 mb-3">
            จำลองสภาพแวดล้อมทางอะคูสติก เพิ่มมิติความลึกและความอบอุ่นของเสียงบรรยากาศ
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {acousticSpaces.map((space) => {
              const isSelected = acousticMode === space.id;
              return (
                <button
                  key={space.id}
                  onClick={() => setAcousticSpace(space.id)}
                  type="button"
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? "bg-cyan-950/40 border-cyan-400/80 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-400/40"
                      : "bg-purple-950/30 border-purple-500/20 hover:bg-purple-900/30 hover:border-purple-400/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{space.emoji}</span>
                      <span className="text-xs font-bold text-white">
                        {space.thaiName}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[10px] text-purple-200/70 line-clamp-2">
                    {space.description}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-[9px] font-mono text-cyan-300/80">
                    <span>Dry {Math.round(space.dry * 100)}%</span>
                    <span>•</span>
                    <span>Reverb {Math.round(space.wet * 100)}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Binaural Beats & Brainwave Frequency Layer */}
        <div className="mt-6 pt-4 border-t border-purple-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-pink-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                คลื่นสมองช่วยสมาธิ (Binaural Beats Studio)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-purple-300/70 hidden xs:inline">
                *แนะนำใช้หูฟัง Stereo
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-400/30">
                Stereo Entrainment
              </span>
            </div>
          </div>
          <p className="text-[11px] text-purple-300/70 mb-3">
            ปล่อยคลื่นความถี่ต่างกันในหูซ้าย-ขวา เพื่อปรับคลื่นสมองสู่สภาวะที่ต้องการ
          </p>

          {/* Binaural Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
            {binauralPresets.map((preset) => {
              const isSelected = binauralMode === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() =>
                    setBinauralMode(isSelected ? "off" : preset.id)
                  }
                  type="button"
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? "bg-pink-950/40 border-pink-400/80 shadow-lg shadow-pink-950/30 ring-1 ring-pink-400/40"
                      : "bg-purple-950/30 border-purple-500/20 hover:bg-purple-900/30 hover:border-purple-400/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{preset.emoji}</span>
                      <span className="text-xs font-bold text-white">
                        {preset.name}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[10px] text-purple-200/70 line-clamp-2">
                    {preset.benefits}
                  </p>
                  <div className="mt-2 text-[9px] font-mono text-pink-300/80">
                    {isSelected
                      ? "● กำลังทำงาน (แตะเพื่อปิด)"
                      : `○ สลับความถี่ ${preset.beatHz} Hz`}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Binaural Volume Slider (shown when active) */}
          {binauralMode !== "off" && (
            <div className="p-3 rounded-2xl bg-pink-950/20 border border-pink-500/20 flex flex-col gap-1.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-pink-300 flex items-center gap-1.5">
                  <span>ระดับความดังคลื่นสมอง:</span>
                  <span className="font-mono text-white">
                    {Math.round(binauralVolume * 100)}%
                  </span>
                </span>
                <button
                  onClick={() => setBinauralMode("off")}
                  className="text-[10px] text-zinc-400 hover:text-white underline cursor-pointer"
                >
                  ปิดคลื่นความถี่
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.01"
                value={binauralVolume}
                onChange={(e) =>
                  setBinauralVolume(parseFloat(e.target.value))
                }
                className="w-full h-1.5 bg-purple-950/80 rounded-lg appearance-none cursor-pointer accent-pink-400 hover:accent-pink-300"
              />
            </div>
          )}
        </div>

        {/* Studio Equalizer & Tone Sculpting Section */}
        <div className="mt-6 pt-4 border-t border-purple-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                อีควอไลเซอร์ปรับแต่งโทนเสียง (Studio Equalizer)
              </span>
            </div>
            <button
              onClick={resetEq}
              type="button"
              className="inline-flex items-center gap-1 text-[11px] text-purple-300/70 hover:text-amber-300 transition-colors cursor-pointer"
              title="รีเซ็ตอีควอไลเซอร์เป็นค่ามาตรฐาน"
            >
              <RotateCcw className="w-3 h-3" />
              <span>คืนค่า Flat</span>
            </button>
          </div>
          <p className="text-[11px] text-purple-300/70 mb-3">
            ปรับแต่งมวลเสียงทุ้ม กลาง แหลม ให้เข้ากับหูฟังและบรรยากาศที่คุณชอบ
          </p>

          {/* Quick EQ Presets Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
            {eqPresets.map((preset) => {
              const isSelected = eqPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setEqPreset(preset.id)}
                  type="button"
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-amber-950/40 border-amber-400/80 shadow-md shadow-amber-950/30 ring-1 ring-amber-400/40 text-white"
                      : "bg-purple-950/30 border-purple-500/20 hover:bg-purple-900/30 hover:border-purple-400/40 text-purple-200/90"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{preset.emoji}</span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </div>
                  <div className="text-[11px] font-bold leading-tight truncate">
                    {preset.thaiName}
                  </div>
                  <div className="text-[9px] text-purple-300/60 font-mono mt-1">
                    {preset.bands.bass > 0 ? `+${preset.bands.bass}` : preset.bands.bass}/
                    {preset.bands.mid > 0 ? `+${preset.bands.mid}` : preset.bands.mid}/
                    {preset.bands.treble > 0 ? `+${preset.bands.treble}` : preset.bands.treble} dB
                  </div>
                </button>
              );
            })}
          </div>

          {/* 3-Band Parametric Sliders (Bass, Mid, Treble) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/20">
            {/* Bass Band */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-300/90 font-medium">ย่านทุ้ม (Bass 120Hz)</span>
                <span className="font-mono text-[11px] text-white">
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
                className="w-full h-1.5 bg-purple-950/80 rounded-lg appearance-none cursor-pointer accent-amber-400 hover:accent-amber-300"
                title={`Bass: ${eqBands.bass} dB`}
              />
              <div className="flex justify-between text-[9px] text-purple-300/50 font-mono">
                <span>-10dB</span>
                <span>0dB</span>
                <span>+10dB</span>
              </div>
            </div>

            {/* Mid Band */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-300/90 font-medium">ย่านกลาง (Mid 1kHz)</span>
                <span className="font-mono text-[11px] text-white">
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
                className="w-full h-1.5 bg-purple-950/80 rounded-lg appearance-none cursor-pointer accent-amber-400 hover:accent-amber-300"
                title={`Mid: ${eqBands.mid} dB`}
              />
              <div className="flex justify-between text-[9px] text-purple-300/50 font-mono">
                <span>-10dB</span>
                <span>0dB</span>
                <span>+10dB</span>
              </div>
            </div>

            {/* Treble Band */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-300/90 font-medium">ย่านแหลม (Treble 6kHz)</span>
                <span className="font-mono text-[11px] text-white">
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
                className="w-full h-1.5 bg-purple-950/80 rounded-lg appearance-none cursor-pointer accent-amber-400 hover:accent-amber-300"
                title={`Treble: ${eqBands.treble} dB`}
              />
              <div className="flex justify-between text-[9px] text-purple-300/50 font-mono">
                <span>-10dB</span>
                <span>0dB</span>
                <span>+10dB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pomodoro Study & Rest Cycle Studio */}
        <div className="mt-6 pt-4 border-t border-purple-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">🍅</span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                วงรอบสมาธิ Pomodoro & ระฆังเซน (Pomodoro Studio)
              </span>
            </div>
            <button
              onClick={() => {
                setIsChimeTesting(true);
                playChime();
                setTimeout(() => setIsChimeTesting(false), 2000);
              }}
              type="button"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer ${
                isChimeTesting
                  ? "bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400/40 animate-pulse"
                  : "bg-purple-950/40 border-purple-500/30 text-purple-300 hover:text-amber-300 hover:border-amber-400/50"
              }`}
              title="ทดสอบเสียงระฆังเซนกังวาน (528 Hz Solfeggio)"
            >
              <Bell className={`w-3 h-3 ${isChimeTesting ? "text-amber-300 animate-bounce" : "text-purple-400"}`} />
              <span>{isChimeTesting ? "กำลังลั่นระฆัง..." : "ทดสอบระฆังเซน 🔔"}</span>
            </button>
          </div>
          <p className="text-[11px] text-purple-300/70 mb-3">
            สลับรอบอ่านหนังสือและพักสายตาอัตโนมัติ เตือนด้วยเสียงระฆังเซนกังวาน ไม่สะดุ้งตกใจ
          </p>

          {/* Active Pomodoro Session Banner */}
          {pomodoroPhase !== "idle" && pomodoroSecondsLeft !== null ? (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-purple-900/40 to-pink-950/40 border border-purple-400/40 shadow-lg shadow-purple-950/30 space-y-3 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base animate-pulse">
                    {pomodoroPhase === "focus" ? "📚" : "☕"}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {pomodoroPhase === "focus" ? "ช่วงเวลาโฟกัส (Focus Phase)" : "ช่วงเวลาพักสายตา (Break Phase)"}
                    </div>
                    <div className="text-[10px] text-purple-300/70">
                      {pomodoroPhase === "focus" ? "ตั้งใจอ่านหนังสือให้เต็มที่" : "ดื่มน้ำ ยืดเส้นสาย พักดวงตา"}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-mono font-black text-white tracking-wider">
                    {Math.floor(pomodoroSecondsLeft / 60)}:
                    {pomodoroSecondsLeft % 60 < 10 ? "0" : ""}
                    {pomodoroSecondsLeft % 60}
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-purple-300/70">
                    เวลาที่เหลือ
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              {pomodoroTotalSeconds && (
                <div className="w-full h-1.5 bg-purple-950/80 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      pomodoroPhase === "focus"
                        ? "bg-gradient-to-r from-fuchsia-500 to-pink-400"
                        : "bg-gradient-to-r from-cyan-400 to-emerald-400"
                    }`}
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(
                          100,
                          ((pomodoroTotalSeconds - pomodoroSecondsLeft) /
                            pomodoroTotalSeconds) *
                            100
                        )
                      )}%`,
                    }}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={skipPomodoroPhase}
                  type="button"
                  className="flex-1 py-1.5 px-3 rounded-xl bg-purple-900/40 border border-purple-500/30 text-purple-200 hover:text-white hover:bg-purple-800/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  title="สลับไปช่วงถัดไปทันที"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  <span>{pomodoroPhase === "focus" ? "ข้ามไปพักสายตา" : "เริ่มโฟกัสต่อ"}</span>
                </button>
                <button
                  onClick={stopPomodoro}
                  type="button"
                  className="py-1.5 px-3 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 hover:text-white hover:bg-red-900/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  title="หยุดและยกเลิกการจับเวลา Pomodoro"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>หยุดรอบนี้</span>
                </button>
              </div>
            </div>
          ) : (
            /* Presets to Start Pomodoro */
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {pomodoroPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => startPomodoro(preset.id)}
                  type="button"
                  className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/20 hover:bg-purple-900/30 hover:border-purple-400/40 text-left transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base">{preset.emoji}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-900/50 text-purple-300 border border-purple-500/30">
                      {preset.focusMinutes}m / {preset.breakMinutes}m
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors">
                    {preset.thaiName}
                  </div>
                  <p className="text-[10px] text-purple-200/70 mt-1 line-clamp-2">
                    {preset.description}
                  </p>
                  <div className="mt-2.5 flex items-center gap-1 text-[10px] text-fuchsia-300 font-medium">
                    <Play className="w-3 h-3 fill-current" />
                    <span>เริ่มรอบโฟกัส</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sleep & Focus Timer Section */}
        <div className="mt-6 pt-4 border-t border-purple-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-fuchsia-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                ตัวตั้งเวลาโฟกัสและกล่อมนอน (Sleep & Focus Timer)
              </span>
            </div>
            {sleepTimerRemaining !== null && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 animate-pulse">
                <Clock className="w-3 h-3 text-fuchsia-400" />
                {Math.floor(sleepTimerRemaining / 60)}:
                {sleepTimerRemaining % 60 < 10 ? "0" : ""}
                {sleepTimerRemaining % 60}
              </span>
            )}
          </div>
          <p className="text-[11px] text-purple-300/70 mb-3">
            เลือกเวลาเพื่อให้เสียงดับลงอัตโนมัติ (หรี่เสียงลงอย่างนุ่มนวลใน 30 วินาทีสุดท้าย)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {SLEEP_TIMER_OPTIONS.map((opt) => {
              const isSelected = sleepTimerMinutes === opt.minutes;
              return (
                <button
                  key={String(opt.minutes)}
                  onClick={() => setSleepTimer(opt.minutes)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                    isSelected
                      ? "bg-purple-600/30 border-purple-400 text-white font-bold shadow-md shadow-purple-500/20 ring-1 ring-purple-400/40"
                      : "bg-purple-950/30 border-purple-500/20 text-purple-200/80 hover:bg-purple-500/15 hover:text-white"
                  }`}
                >
                  <span className="text-xs">{opt.label}</span>
                  {opt.tag && (
                    <span className="text-[9px] text-fuchsia-300/80 font-normal mt-0.5">
                      {opt.tag}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions: Share & Done */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 mt-6">
          <button
            onClick={handleCopyShare}
            type="button"
            className={`w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isCopied
                ? "bg-emerald-600/30 border-emerald-400 text-emerald-200 shadow-md shadow-emerald-500/20"
                : "bg-purple-950/40 border-purple-500/30 text-purple-200 hover:bg-purple-600/20 hover:text-white"
            }`}
            title="คัดลอกลิงก์แชร์การผสมเสียงนี้ให้เพื่อน"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>คัดลอกลิงก์แชร์แล้ว!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-purple-300" />
                <span>แชร์การผสมเสียงนี้ (Share)</span>
              </>
            )}
          </button>
          <button
            onClick={() => setIsMixerOpen(false)}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl purple-gradient-btn text-white text-xs font-bold transition cursor-pointer"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
}
