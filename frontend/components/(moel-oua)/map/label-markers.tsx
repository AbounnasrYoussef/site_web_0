"use client";

import { useEffect, useState } from "react";
import { Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { createIcon } from "./icons";

const LABEL_HEIGHT = 28;
const CHARACTER_WIDTH = 7;
const LABEL_PADDING = 44;
const CLUSTER_ZOOM_STEP = 2;

export interface Label {
  id: string;
  text: string;
  position: [number, number];
  count?: number;
  onClick?: () => void;
}

interface Placed {
  label: Label;
  point: L.Point;
  width: number;
  count: number;
  merged: number;
}

interface LabelMarkersProps {
  labels: Label[];
  cluster: boolean;
}

export function LabelMarkers({ labels, cluster }: LabelMarkersProps) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const updateZoom = () => setZoom(map.getZoom());
    map.on("zoomend", updateZoom);
    return () => {
      map.off("zoomend", updateZoom);
    };
  }, [map]);

  const placed: Placed[] = [];
  labels.forEach((label) => {
    const width = label.text.length * CHARACTER_WIDTH + LABEL_PADDING;
    const point = map.project(label.position, zoom);
    const overlapping = () =>
      placed.find((other) => Math.abs(other.point.x - point.x) < (other.width + width) / 2 && Math.abs(other.point.y - point.y) < LABEL_HEIGHT);

    const neighbour = overlapping();
    if (cluster && neighbour) {
      neighbour.count += label.count ?? 0;
      neighbour.merged += 1;
      return;
    }
    while (overlapping()) point.y += LABEL_HEIGHT;
    placed.push({ label, point, width, count: label.count ?? 0, merged: 0 });
  });

  return placed.map(({ label, point, count, merged }, i) => {
    const position = map.unproject(point, zoom);
    const zoomIn = () => map.setView(label.position, zoom + CLUSTER_ZOOM_STEP);

    return (
      <Marker
        key={label.id}
        position={position}
        icon={createIcon(merged ? `${label.text} +${merged}` : label.text, i, cluster ? count : undefined)}
        eventHandlers={{ click: merged ? zoomIn : () => label.onClick?.() }}
      />
    );
  });
}
