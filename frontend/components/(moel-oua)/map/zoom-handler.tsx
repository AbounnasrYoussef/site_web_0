"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { MOROCCO_BOUNDS, FIT_PADDING, CITY_ZOOM, RESET_ZOOM } from "./data";

interface ZoomHandlerProps {
  focus: [number, number] | null;
  onZoomOut: () => void;
}

export function ZoomHandler({ focus, onZoomOut }: ZoomHandlerProps) {
  const map = useMap();

  useEffect(() => {
    const fitCountry = () => {
      map.setMinZoom(map.getBoundsZoom(MOROCCO_BOUNDS, false, FIT_PADDING.multiplyBy(2)));
      if (!focus) map.fitBounds(MOROCCO_BOUNDS, { padding: FIT_PADDING });
    };

    fitCountry();
    if (focus) map.setView(focus, CITY_ZOOM, { animate: true });

    map.on("resize", fitCountry);
    return () => {
      map.off("resize", fitCountry);
    };
  }, [map, focus]);

  useEffect(() => {
    const handleZoomEnd = () => {
      if (map.getZoom() < RESET_ZOOM) onZoomOut();
    };
    map.on("zoomend", handleZoomEnd);
    return () => {
      map.off("zoomend", handleZoomEnd);
    };
  }, [map, onZoomOut]);

  return null;
}
