"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import { AmenityBadges } from "@/components/AmenityBadges";
import { getOptimizedImageUrl } from "@/lib/media-url";

export interface CampusMapSpot {
  id: string;
  title: string;
  location: string;
  noiseLevel: string;
  latitude?: number | null;
  longitude?: number | null;
  imageUrl?: string;
  description?: string;
  audioUrl?: string;
  amenities?: string[];
}

const CAMPUS_CENTER: LatLngExpression = [7.80822, 99.93869];
const CAMPUS_BOUNDS = L.latLngBounds([7.74, 99.86], [7.88, 100.02]);

// แคช Leaflet divIcon สำหรับแต่ละระดับเสียง 3 แบบ
const pinIconsCache: Record<string, L.DivIcon> = {};

function getPinIconByNoiseLevel(noiseLevel?: string): L.DivIcon {
  const level = (noiseLevel && ["quiet", "moderate", "lively"].includes(noiseLevel)
    ? noiseLevel
    : "moderate") as "quiet" | "moderate" | "lively";

  if (pinIconsCache[level]) return pinIconsCache[level];

  let iconSvg = "";
  if (level === "quiet") {
    // 1. เงียบสงบ: ไอคอนหนังสือเปิดอ่าน 📖
    iconSvg = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`;
  } else if (level === "moderate") {
    // 2. ปานกลาง: ไอคอนแก้วกาแฟ ☕
    iconSvg = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>`;
  } else {
    // 3. คึกคัก / คาเฟ่: ไอคอนลำโพงคลื่นเสียง 🔊
    iconSvg = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>`;
  }

  const icon = L.divIcon({
    className: "lmsound-map-pin",
    html: `
      <div class="lmsound-pin-container lmsound-pin-${level}">
        <div class="lmsound-pin-pulse"></div>
        <div class="lmsound-pin-body">
          <div class="lmsound-pin-icon">
            ${iconSvg}
          </div>
        </div>
      </div>
    `,
    iconSize: [36, 44],
    iconAnchor: [18, 42],
    popupAnchor: [0, -42],
  });

  pinIconsCache[level] = icon;
  return icon;
}

function PinDropper({ onPick }: { onPick?: (latitude: number, longitude: number) => void }) {
  useMapEvents({
    dblclick(event) {
      // ใช้ดับเบิลคลิกเพื่อยืนยันตำแหน่ง ป้องกันการแตะ/คลิกครั้งเดียวระหว่างลากแผนที่แล้วปักหมุดโดยไม่ตั้งใจ
      event.originalEvent.preventDefault();
      onPick?.(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

function MapController({ center }: { center?: { latitude: number; longitude: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (center?.latitude && center?.longitude) {
      map.flyTo([center.latitude, center.longitude], 17, {
        duration: 1.0,
      });
    }
  }, [center, map]);
  return null;
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer1 = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    const timer2 = setTimeout(() => {
      map.invalidateSize();
    }, 450);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [map]);
  return null;
}

export default function CampusMapInner({
  spots,
  selected,
  onPick,
  interactive = false,
  onMarkerClick,
}: {
  spots: CampusMapSpot[];
  selected?: { latitude: number; longitude: number } | null;
  onPick?: (latitude: number, longitude: number) => void;
  interactive?: boolean;
  onMarkerClick?: (spot: CampusMapSpot) => void;
}) {
  return (
    <MapContainer
      center={selected?.latitude && selected?.longitude ? [selected.latitude, selected.longitude] : CAMPUS_CENTER}
      zoom={16}
      minZoom={13}
      maxZoom={19}
      maxBounds={CAMPUS_BOUNDS}
      maxBoundsViscosity={0.25}
      scrollWheelZoom={interactive}
      doubleClickZoom={!interactive}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController center={selected} />
      <MapResizer />
      {interactive && <PinDropper onPick={onPick} />}
      {spots.map((spot) =>
        spot.latitude != null && spot.longitude != null ? (
          <Marker
            key={spot.id}
            position={[spot.latitude, spot.longitude]}
            icon={getPinIconByNoiseLevel(spot.noiseLevel)}
          >
            <Popup>
              <div className="min-w-[170px] overflow-hidden rounded-xl p-0.5 text-slate-800">
                {spot.imageUrl && (
                  <img
                    src={getOptimizedImageUrl(spot.imageUrl)}
                    alt={spot.title}
                    className="mb-1.5 h-20 w-full rounded-lg object-cover"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                  />
                )}
                <strong className="block text-sm font-bold text-purple-950 leading-snug">
                  {spot.title}
                </strong>
                <span className="block text-xs text-purple-700/80 mt-0.5">
                  📍 {spot.location}
                </span>
                <div className="mt-2"><AmenityBadges amenities={spot.amenities} compact /></div>
                <button
                  type="button"
                  onClick={() => onMarkerClick?.(spot)}
                  className="mt-2 w-full text-center text-[11px] font-bold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 py-1.5 rounded-lg transition shadow cursor-pointer"
                >
                  ดูการ์ดโฮโลแกรม & นำทาง
                </button>
              </div>
            </Popup>
          </Marker>
        ) : null
      )}
      {selected && (
        <Marker
          position={[selected.latitude, selected.longitude]}
          icon={getPinIconByNoiseLevel("moderate")}
        />
      )}
    </MapContainer>
  );
}
