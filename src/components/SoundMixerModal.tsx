"use client";

import React from "react";
import { useAudio } from "@/context/AudioContext";
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
} from "lucide-react";

export default function SoundMixerModal() {
  const {
    isMixerOpen,
    setIsMixerOpen,
    mixerChannels,
    setChannelVolume,
    toggleChannel,
    tracks,
    selectTrack,
    activeTrack,
  } = useAudio();

  if (!isMixerOpen) return null;

  const getChannelIcon = (id: string) => {
    switch (id) {
      case "rain":
        return <CloudRain className="w-5 h-5 text-teal-400" />;
      case "whitenoise":
        return <Radio className="w-5 h-5 text-indigo-400" />;
      case "ambient":
        return <Wind className="w-5 h-5 text-emerald-400" />;
      case "waves":
        return <Waves className="w-5 h-5 text-cyan-400" />;
      default:
        return <Sliders className="w-5 h-5 text-teal-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div
        className="fixed inset-0"
        onClick={() => setIsMixerOpen(false)}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-lg bg-zinc-900 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Sound Mixer</h2>
              <p className="text-xs text-zinc-400">
                ผสมผสานเสียงบรรยากาศตามใจคุณ
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMixerOpen(false)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Section */}
        <div className="mt-5 mb-6">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Preset แนะนำ</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {tracks.map((track) => {
              const isSelected = track.id === activeTrack.id;
              return (
                <button
                  key={track.id}
                  onClick={() => selectTrack(track.id)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                    isSelected
                      ? "bg-teal-500/15 border-teal-500/40 text-teal-300 font-medium shadow-sm shadow-teal-500/20"
                      : "bg-zinc-950/40 border-white/5 text-zinc-300 hover:bg-white/5"
                  }`}
                >
                  <div className="font-medium truncate">{track.title}</div>
                  <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                    {track.subtitle}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Channels List */}
        <div className="space-y-4">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            ปรับระดับเสียงแยกแต่ละประเภท
          </div>

          {mixerChannels.map((channel) => {
            const isMuted = !channel.enabled || channel.volume === 0;
            return (
              <div
                key={channel.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  channel.enabled
                    ? "bg-zinc-950/50 border-white/10"
                    : "bg-zinc-950/20 border-white/5 opacity-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    {getChannelIcon(channel.id)}
                    <span className="text-sm font-medium text-white">
                      {channel.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-zinc-400 w-9 text-right">
                      {channel.enabled ? `${Math.round(channel.volume * 100)}%` : "Off"}
                    </span>
                    <button
                      onClick={() => toggleChannel(channel.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        channel.enabled
                          ? "text-teal-400 hover:bg-teal-500/10 border-teal-500/20"
                          : "text-zinc-500 hover:bg-white/5 border-white/5"
                      }`}
                      title={channel.enabled ? "ปิดเสียงนี้" : "เปิดเสียงนี้"}
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
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
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-400 hover:accent-teal-300"
                />
              </div>
            );
          })}
        </div>

        {/* Footer Close Button */}
        <button
          onClick={() => setIsMixerOpen(false)}
          className="w-full mt-6 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
        >
          เสร็จสิ้น
        </button>
      </div>
    </div>
  );
}
