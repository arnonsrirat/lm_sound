"use client";

import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";

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
}

const CAMPUS_CENTER: LatLngExpression = [7.80822, 99.93869];
const CAMPUS_BOUNDS = L.latLngBounds([7.795, 99.925], [7.822, 99.955]);

const pinIcon = L.divIcon({
  className: "lmsound-map-pin",
  html: '<span class="lmsound-map-pin-dot"></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function PinDropper({ onPick }: { onPick?: (latitude: number, longitude: number) => void }) {
  useMapEvents({
    click(event) {
      onPick?.(event.latlng.lat, event.latlng.lng);
    },
  });
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
      center={CAMPUS_CENTER}
      zoom={16}
      minZoom={15}
      maxZoom={19}
      maxBounds={CAMPUS_BOUNDS}
      maxBoundsViscosity={1}
      scrollWheelZoom={interactive}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {interactive && <PinDropper onPick={onPick} />}
      {spots.map((spot) =>
        spot.latitude != null && spot.longitude != null ? (
          <Marker key={spot.id} position={[spot.latitude, spot.longitude]} icon={pinIcon} eventHandlers={{ click: () => onMarkerClick?.(spot) }}>
            <Popup>
              <div className="min-w-[150px] overflow-hidden rounded-lg">
                {spot.imageUrl && <img src={spot.imageUrl} alt={spot.title} className="mb-2 h-20 w-full rounded object-cover" />}
                <strong className="block text-sm">{spot.title}</strong>
                <span className="text-xs">{spot.location}</span>
                <span className="mt-1 block text-[10px] text-purple-600">คลิกหมุดเพื่อดูรายละเอียด</span>
              </div>
            </Popup>
          </Marker>
        ) : null
      )}
      {selected && (
        <Marker position={[selected.latitude, selected.longitude]} icon={pinIcon} />
      )}
    </MapContainer>
  );
}
