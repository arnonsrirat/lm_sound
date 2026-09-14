"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Compass, Maximize2, MapPin, Sparkles } from "lucide-react";
import CampusMapModal from "./CampusMapModal";
import type { CampusMapSpot } from "./CampusMapInner";

// Dynamic import Leaflet inner mini map without SSR
const CampusMiniMapInner = dynamic(() => import("./CampusMiniMapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900 flex items-center justify-center text-purple-300 text-xs">
      <span className="animate-pulse">กำลังโหลดแผนที่...</span>
    </div>
  ),
});

function resolveMiniMapCoordinates(spot: CampusMapSpot, index: number): { lat: number; lng: number } {
  if (spot.latitude != null && spot.longitude != null) {
    return { lat: spot.latitude, lng: spot.longitude };
  }
  const baseLat = 7.80822;
  const baseLng = 99.93869;
  const angle = (index * 67.5 * Math.PI) / 180;
  const radius = 0.002 + ((index % 4) * 0.0012);
  const lat = Number((baseLat + Math.sin(angle) * radius).toFixed(5));
  const lng = Number((baseLng + Math.cos(angle) * radius * 1.3).toFixed(5));
  return { lat, lng };
}

export default function CampusMiniMap({
  spots = [],
}: {
  spots?: CampusMapSpot[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // เตรียม Spots ให้มีพิกัดพร้อมแสดงผลทั้งหมด
  const enrichedSpots = useMemo(() => {
    return spots.map((spot, idx) => {
      const coords = resolveMiniMapCoordinates(spot, idx);
      return {
        ...spot,
        latitude: coords.lat,
        longitude: coords.lng,
      };
    });
  }, [spots]);

  return (
    <>
      <div className="px-3 pt-2">
        {/* Interactive Real Mini-Map Card */}
        <div
          onClick={() => setIsModalOpen(true)}
          className="group relative rounded-2xl overflow-hidden border border-purple-500/30 bg-gradient-to-b from-[#190d36] to-[#0b0517] p-2.5 shadow-lg shadow-purple-950/40 hover:border-fuchsia-400/70 hover:shadow-purple-500/30 transition-all duration-300 cursor-pointer text-left transform hover:-translate-y-0.5 active:scale-[0.98]"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setIsModalOpen(true);
            }
          }}
          aria-label="คลิกเพื่อขยายแผนที่จุดอ่านหนังสือ ม.ทักษิณ พัทลุง ในรูปแบบ Modal กลางจอ"
        >
          {/* Mini-Map Header */}
          <div className="relative z-10 flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-500" />
              </span>
              <span className="text-[11px] font-bold text-fuchsia-300 uppercase tracking-wider flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-fuchsia-400" />
                แผนที่วิทยาเขต
              </span>
            </div>

            <span className="p-1 rounded-lg bg-purple-600/30 text-purple-200 group-hover:text-white group-hover:bg-purple-600/60 transition shadow-sm">
              <Maximize2 className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Real Mini Map Window (หน้าต่างแผนที่จริงขนาดย่อส่วน) */}
          <div className="relative z-10 h-28 w-full rounded-xl overflow-hidden border border-purple-400/40 bg-slate-950 shadow-inner group-hover:border-fuchsia-400/70 transition-colors">
            {/* Real Map Rendering (OpenStreetMap tiles + campus pins) */}
            <div className="w-full h-full pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity">
              <CampusMiniMapInner spots={enrichedSpots} />
            </div>

            {/* Radar scanline overlay effect for high-tech spatial feel */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-purple-500/5 via-transparent to-purple-900/15" />

            {/* Hover overlay inviting user to click & expand to SweetAlert Modal */}
            <div className="absolute inset-0 bg-purple-950/40 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-all flex items-center justify-center gap-1.5 text-white text-[11px] font-bold shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-300 animate-pulse" />
              <span className="bg-purple-900/90 px-3 py-1 rounded-full border border-fuchsia-400/50 shadow-md">
                คลิกเพื่อขยายแผนที่
              </span>
            </div>
          </div>

          {/* Mini-Map Footer Details */}
          <div className="relative z-10 mt-2 flex items-center justify-between text-[11px]">
            <span className="text-purple-200/90 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-fuchsia-400" />
              ม.ทักษิณ พัทลุง
            </span>
            <span className="text-fuchsia-300 font-bold bg-purple-500/25 px-2 py-0.5 rounded-full border border-purple-400/30 text-[10px]">
              {spots.length} จุด
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Modal (Rendered to body via React Portal) */}
      <CampusMapModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        spots={spots}
      />
    </>
  );
}
