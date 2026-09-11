'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

type Translation = {
  language: string;
  name: string;
  description: string;
};

type CampusData = {
  city: string;
  maps_link: string | null;
  website: string | null;
  image_path: string | null;
};

type UniversityData = {
  id: number;
  abbreviation: string;
  type: string;
  has_dorms: string;
  has_scholarship: string;
  translations: Translation[];
  campuses: CampusData[];
};

export default function UniversitiesListPage() {
  const [universities, setUniversities] = useState<UniversityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchUniversities() {
      try {
        const response = await fetch('http://localhost:8000/universities');
        const data = await response.json();
        setUniversities(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchUniversities();
  }, []);

  // كنجيبو غير الاسم بالإنجليزية للعرض فالجدول
  function getEnglishName(uni: UniversityData) {
    const en = uni.translations.find((t) => t.language === 'English');
    return en ? en.name : uni.abbreviation;
  }

  return (
    <div className="flex min-h-screen text-(--color-text) squared-bg">
      <Sidebar />

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-black uppercase mb-6">Universities List</h1>

        {loading && <p>Loading universities...</p>}
        {error && <p className="text-red-600 font-bold">Failed to load universities.</p>}

        {!loading && !error && universities.length === 0 && (
          <p className="text-(--color-muted)">No universities yet.</p>
        )}

        {!loading && !error && universities.length > 0 && (
          <div className="border-4 border-(--color-text) shadow-[6px_6px_0_0_var(--color-text)] overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-(--color-text) text-(--color-bg)">
                  <th className="text-left p-4 uppercase text-xs font-bold">Name</th>
                  <th className="text-left p-4 uppercase text-xs font-bold">Abbreviation</th>
                  <th className="text-left p-4 uppercase text-xs font-bold">Type</th>
                  <th className="text-left p-4 uppercase text-xs font-bold">Dorms</th>
                  <th className="text-left p-4 uppercase text-xs font-bold">Scholarship</th>
                  <th className="text-left p-4 uppercase text-xs font-bold">Campuses</th>
                </tr>
              </thead>
              <tbody>
                {universities.map((uni) => (
                  <tr key={uni.id} className="border-t-2 border-(--color-text)">
                    <td className="p-4 font-bold">{getEnglishName(uni)}</td>
                    <td className="p-4">{uni.abbreviation}</td>
                    <td className="p-4 capitalize">{uni.type}</td>
                    <td className="p-4">{uni.has_dorms === 'true' ? '✓' : '✗'}</td>
                    <td className="p-4">{uni.has_scholarship === 'true' ? '✓' : '✗'}</td>
                    <td className="p-4 text-sm text-(--color-muted)">
                      {uni.campuses.map((c) => c.city).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}