import L from "leaflet";

export const MOROCCO_BOUNDS = L.latLngBounds([20.7, -17.2], [36.0, -0.9]);
export const MAX_BOUNDS = MOROCCO_BOUNDS.pad(0.5);
export const FIT_PADDING = L.point(24, 24);
export const TILE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
export const CITY_ZOOM = 12;
export const RESET_ZOOM = 9;
export const MAX_ZOOM = 18;

export const MARKER_COLORS = ["bg-[#ccee00]", "bg-[#9bf6ff]", "bg-[#ffd6a5]", "bg-[#ffb3c6]", "bg-[#0ea5e9]"];
