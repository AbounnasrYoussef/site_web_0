"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { CityGroup } from "./types";
import { DEFAULT_CENTER } from "./data";

interface ZoomHandlerProps {
  selectedCity: string | null;
  cityGroups: CityGroup[];
  onMapMove: (zoom: number) => void;
}

export function ZoomHandler({ selectedCity, cityGroups, onMapMove }: ZoomHandlerProps) {
  const map = useMap();

  useEffect(() => {
    if (selectedCity) {
      const city = cityGroups.find((c) => c.city === selectedCity);
      if (city) {
        map.setView([city.coordinates[1], city.coordinates[0]], 12, { animate: true });
      }
    } else {
      map.setView(DEFAULT_CENTER, 5.2, { animate: true });
    }
  }, [selectedCity, map, cityGroups]);

  useEffect(() => {
    const handleZoomEnd = () => onMapMove(map.getZoom());
    map.on("zoomend", handleZoomEnd);
    return () => {
      map.off("zoomend", handleZoomEnd);
    };
  }, [map, onMapMove]);

  return null;
}
