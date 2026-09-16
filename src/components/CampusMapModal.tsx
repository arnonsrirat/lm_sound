"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import Link from "next/link";
import { X, Navigation, Play, Pause, Compass, MapPin, ExternalLink, Sparkles } from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import NoiseGauge from "@/components/NoiseGauge";
import type { CampusMapSpot } from "./CampusMapInner";
import { AmenityBadges } from "@/components/AmenityBadges";

// โหลด Dynamic เพื่อหลีกเลี่ยง Leaflet SSR Error
const CampusMapInner = dynamic(() => import("./CampusMapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0a0517] flex items-center justify-center text-purple-300">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-fuchsia-400 border-t-transparent animate-spin" />
        <span className="text-xs font-semibold">กำลังโหลดแผนที่วิทยาเขต...</span>
      </div>
    </div>
  ),
});

// Helper สร้างพิกัดจำลองภายใน ม.ทักษิณ พัทลุง สำหรับ Spot ที่ยังไม่มี lat/lng ใน DB
function resolveSpotCoordinates(spot: CampusMapSpot, index: number): { lat: number; lng: number } {
  if (spot.latitude != null && spot.longitude != null) {
    return { lat: spot.latitude, lng: spot.longitude };
  }
  // จุดศูนย์กลาง ม.ทักษิณ พัทลุง
  const baseLat = 7.80822;
  const baseLng = 99.93869;
  
  // Offset วนลูปเพื่อกระจายจุดไม่ให้ทับกัน
  const angle = (index * 67.5 * Math.PI) / 180;
  const radius = 0.002 + ((index % 4) * 0.0012);
  const lat = Number((baseLat + Math.sin(angle) * radius).toFixed(5));
  const lng = Number((baseLng + Math.cos(angle) * radius * 1.3).toFixed(5));
  return { lat, lng };
}

export default function CampusMapModal({
  isOpen,
  onClose,
  spots,
  initialSpotId,
}: {
  isOpen: boolean;
  onClose: () => void;
  spots: CampusMapSpot[];
  initialSpotId?: string | null;
}) {
  const [mounted, setMounted] = useState(false);
  const { isPlaying, activeTrack, playSpot, togglePlay } = useAudio();
  const [selectedSpot, setSelectedSpot] = useState<CampusMapSpot | null>(null);

  // ตรวจสอบ mounted สำหรับ Next.js SSR Portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // เตรียม Spots ให้มีพิกัดพร้อมแสดงผลทั้งหมด
  const enrichedSpots = useMemo(() => {
    return spots.map((spot, idx) => {
      const coords = resolveSpotCoordinates(spot, idx);
      return {
        ...spot,
        latitude: coords.lat,
        longitude: coords.lng,
      };
    });
  }, [spots]);

  useEffect(() => {
    if (initialSpotId) {
      const found = enrichedSpots.find((s) => s.id === initialSpotId);
      if (found) setSelectedSpot(found);
    } else {
      // เปิดแผนที่พร้อมแสดงข้อมูลจุดแรกทันที ผู้ใช้ยังคลิกหมุดอื่นเพื่อดูรายละเอียดเพิ่มได้
      if (isOpen) setSelectedSpot(enrichedSpots[0] ?? null);
    }
  }, [initialSpotId, isOpen, enrichedSpots]);

  // ปิดด้วยปุ่ม Escape และ Lock scroll เมื่อ Modal เปิด
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const isCurrentSpotPlaying =
    selectedSpot && isPlaying && activeTrack.id === selectedSpot.id;

  const handlePlaySpot = (spot: CampusMapSpot) => {
    if (isCurrentSpotPlaying) {
      togglePlay();
    } else {
      playSpot({
        id: spot.id,
        title: spot.title,
        subtitle: spot.description || "",
        category: spot.noiseLevel,
        imageUrl: spot.imageUrl || "/default-banner.png",
        audioUrl: spot.audioUrl || "",
        location: spot.location,
      });
    }
  };

  const handleNavigateGoogleMaps = (spot: CampusMapSpot) => {
    if (!spot.latitude || !spot.longitude) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // เรนเดอร์ออกทาง React Portal ไปยัง document.body เพื่อแก้ปัญหา containing block ของ sidebar
  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 md:p-8 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Centered Modal with SweetAlert Smooth Pop-in Bounce Animation */}
      <div
        className="relative w-full max-w-5xl h-[90vh] sm:h-[86vh] flex flex-col rounded-3xl overflow-hidden border border-purple-500/40 bg-[#0c071a] shadow-2xl shadow-purple-950/90 animate-sweetalert"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-purple-500/20 bg-[#120a26]/95 backdrop-blur-xl z-20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-md shadow-purple-900/40">
              <Compass className="w-5 h-5 text-fuchsia-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-1.5">
                  แผนที่วิทยาเขต ม.ทักษิณ พัทลุง
                  <Sparkles className="w-4 h-4 text-fuchsia-400 hidden sm:inline" />
                </h2>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/20 border border-purple-400/30 text-purple-200">
                  {enrichedSpots.length} จุดปักหมุด
                </span>
              </div>
              <p className="text-xs text-purple-300/70 hidden sm:block">
                สำรวจจุดอ่านหนังสือ คลิกหมุดเพื่อเปิดการ์ดโฮโลแกรม หรือกดนำทางไปยังสถานที่จริง
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-purple-950/50 hover:bg-purple-600/30 text-purple-300 hover:text-white transition border border-purple-500/30 cursor-pointer shadow-sm"
              title="ปิดแผนที่ (Esc)"
              aria-label="ปิดหน้าต่างแผนที่"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Map & Holographic Panel Layout */}
        <div className="relative flex-1 w-full h-full min-h-0 overflow-hidden">
          {/* Leaflet Map Full Interactive View */}
          <div className="w-full h-full">
            <CampusMapInner
              spots={enrichedSpots}
              selected={
                selectedSpot?.latitude && selectedSpot?.longitude
                  ? { latitude: selectedSpot.latitude, longitude: selectedSpot.longitude }
                  : null
              }
              onMarkerClick={(spot) => setSelectedSpot(spot)}
              interactive={true}
            />
          </div>

          {/* Quick Spot Pill Selector Bar (ด้านบนแผนที่) */}
          <div className="absolute top-3 left-3 right-3 z-[1000] flex gap-2 overflow-x-auto pb-1 scrollbar-none pointer-events-auto">
            {enrichedSpots.map((spot) => {
              const isSelected = selectedSpot?.id === spot.id;
              // สีของจุดระบุระดับเสียงรบกวน 3 แบบ
              const dotColor =
                spot.noiseLevel === "quiet"
                  ? "bg-emerald-400 shadow-[0_0_8px_#10b981]"
                  : spot.noiseLevel === "lively"
                  ? "bg-rose-400 shadow-[0_0_8px_#f43f5e]"
                  : "bg-amber-400 shadow-[0_0_8px_#f59e0b]";

              return (
                <button
                  key={spot.id}
                  onClick={() => setSelectedSpot(spot)}
                  type="button"
                  className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl transition shadow-lg cursor-pointer border ${
                    isSelected
                      ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white border-fuchsia-300 shadow-purple-500/50 scale-105"
                      : "bg-[#140a2b]/90 text-purple-200 hover:bg-purple-900/70 border-purple-500/40 hover:text-white"
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? "bg-white animate-ping" : dotColor}`} />
                  <span className="truncate max-w-[140px]">{spot.title}</span>
                </button>
              );
            })}
          </div>

          {/* แสดงสรุปสถานที่ทุกจุดทันที ไม่ต้องคลิกหมุดเพื่อดูข้อมูลเบื้องต้น */}
          <div className="absolute top-14 right-3 z-[1000] hidden max-h-[calc(100%-8rem)] w-64 space-y-2 overflow-y-auto rounded-2xl bg-[#0f0724]/85 p-2 backdrop-blur-xl sm:block">
            {enrichedSpots.map((spot) => (
              <button key={spot.id} type="button" onClick={() => setSelectedSpot(spot)} className={`flex w-full items-center gap-2 rounded-xl border p-2 text-left transition ${selectedSpot?.id === spot.id ? "border-fuchsia-300 bg-purple-600/50" : "border-purple-500/25 bg-purple-950/50 hover:bg-purple-800/50"}`}>
                {spot.imageUrl ? <img loading="lazy" decoding="async" src={spot.imageUrl} alt="" className="h-10 w-12 shrink-0 rounded-lg object-cover" /> : <span className="h-10 w-12 shrink-0 rounded-lg bg-purple-900/60" />}
                <span className="min-w-0"><strong className="block truncate text-xs text-white">{spot.title}</strong><span className="block truncate text-[10px] text-purple-200/75">📍 {spot.location}</span><span className="block text-[10px] text-cyan-200/75">{spot.noiseLevel === "quiet" ? "เงียบสงบ" : spot.noiseLevel === "lively" ? "คึกคัก" : "ปานกลาง"}</span><AmenityBadges amenities={spot.amenities} compact /></span>
              </button>
            ))}
          </div>
          <div className="absolute top-14 left-3 right-3 z-[1000] flex gap-2 overflow-x-auto pb-1 sm:hidden">
            {enrichedSpots.map((spot) => (
              <button key={spot.id} type="button" onClick={() => setSelectedSpot(spot)} className="flex min-w-[190px] items-center gap-2 rounded-xl border border-purple-500/30 bg-[#0f0724]/90 p-2 text-left backdrop-blur-xl">
                {spot.imageUrl ? <img loading="lazy" decoding="async" src={spot.imageUrl} alt="" className="h-9 w-11 shrink-0 rounded-lg object-cover" /> : <span className="h-9 w-11 shrink-0 rounded-lg bg-purple-900/60" />}
                <span className="min-w-0"><strong className="block truncate text-[11px] text-white">{spot.title}</strong><span className="block truncate text-[10px] text-purple-200/75">{spot.location}</span><AmenityBadges amenities={spot.amenities} compact /></span>
              </button>
            ))}
          </div>

          {/* 3 Noise-Level Map Legend (คำอธิบายสัญลักษณ์ 3 แบบ) */}
          <div className="absolute bottom-3 left-3 z-[1000] hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-2xl bg-[#0f0724]/90 backdrop-blur-xl border border-purple-500/30 text-[11px] font-semibold text-white shadow-xl pointer-events-auto">
            <span className="text-purple-300 text-[10px] uppercase font-bold tracking-wider">
              ระดับเสียง:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
              <span className="text-emerald-300 text-[10px]">เงียบสงบ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]" />
              <span className="text-amber-300 text-[10px]">ปานกลาง</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
              <span className="text-rose-300 text-[10px]">คึกคัก / คาเฟ่</span>
            </div>
          </div>

          {/* Hologram Floating Spot Card (การ์ดโฮโลแกรมแสดงรายละเอียดสำคัญ) */}
          {selectedSpot && (
            <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-5 sm:bottom-5 z-[1000] sm:w-[370px] hologram-card rounded-3xl p-4 sm:p-5 animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto shadow-2xl">
              {/* Header inside Hologram Card */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs text-fuchsia-300 font-medium mb-1">
                    <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                    <span className="truncate">{selectedSpot.location}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-wide truncate hologram-glow">
                    {selectedSpot.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedSpot(null)}
                  type="button"
                  className="p-1 rounded-full text-purple-300/70 hover:text-white hover:bg-purple-500/20 transition cursor-pointer"
                  title="ซ่อนการ์ด"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Spot Image Preview with Hologram sheen */}
              {selectedSpot.imageUrl && (
                <div className="relative h-32 sm:h-36 w-full rounded-2xl overflow-hidden mb-3 border border-purple-400/30 bg-purple-950/60 shadow-inner">
                  <img
                    src={selectedSpot.imageUrl}
                    alt={selectedSpot.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c071a] via-transparent to-transparent opacity-80" />
                  
                  {/* Gauge Overlay */}
                  <div className="absolute top-2 left-2">
                    <NoiseGauge noiseLevel={selectedSpot.noiseLevel} />
                  </div>

                  {/* Play Sound Floating Button on Image */}
                  {selectedSpot.audioUrl && (
                    <button
                      onClick={() => handlePlaySpot(selectedSpot)}
                      type="button"
                      className={`absolute bottom-2 right-2 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold transition shadow-lg cursor-pointer ${
                        isCurrentSpotPlaying
                          ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white animate-pulse"
                          : "bg-purple-950/90 text-purple-200 hover:bg-purple-800/90 border border-purple-400/40"
                      }`}
                    >
                      {isCurrentSpotPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>หยุดฟัง</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>ฟังเสียง</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Description preview */}
              <AmenityBadges amenities={selectedSpot.amenities} />
              <p className="text-xs text-purple-200/80 line-clamp-2 mb-3.5 leading-relaxed">
                {selectedSpot.description || "สถานที่อ่านหนังสือและพักผ่อนในวิทยาเขตพัทลุง"}
              </p>

              {/* Action Buttons: 1) นำทาง Google Maps 2) ดูรายละเอียดเต็ม */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-purple-500/20">
                <button
                  onClick={() => handleNavigateGoogleMaps(selectedSpot)}
                  type="button"
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition shadow-lg shadow-cyan-900/40 active:scale-95 cursor-pointer border border-cyan-400/40"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>นำทาง (Maps)</span>
                </button>

                <Link
                  href={`/spots/${selectedSpot.id}`}
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 hover:text-white text-xs font-bold transition border border-purple-500/40 text-center"
                >
                  <span>ดูข้อมูลเต็ม</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
