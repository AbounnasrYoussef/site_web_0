import L from "leaflet";
import { MARKER_COLORS } from "./data";

const markerClass =
  "px-2 py-0.5 rounded-full border-2 border-black font-black text-[10px] uppercase shadow-[2px_2px_0px_#000] text-black cursor-pointer flex items-center gap-1.5 w-max -translate-x-1/2 -translate-y-1/2";

export function createIcon(text: string, colorIndex: number, count?: number): L.DivIcon {
  const marker = document.createElement("div");
  marker.className = `${markerClass} ${MARKER_COLORS[colorIndex % MARKER_COLORS.length]}`;
  marker.append(text);

  if (count !== undefined) {
    const badge = document.createElement("span");
    badge.className = "w-4 h-4 rounded-full bg-black text-white text-[9px] flex items-center justify-center";
    badge.textContent = String(count);
    marker.append(badge);
  }

  return L.divIcon({ className: "bg-transparent border-none", html: marker, iconSize: [0, 0], popupAnchor: [0, -14] });
}
