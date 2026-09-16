"use client";

import dynamic from "next/dynamic";
import type { CampusMapSpot } from "./CampusMapInner";
import { useMemo, useState } from "react";

const CampusMapInner = dynamic(() => import("./CampusMapInner"), { ssr: false });

export default function CampusMap(props: {
  spots: CampusMapSpot[];
  selected?: { latitude: number; longitude: number } | null;
  onPick?: (latitude: number, longitude: number) => void;
  interactive?: boolean;
}) {
  const [activeSpot, setActiveSpot] = useState<CampusMapSpot | null>(null);
  const resolvedSpots = useMemo(() => props.spots.map((spot, index) => {
    if (spot.latitude != null && spot.longitude != null) return spot;
    const angle = (index * 67.5 * Math.PI) / 180;
    const radius = 0.002 + ((index % 4) * 0.0012);
    return { ...spot, latitude: Number((7.80822 + Math.sin(angle) * radius).toFixed(5)), longitude: Number((99.93869 + Math.cos(angle) * radius * 1.3).toFixed(5)) };
  }), [props.spots]);
  return (
    <>
      <div className="h-[320px] w-full overflow-hidden rounded-2xl border border-purple-500/25 bg-slate-900">
        <CampusMapInner {...props} spots={resolvedSpots} onMarkerClick={setActiveSpot} />
      </div>
      {activeSpot && <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/70 p-4" onClick={() => setActiveSpot(null)}><div className="w-full max-w-md overflow-hidden rounded-3xl border border-purple-400/40 bg-[#160b2b] shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="relative">{activeSpot.imageUrl && <img src={activeSpot.imageUrl} alt={activeSpot.title} className="h-52 w-full object-cover" />}<button type="button" onClick={() => setActiveSpot(null)} className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-sm text-white">×</button></div><div className="space-y-3 p-5"><h3 className="text-xl font-bold text-purple-100">{activeSpot.title}</h3><p className="text-sm text-cyan-200">📍 {activeSpot.location}</p><p className="text-sm leading-relaxed text-purple-200/75">{activeSpot.description || "รายละเอียดสถานที่อ่านหนังสือและเสียงบรรยากาศ"}</p><div className="flex items-center justify-between"><span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-200">ระดับเสียง: {activeSpot.noiseLevel}</span>{activeSpot.audioUrl && <audio controls src={activeSpot.audioUrl} className="h-8 max-w-[190px]" />}</div></div></div></div>}
    </>
  );
}
