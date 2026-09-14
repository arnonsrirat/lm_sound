"use client";

import React, { useMemo } from "react";
import { useAudio } from "@/context/AudioContext";

export default function AmbientAura() {
  const { activeTrack, isPlaying, pomodoroPhase } = useAudio();

  // Determine atmospheric color scheme based on track mood & pomodoro phase
  const auraColors = useMemo(() => {
    // 1. Pomodoro Focus Phase (Warm energetic focus glow)
    if (pomodoroPhase === "focus") {
      return {
        orb1: "rgba(225, 29, 72, 0.16)", // Rose 600
        orb2: "rgba(168, 85, 247, 0.18)", // Purple 500
        orb3: "rgba(244, 63, 94, 0.14)", // Pink 500
        beam: "from-rose-600/10 via-purple-600/10 to-transparent",
      };
    }

    // 2. Pomodoro Break Phase (Cool refreshing oasis glow)
    if (pomodoroPhase === "break") {
      return {
        orb1: "rgba(6, 182, 212, 0.18)", // Cyan 500
        orb2: "rgba(16, 185, 129, 0.16)", // Emerald 500
        orb3: "rgba(45, 212, 191, 0.14)", // Teal 400
        beam: "from-cyan-500/10 via-emerald-500/10 to-transparent",
      };
    }

    const text = (
      (activeTrack?.title || "") +
      " " +
      (activeTrack?.category || "") +
      " " +
      (activeTrack?.subtitle || "")
    ).toLowerCase();

    // 3. Rain / Storm / Ocean Water Mood
    if (
      text.includes("rain") ||
      text.includes("storm") ||
      text.includes("water") ||
      text.includes("ocean") ||
      text.includes("waves") ||
      text.includes("ฝน") ||
      text.includes("คลื่น")
    ) {
      return {
        orb1: "rgba(14, 116, 144, 0.22)", // Cyan 700
        orb2: "rgba(59, 130, 246, 0.18)", // Blue 500
        orb3: "rgba(99, 102, 241, 0.15)", // Indigo 500
        beam: "from-cyan-600/10 via-blue-600/10 to-transparent",
      };
    }

    // 4. Cafe / Cozy Study Room / Coffee Mood
    if (
      text.includes("cafe") ||
      text.includes("coffee") ||
      text.includes("cozy") ||
      text.includes("คาเฟ่") ||
      text.includes("อบอุ่น") ||
      text.includes("room")
    ) {
      return {
        orb1: "rgba(180, 83, 9, 0.18)", // Amber 700
        orb2: "rgba(217, 119, 6, 0.15)", // Amber 600
        orb3: "rgba(194, 65, 12, 0.12)", // Orange 700
        beam: "from-amber-600/10 via-orange-600/10 to-transparent",
      };
    }

    // 5. Zen Temple / Meditation / Forest / Nature Mood
    if (
      text.includes("zen") ||
      text.includes("forest") ||
      text.includes("nature") ||
      text.includes("meditation") ||
      text.includes("ป่า") ||
      text.includes("วัด") ||
      text.includes("ธรรมชาติ")
    ) {
      return {
        orb1: "rgba(5, 150, 105, 0.18)", // Emerald 600
        orb2: "rgba(13, 148, 136, 0.16)", // Teal 600
        orb3: "rgba(16, 185, 129, 0.12)", // Emerald 500
        beam: "from-emerald-600/10 via-teal-600/10 to-transparent",
      };
    }

    // 6. Default / Cyberpunk Night / Coding Mood
    return {
      orb1: "rgba(124, 58, 237, 0.20)", // Violet 600
      orb2: "rgba(217, 70, 239, 0.16)", // Fuchsia 500
      orb3: "rgba(99, 102, 241, 0.14)", // Indigo 500
      beam: "from-purple-600/10 via-pink-600/10 to-transparent",
    };
  }, [activeTrack, pomodoroPhase]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none"
    >
      {/* Top Left Atmospheric Mesh Orb */}
      <div
        className={`absolute -top-32 -left-32 w-[32rem] h-[32rem] md:w-[42rem] md:h-[42rem] rounded-full blur-[110px] md:blur-[140px] transition-all duration-1000 ease-in-out ${
          isPlaying ? "opacity-100 scale-105" : "opacity-60 scale-95"
        }`}
        style={{
          background: `radial-gradient(circle, ${auraColors.orb1} 0%, transparent 70%)`,
        }}
      />

      {/* Top Right Atmospheric Mesh Orb */}
      <div
        className={`absolute -top-20 -right-32 w-[30rem] h-[30rem] md:w-[38rem] md:h-[38rem] rounded-full blur-[100px] md:blur-[130px] transition-all duration-1000 ease-in-out ${
          isPlaying ? "opacity-100 scale-100" : "opacity-50 scale-90"
        }`}
        style={{
          background: `radial-gradient(circle, ${auraColors.orb2} 0%, transparent 70%)`,
        }}
      />

      {/* Center Bottom Responsive Glow (Soft backlighting above AudioPlayerBar) */}
      <div
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[36rem] md:w-[54rem] h-[20rem] rounded-t-full blur-[90px] md:blur-[120px] transition-all duration-1000 ease-in-out ${
          isPlaying ? "opacity-90 scale-100" : "opacity-40 scale-95"
        }`}
        style={{
          background: `radial-gradient(ellipse at bottom, ${auraColors.orb3} 0%, transparent 75%)`,
        }}
      />

      {/* Soft Top Radial Beam */}
      <div
        className={`absolute top-0 inset-x-0 h-40 bg-gradient-to-b ${auraColors.beam} transition-all duration-1000 ease-in-out`}
      />
    </div>
  );
}
