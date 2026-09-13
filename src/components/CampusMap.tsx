"use client";

import dynamic from "next/dynamic";
import type { CampusMapSpot } from "./CampusMapInner";

const CampusMapInner = dynamic(() => import("./CampusMapInner"), { ssr: false });

export default function CampusMap(props: {
  spots: CampusMapSpot[];
  selected?: { latitude: number; longitude: number } | null;
  onPick?: (latitude: number, longitude: number) => void;
  interactive?: boolean;
}) {
  return (
    <div className="h-[320px] w-full overflow-hidden rounded-2xl border border-purple-500/25 bg-slate-900">
      <CampusMapInner {...props} />
    </div>
  );
}
