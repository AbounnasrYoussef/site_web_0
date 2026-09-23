"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/(moel-oua)/ui/card";
import { MapViewProps } from "./types";

const MapView = dynamic(() => import("./map-view"), {
  ssr: false,
  loading: () => (
    <Card className="relative overflow-hidden border-2 border-black bg-[var(--color-bg)] shadow-[6px_6px_0px_#000] rounded-3xl flex items-center justify-center h-[600px] w-full">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-black border-t-[#ccee00] rounded-full animate-spin"></div>
        <p className="font-black text-sm uppercase">Loading Map...</p>
      </div>
    </Card>
  ),
});

export function MyMap(props: MapViewProps) {
  return <MapView {...props} />;
}

export default MyMap;
