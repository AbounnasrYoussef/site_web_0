"use client";

import { useState, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/(moel-oua)/ui/card";
import { CityGroup, MapViewProps } from "./types";
import { schools, MOROCCO_BOUNDS_LEAFLET, DEFAULT_CENTER } from "./data";
import { createCityIcon, createSchoolIcon } from "./icons";
import { ZoomHandler } from "./zoom-handler";

export function MapView({ className = "h-[600px] w-full" }: MapViewProps) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(5.2);
  const [maskData, setMaskData] = useState<unknown>(null);
  const [borderData, setBorderData] = useState<unknown>(null);

  useEffect(() => {
    fetch("/morocco-mask.geojson")
      .then((res) => res.json())
      .then((data) => setMaskData(data))
      .catch(console.error);

    fetch("/morocco-full.geojson")
      .then((res) => res.json())
      .then((data) => setBorderData(data))
      .catch(console.error);
  }, []);

  const cityGroups = useMemo(() => {
    const groups: Record<string, CityGroup> = {};
    schools.forEach((s) => {
      if (!groups[s.city]) {
        groups[s.city] = {
          city: s.city,
          count: 0,
          coordinates: s.coordinates,
          color: s.color,
          schools: [],
        };
      }
      groups[s.city].count += 1;
      groups[s.city].schools.push(s);
    });
    return Object.values(groups);
  }, []);

  const handleCityClick = (city: CityGroup) => {
    setSelectedCity(city.city);
  };

  const handleReset = () => {
    setSelectedCity(null);
  };

  const isDetailedZoom = zoomLevel >= 9 || selectedCity !== null;

  return (
    <Card className={`relative overflow-hidden border-2 border-black bg-[#f4f1ea] shadow-[6px_6px_0px_#000] rounded-3xl flex flex-col ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 border-b-2 border-black bg-[#faf7f2] z-[1000] relative">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleReset}
            className={`px-3 py-1 rounded-xl border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_#000] transition-all cursor-pointer ${!selectedCity ? "bg-[#ccee00] text-black" : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
          >
            All Cities ({schools.length})
          </button>
          {cityGroups.map((g) => (
            <button
              key={g.city}
              onClick={() => handleCityClick(g)}
              className={`px-2.5 py-1 rounded-xl border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_#000] transition-all cursor-pointer flex items-center gap-1.5 ${selectedCity === g.city
                ? `${g.color} text-black ring-2 ring-black`
                : "bg-white text-black hover:bg-slate-50"
                }`}
            >
              <span>{g.city}</span>
              <span className="w-4 h-4 rounded-full bg-black text-white text-[9px] font-black flex items-center justify-center">
                {g.count}
              </span>
            </button>
          ))}
        </div>
        {selectedCity && (
          <button
            onClick={handleReset}
            className="px-2.5 py-0.5 rounded-lg border border-black bg-red-400 text-black font-black text-[10px] uppercase hover:bg-red-500 transition-colors cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      <div className="relative flex-1 w-full min-h-[450px] bg-[#f4f1ea]">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={5.2}
          minZoom={4.2}
          maxZoom={16}
          scrollWheelZoom={true}
          className="w-full h-full bg-[#f4f1ea]"
          zoomControl={true}
          maxBounds={MOROCCO_BOUNDS_LEAFLET}
          maxBoundsViscosity={1.0}
        >
          <ZoomHandler selectedCity={selectedCity} cityGroups={cityGroups} onMapMove={setZoomLevel} />

          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {maskData ? (
            <GeoJSON
              data={maskData as GeoJSON.GeoJsonObject}
              style={{
                fillColor: "#f4f1ea",
                fillOpacity: 0.72,
                stroke: false,
              }}
            />
          ) : null}

          {borderData ? (
            <GeoJSON
              data={borderData as GeoJSON.GeoJsonObject}
              style={{
                fillColor: "transparent",
                fillOpacity: 0,
                color: "#18181b",
                weight: 1.8,
                opacity: 0.75,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          ) : null}

          {!isDetailedZoom &&
            cityGroups.map((group) => (
              <Marker
                key={group.city}
                position={[group.coordinates[1], group.coordinates[0]]}
                icon={createCityIcon(group)}
                eventHandlers={{ click: () => handleCityClick(group) }}
              >
                <Popup className="neo-popup" offset={[0, -10]}>
                  <div className="p-1 min-w-[150px] text-black bg-transparent">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border border-black ${group.color}`}>
                        {group.city}
                      </span>
                      <span className="text-[10px] font-black bg-black text-white px-1.5 py-0.5 rounded">
                        {group.count} Schools
                      </span>
                    </div>
                    <ul className="flex flex-col gap-0.5 m-0 p-0 list-none">
                      {group.schools.map((s) => (
                        <li key={s.id} className="text-[10px] font-bold text-slate-700 border-b border-slate-100 pb-0.5 m-0">
                          {s.abrv} — {s.category}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-1.5 mb-0 text-[9px] font-mono font-black text-indigo-600 uppercase">
                      Click to zoom in
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}

          {isDetailedZoom &&
            schools
              .filter((s) => !selectedCity || s.city === selectedCity)
              .map((school) => (
                <Marker
                  key={school.id}
                  position={[school.coordinates[1], school.coordinates[0]]}
                  icon={createSchoolIcon(school)}
                >
                  <Popup className="neo-popup">
                    <div className="p-1 min-w-[160px] text-black">
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border border-black ${school.color}`}>
                          {school.category}
                        </span>
                        <span className="text-[9px] font-bold bg-black text-white px-2 py-0.5 rounded-full">
                          {school.years} Yrs
                        </span>
                      </div>
                      <h4 className="text-xs font-black leading-tight mb-1 mt-0">{school.name}</h4>
                      <p className="text-[10px] font-mono font-bold text-slate-600 m-0">{school.address}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
        </MapContainer>
      </div>
    </Card>
  );
}

export default MapView;
