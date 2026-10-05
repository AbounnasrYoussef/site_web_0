"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, ZoomControl, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslations, useLocale } from "next-intl";
import { fetchSchools } from "@/components/(moel-oua)/api";
import { CityGroup, School } from "./types";
import { MOROCCO_BOUNDS, MAX_BOUNDS, FIT_PADDING, MAX_ZOOM, TILE_URL } from "./data";
import { Label, LabelMarkers } from "./label-markers";
import { ZoomHandler } from "./zoom-handler";
import UniversityPanel from "./university-panel";

const buttonClass = "px-3 py-1.5 rounded-lg font-bold text-xs uppercase cursor-pointer border-2 border-black transition-all";
const raisedClass = "text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";

function useGeoJson(url: string) {
  const [data, setData] = useState<GeoJSON.GeoJsonObject | null>(null);

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData(null));
  }, [url]);

  return data;
}

const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

function groupByCity(schools: School[]): CityGroup[] {
  const cities = new Map<string, School[]>();
  schools.forEach((school) => cities.set(school.city, [...(cities.get(school.city) ?? []), school]));

  return [...cities].map(([city, citySchools]) => ({
    city,
    schools: citySchools,
    center: [average(citySchools.map((school) => school.latitude)), average(citySchools.map((school) => school.longitude))],
  }));
}

export default function MapView() {
  const t = useTranslations("map");
  const locale = useLocale();
  const [schools, setSchools] = useState<School[]>([]);
  const [failed, setFailed] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [universityId, setUniversityId] = useState<string | null>(null);
  const mask = useGeoJson("/morocco-mask.geojson");
  const border = useGeoJson("/morocco-full.geojson");

  useEffect(() => {
    fetchSchools(locale)
      .then(setSchools)
      .catch(() => setFailed(true));
  }, [locale]);

  const cityGroups = useMemo(() => groupByCity(schools), [schools]);
  const selectedGroup = cityGroups.find((group) => group.city === selectedCity);
  const resetCity = useCallback(() => setSelectedCity(null), []);

  const cityLabels: Label[] = [...cityGroups].sort((a, b) => b.schools.length - a.schools.length).map((group) => ({
    id: group.city,
    text: group.city,
    position: group.center,
    count: group.schools.length,
    onClick: () => setSelectedCity(group.city),
  }));
  const schoolLabels: Label[] = (selectedGroup?.schools ?? []).map((school) => ({
    id: school.id,
    text: school.abrv,
    position: [school.latitude, school.longitude],
    onClick: () => setUniversityId(school.university_id),
  }));

  return (
    <div className="relative w-full flex-1 min-h-[420px] overflow-hidden">
      <div
        dir={locale === "ar" ? "rtl" : "ltr"}
        className="absolute bottom-10 inset-x-0 z-[1000] flex justify-center px-4 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:inset-x-auto sm:start-4 sm:px-0 pointer-events-none"
      >
        <div className="flex flex-row sm:flex-col flex-wrap justify-center gap-2 bg-white/90 p-3 rounded-xl border-2 border-black shadow-lg pointer-events-auto">
          {failed && <p className="text-xs font-bold text-red-600">{t("error")}</p>}
          <button onClick={resetCity} className={`${buttonClass} ${raisedClass} bg-red-400`}>
            {t("reset-map")}
          </button>
          {cityGroups.map((group) => (
            <button
              key={group.city}
              onClick={() => setSelectedCity(group.city)}
              className={`${buttonClass} ${selectedCity === group.city ? "bg-black text-white" : `bg-white ${raisedClass}`}`}
            >
              {group.city} ({group.schools.length})
            </button>
          ))}
        </div>
      </div>

      <MapContainer
        bounds={MOROCCO_BOUNDS}
        boundsOptions={{ padding: FIT_PADDING }}
        zoomSnap={0.25}
        maxZoom={MAX_ZOOM}
        zoomControl={false}
        attributionControl={false}
        maxBounds={MAX_BOUNDS}
        className="absolute inset-0 z-0 bg-[#f4f1ea]"
      >
        <TileLayer url={TILE_URL} />
        {mask && <GeoJSON data={mask} style={{ fillColor: "#f4f1ea", fillOpacity: 0.72, stroke: false }} />}
        {border && <GeoJSON data={border} style={{ fillOpacity: 0, color: "#18181b", weight: 1.8, opacity: 0.75 }} />}

        <ZoomHandler focus={selectedGroup?.center ?? null} onZoomOut={resetCity} />
        <ZoomControl position="bottomright" />

        <LabelMarkers labels={selectedGroup ? schoolLabels : cityLabels} cluster={!selectedGroup} />
      </MapContainer>

      {universityId && <UniversityPanel universityId={universityId} onClose={() => setUniversityId(null)} />}
    </div>
  );
}
