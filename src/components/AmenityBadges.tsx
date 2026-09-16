import { AirVent, Lightbulb, Plug, Wind, Wifi, Wrench } from "lucide-react";
import type { AmenityKey } from "@/lib/validations/spot";

const AMENITY_META: Record<AmenityKey, { label: string; Icon: typeof Plug }> = {
  power: { label: "ปลั๊กไฟ", Icon: Plug },
  wifi: { label: "Wi‑Fi", Icon: Wifi },
  lighting: { label: "แสงสว่าง", Icon: Lightbulb },
  aircon: { label: "เครื่องปรับอากาศ", Icon: AirVent },
  fan: { label: "พัดลม", Icon: Wind },
  other: { label: "สิ่งอำนวยความสะดวกอื่นๆ", Icon: Wrench },
};

export function AmenityBadges({ amenities = [], compact = false }: { amenities?: string[]; compact?: boolean }) {
  const visible = amenities.filter((amenity): amenity is AmenityKey => amenity in AMENITY_META);
  if (visible.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5" aria-label="สิ่งอำนวยความสะดวก">
      {visible.map((amenity) => {
        const { label, Icon } = AMENITY_META[amenity];
        return (
          <span key={amenity} title={label} className={`inline-flex items-center gap-1 rounded-lg border border-cyan-300/45 bg-cyan-400/15 font-semibold text-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.16)] ${compact ? "px-1.5 py-1 text-[10px]" : "px-2 py-1 text-[11px]"}`}>
            <Icon className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
            <span>{label}</span>
          </span>
        );
      })}
    </div>
  );
}

export const AMENITY_OPTIONS: Array<{ key: AmenityKey; label: string; Icon: typeof Plug }> = Object.entries(AMENITY_META).map(([key, value]) => ({ key: key as AmenityKey, ...value }));
