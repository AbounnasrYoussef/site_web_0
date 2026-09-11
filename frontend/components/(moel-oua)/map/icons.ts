import L from "leaflet";
import { CityGroup, School } from "./types";

export function createCityIcon(group: CityGroup): L.DivIcon {
  return L.divIcon({
    className: "bg-transparent border-none",
    html: `
      <div class="px-2 py-0.5 rounded-full border-2 border-black font-black text-[10px] uppercase shadow-[2px_2px_0px_#000] text-black ${group.color} hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 w-max">
        <span>${group.city}</span>
        <span class="w-4 h-4 rounded-full bg-black text-white text-[9px] font-black flex items-center justify-center shrink-0">
          ${group.count}
        </span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [30, 10],
    popupAnchor: [0, -10],
  });
}

export function createSchoolIcon(school: School): L.DivIcon {
  return L.divIcon({
    className: "bg-transparent border-none",
    html: `
      <div class="px-2 py-0.5 rounded-lg border-2 border-black font-black text-[9px] uppercase shadow-[1.5px_1.5px_0px_#000] text-black ${school.color} hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1 w-max">
        <span class="w-1.5 h-1.5 rounded-full bg-black"></span>
        <span>${school.abrv}</span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [25, 8],
    popupAnchor: [0, -8],
  });
}

