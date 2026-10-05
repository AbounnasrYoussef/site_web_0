import { Node, Edge } from "reactflow";

export type Direction = "LR" | "RL";

export interface Option {
  id: string;
  name: string;
}

export interface JobTitle {
  id: string;
  title: string;
  salary: number;
}

export interface Requirement {
  required_diploma: string | null;
  min_grade: number | null;
}

export type Recognition = "RECOGNIZED" | "EVALUATION_REQUIRED" | "NOT_RECOGNIZED";

// ok: true = passes, false = blocks the student, null = unknown (missing data or a future grade)
export type Check =
  | { type: "grade"; required: number; actual: number | null; ok: boolean | null }
  | { type: "future_grade"; required: number; ok: null }
  | { type: "age"; max: number; actual: number; ok: boolean }
  | { type: "graduation"; max: number; actual: number | null; ok: boolean | null };

export interface Student {
  grade: number | null;
  birthYear: number | null;
  graduationYear: number | null;
}

export interface PathResult {
  programs: Program[];
  checks: Check[][];
  eligible: boolean;
  total_years: number;
  concours_count: number;
}

export interface Program {
  id: string;
  prog_name: string;
  years_of_study: number;
  monthly_subscription: number | null;
  max_age: number | null;
  has_concours: boolean;
  recognition_morocco: Recognition | null;
  recognition_abroad: Recognition | null;
  output_diploma: string | null;
  uni_name: string;
  uni_desc: string | null;
  uni_abrv: string;
  uni_type: string;
  uni_image: string | null;
  uni_website: string | null;
  uni_address: string | null;
  internat_available: boolean;
  bourse_available: boolean;
  requirements: Requirement[];
  job_titles: JobTitle[];
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
  paths: string[][];
}
