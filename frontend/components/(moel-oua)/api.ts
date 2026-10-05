import { Option, PathResult, Student } from "./path/types";
import { School, University } from "./map/types";

const PATH_API = process.env.NEXT_PUBLIC_PATH_API_URL;
const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API_URL;

export const PROFILE_URL = `${AUTH_API}/api/auth/profile`;

async function getJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchCategories(locale: string): Promise<Option[]> {
  const { categories } = await getJson(`${AUTH_API}/api/categories?locale=${locale}`);
  return categories.map((category: { id: string; name: string; translation_name: string | null }) => ({
    id: category.id,
    name: category.translation_name || category.name,
  }));
}

export async function fetchDiplomas(locale: string): Promise<Option[]> {
  const { diplomas } = await getJson(`${AUTH_API}/api/diplomas?locale=${locale}`);
  return diplomas;
}

export async function fetchPaths(categoryId: string, diplomaId: string, locale: string, student: Student): Promise<PathResult[]> {
  const query = new URLSearchParams({ category_id: categoryId, diploma_id: diplomaId, locale });
  if (student.grade !== null) query.set("grade", String(student.grade));
  if (student.birthYear !== null) query.set("birth_year", String(student.birthYear));
  if (student.graduationYear !== null) query.set("graduation_year", String(student.graduationYear));
  const { paths } = await getJson(`${PATH_API}/api/paths?${query}`);
  return paths;
}

export async function fetchSchools(locale: string): Promise<School[]> {
  const { universities } = await getJson(`${PATH_API}/api/universities?locale=${locale}`);
  return universities;
}

export async function fetchUniversity(id: string, locale: string): Promise<University> {
  const { university } = await getJson(`${PATH_API}/api/universities/${id}?locale=${locale}`);
  return university;
}
