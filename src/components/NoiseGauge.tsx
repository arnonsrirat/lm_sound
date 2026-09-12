"use client";

import { Volume1, Volume2, AudioWaveform } from "lucide-react";
import { noiseLevelLabels, type NoiseLevel } from "@/lib/validations/spot";

interface NoiseGaugeProps {
  noiseLevel: string;
  showLabel?: boolean;
  compact?: boolean;
}

/**
 * NoiseGauge — แสดงระดับเสียงรบกวนเป็น "เกจ" 3 ช่อง
 * แทนการแสดงเป็นข้อความล้วน ทำให้เปรียบเทียบระดับเสียงระหว่างสถานที่ได้ง่ายขึ้น
 */
export default function NoiseGauge({ noiseLevel, showLabel = true, compact = false }: NoiseGaugeProps) {
  const config = noiseLevelLabels[noiseLevel as NoiseLevel];
  const level = config ? (noiseLevel as NoiseLevel) : "moderate";
  const label = config?.label || noiseLevel;

  const levels: { key: NoiseLevel; icon: typeof Volume1 }[] = [
    { key: "quiet", icon: Volume1 },
    { key: "moderate", icon: Volume2 },
    { key: "lively", icon: AudioWaveform },
  ];

  // ความสูงของแต่ละช่องเกจ (สัญลักษณ์เกจเสียง)
  const barHeights = ["h-1.5", "h-3", "h-4.5"];

  const gaugeColors: Record<NoiseLevel, string> = {
    quiet: "bg-sky-300",
    moderate: "bg-violet-400",
    lively: "bg-fuchsia-400",
  };

  const filledIndex = levels.findIndex((l) => l.key === level);

  return (
    <div className="inline-flex items-center gap-2">
      {/* เกจ 3 ช่อง */}
      <div className={`flex items-end gap-[3px] ${compact ? "h-4" : "h-5"}`} aria-hidden="true">
        {levels.map((l, idx) => (
          <span
            key={l.key}
            className={`w-1.5 rounded-full transition-all duration-300 ${barHeights[idx]} ${
              idx <= filledIndex ? gaugeColors[level] : "bg-current opacity-20"
            }`}
          />
        ))}
      </div>

      {showLabel && (
        <span className={`font-semibold ${compact ? "text-[10px]" : "text-xs"}`}>
          {label}
        </span>
      )}

      <span className="sr-only">
        ระดับเสียงรบกวน: {label} ({filledIndex + 1}/3)
      </span>
    </div>
  );
}
