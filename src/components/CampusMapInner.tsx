"use client";

import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";

export interface CampusMapSpot {
  id: string;
  title: string;
  location: string;
  noiseLevel: string;
  latitude?: number | null;
  longitude?: number | null;
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
}: {
  spots: CampusMapSpot[];
  selected?: { latitude: number; longitude: number } | null;
  onPick?: (latitude: number, longitude: number) => void;
  interactive?: boolean;
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
          <Marker key={spot.id} position={[spot.latitude, spot.longitude]} icon={pinIcon}>
            <Popup>
              <strong>{spot.title}</strong>
              <br />
              {spot.location}
            </Popup>
          </Marker>
        ) : null
      )}
      {selected && (
        <CircleMarker
          center={[selected.latitude, selected.longitude]}
          radius={10}
          pathOptions={{ color: "#c084fc", fillColor: "#a855f7", fillOpacity: 0.45 }}
        />
      )}
    </MapContainer>
  );
}
