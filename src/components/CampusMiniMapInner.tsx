"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import type { CampusMapSpot } from "./CampusMapInner";

const CAMPUS_CENTER: [number, number] = [7.80822, 99.93869];

// แคชหมุดจิ๋ว 3 ระดับเสียงสำหรับ Mini-Map
const miniPinCache: Record<string, L.DivIcon> = {};

function getMiniPinIcon(noiseLevel?: string): L.DivIcon {
  const level = (noiseLevel && ["quiet", "moderate", "lively"].includes(noiseLevel)
    ? noiseLevel
    : "moderate") as "quiet" | "moderate" | "lively";

  if (miniPinCache[level]) return miniPinCache[level];

  let colorClass = "from-amber-500 to-orange-600";
  let pingColor = "bg-amber-400";

  if (level === "quiet") {
    colorClass = "from-emerald-400 to-teal-600";
    pingColor = "bg-emerald-400";
  } else if (level === "lively") {
    colorClass = "from-rose-500 to-pink-600";
    pingColor = "bg-rose-400";
  }

  const icon = L.divIcon({
    className: "lmsound-mini-pin",
    html: `<span class="relative flex h-3.5 w-3.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full ${pingColor} opacity-75"></span><span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-gradient-to-tr ${colorClass} border border-white shadow-md"></span></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

  miniPinCache[level] = icon;
  return icon;
}

export default function CampusMiniMapInner({
  spots = [],
}: {
  spots: CampusMapSpot[];
}) {
  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={CAMPUS_CENTER}
        zoom={15}
        zoomControl={false}
        attributionControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {spots.map((spot) =>
          spot.latitude != null && spot.longitude != null ? (
            <Marker
              key={`mini-${spot.id}`}
              position={[spot.latitude, spot.longitude]}
              icon={getMiniPinIcon(spot.noiseLevel)}
            />
          ) : null
        )}
      </MapContainer>
    </div>
  );
}
