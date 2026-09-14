"use client";

import React from "react";

interface InteractiveWaveformProps {
  isPlaying: boolean;
  barCount?: number;
  heightClass?: string;
  className?: string;
  colorTheme?: "fuchsia" | "emerald" | "cyan" | "purple";
}

export default function InteractiveWaveform({
  isPlaying,
  barCount = 24,
  heightClass = "h-6 sm:h-7",
  className = "",
  colorTheme = "fuchsia",
}: InteractiveWaveformProps) {
  // Generate deterministic base heights in a pleasant soundwave contour
  const bars = React.useMemo(() => {
    return Array.from({ length: barCount }).map((_, i) => {
      const normalized = i / (barCount - 1);
      // Double hump harmonic curve
      const curve =
        Math.sin(normalized * Math.PI) * 0.6 +
        Math.sin(normalized * Math.PI * 3) * 0.25 +
        0.25;
      const baseHeight = Math.max(15, Math.min(95, Math.round(curve * 90)));
      // Vary animation duration slightly per bar for natural liquid movement
      const duration = (0.65 + (i % 5) * 0.15).toFixed(2);
      const delay = ((i % 8) * 0.08).toFixed(2);
      return { baseHeight, duration, delay };
    });
  }, [barCount]);

  const getGradient = () => {
    switch (colorTheme) {
      case "emerald":
        return "bg-gradient-to-t from-emerald-600 via-teal-400 to-cyan-300";
      case "cyan":
        return "bg-gradient-to-t from-cyan-600 via-sky-400 to-indigo-300";
      case "purple":
        return "bg-gradient-to-t from-purple-700 via-indigo-500 to-violet-300";
      case "fuchsia":
      default:
        return "bg-gradient-to-t from-purple-600 via-fuchsia-400 to-pink-300";
    }
  };

  return (
    <div
      className={`flex items-end gap-[2px] sm:gap-[3px] select-none ${heightClass} ${className}`}
      aria-hidden="true"
    >
      {bars.map((bar, idx) => (
        <span
          key={idx}
          style={{
            height: isPlaying ? `${bar.baseHeight}%` : "18%",
            animationDuration: isPlaying ? `${bar.duration}s` : undefined,
            animationDelay: isPlaying ? `${bar.delay}s` : undefined,
          }}
          className={`w-[2px] sm:w-[3px] rounded-full transition-all duration-300 ${getGradient()} ${
            isPlaying
              ? "animate-[waveBounce_1s_ease-in-out_infinite] shadow-[0_0_8px_rgba(236,72,153,0.4)] opacity-95"
              : "opacity-30"
          }`}
        />
      ))}
    </div>
  );
}
