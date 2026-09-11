export interface School {
  id: string;
  name: string;
  abrv: string;
  city: string;
  category: string;
  coordinates: [number, number];
  color: string;
  address: string;
  years: number;
}

export interface CityGroup {
  city: string;
  count: number;
  coordinates: [number, number];
  color: string;
  schools: School[];
}

export interface MapViewProps {
  className?: string;
}
