"use client";

import { useState } from "react";
import { Compass, Navigation, MapPin } from "lucide-react";
import CampusMapModal from "./CampusMapModal";
import type { CampusMapSpot } from "./CampusMapInner";

export default function MobileCampusMapBar({ spots = [] }: { spots: CampusMapSpot[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="md:hidden w-full">
        <button
          onClick={() => setIsOpen(true)}
          type="button"
          className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/70 via-[#130926]/90 to-purple-900/60 backdrop-blur-xl shadow-lg shadow-purple-950/50 hover:border-fuchsia-400/50 transition active:scale-[0.98] cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-fuchsia-300">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-wide">
                  แผนที่วิทยาเขต ม.ทักษิณ
                </span>
                <span className="text-[10px] font-semibold bg-fuchsia-500/20 text-fuchsia-300 px-2 py-0.5 rounded-full border border-fuchsia-400/30">
                  {spots.length} จุด
                </span>
              </div>
              <p className="text-[11px] text-purple-300/70 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-pink-400" />
                แตะเพื่อเปิดหมุดโฮโลแกรม & ระบบนำทาง
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/30 text-purple-200 text-xs font-semibold border border-purple-400/30">
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span>เปิดแผนที่</span>
          </div>
        </button>
      </div>

      <CampusMapModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        spots={spots}
      />
    </>
  );
}
