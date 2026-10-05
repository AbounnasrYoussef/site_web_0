import { Program } from "../path/types";

export interface School {
  id: string;
  university_id: string;
  name: string;
  abrv: string;
  type: string;
  city: string;
  address: string | null;
  website: string | null;
  latitude: number;
  longitude: number;
}

export interface CityGroup {
  city: string;
  center: [number, number];
  schools: School[];
}

export interface University {
  id: string;
  name: string;
  description: string | null;
  abrv: string;
  type: string;
  internat_available: boolean;
  bourse_available: boolean;
  image: string | null;
  locations: School[];
  programs: Program[];
}
