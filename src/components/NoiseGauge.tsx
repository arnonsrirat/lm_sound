"use client";

import { useEffect, useState } from "react";
import { noiseLevelLabels, type NoiseLevel } from "@/lib/validations/spot";

export default function NoiseGauge({ noiseLevel, showLabel = true, compact = false }: { noiseLevel: string; showLabel?: boolean; compact?: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const level = (noiseLevel in noiseLevelLabels ? noiseLevel : "moderate") as NoiseLevel;
  const value = ({ quiet: 25, moderate: 55, lively: 85 } as Record<NoiseLevel, number>)[level];
  const label = noiseLevelLabels[level].label;

  if (!mounted) return <span className={compact ? "inline-block h-8 w-16" : "inline-block h-12 w-24"} aria-hidden="true" />;

  const sizeClass = compact ? "w-16 h-8" : "w-24 h-12";
  const textClass = compact ? "text-[10px]" : "text-xs";
  return (
    <div className="inline-flex items-center gap-2">
      <div className={`relative overflow-hidden rounded-t-full ${sizeClass} bg-[conic-gradient(from_270deg_at_50%_100%,#22c55e_0deg,#eab308_55deg,#ef4444_110deg,transparent_110deg)]`} aria-label={`ระดับเสียง ${label}`}>
        <div className="absolute bottom-0 left-1/2 h-1/2 w-1/2 origin-left" style={{ transform: `rotate(${180 + value * 1.8}deg)` }}>
          <span className="absolute left-0 top-1/2 block h-0.5 w-[90%] -translate-y-1/2 rounded bg-white shadow" />
        </div>
        <div className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-white" />
      </div>
      {showLabel && <span className={`font-semibold ${textClass}`}>{label}</span>}
      <span className="sr-only">ระดับเสียงรบกวน: {label}</span>
    </div>
  );
}
