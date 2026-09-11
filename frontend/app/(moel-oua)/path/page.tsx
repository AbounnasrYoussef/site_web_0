"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const PathFinder = dynamic(() => import("@/components/(moel-oua)/path"), {
  ssr: false,
});

interface CategoryItem {
  id: string;
  name: string;
}

interface DiplomaItem {
  id: string;
  name: string;
}

const auth = {
  valid: false,
  local: "EN",
  user: {
    user_diploma_id: "f01ebb0f-c7d6-44a0-990f-550e63931422",
    categories: {
      id: "cc1a7060-2b44-4f03-826b-f3dbae6f032e",
    },
  },
};

export default function Path() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [diplomas, setDiplomas] = useState<DiplomaItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    auth.user.categories.id
  );
  const [selectedDiploma, setSelectedDiploma] = useState<string>(
    auth.user.user_diploma_id
  );
  const [loading, setLoading] = useState<boolean>(!auth.valid);

  useEffect(() => {
    if (auth.valid) return;

    const fetchData = async () => {
      try {
        const [catRes, dipRes] = await Promise.all([
          fetch(
            `http://localhost:5001/api/categories?${new URLSearchParams({ locale: auth.local })}`
          ),
          fetch(
            `http://localhost:5001/api/diplomas?${new URLSearchParams({ locale: auth.local })}`
          ),
        ]);

        if (catRes.ok && dipRes.ok) {
          const catData: CategoryItem[] = await catRes.json();
          const dipData: DiplomaItem[] = await dipRes.json();

          setCategories(catData);
          setDiplomas(dipData);

          if (catData.length > 0) {
            const hasCat = catData.some((c) => c.id === auth.user.categories.id);
            setSelectedCategory(hasCat ? auth.user.categories.id : catData[0].id);
          }
          if (dipData.length > 0) {
            const hasDip = dipData.some((d) => d.id === auth.user.user_diploma_id);
            setSelectedDiploma(hasDip ? auth.user.user_diploma_id : dipData[0].id);
          }
        }

      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-100 font-sans">
        <div className="border-2 border-black bg-amber-300 px-6 py-4 rounded-2xl shadow-[4px_4px_0px_#000] font-bold text-lg text-black animate-pulse">
          Loading Pathways Data…
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-100 p-3 sm:p-6 flex flex-col gap-6 font-sans">
      {selectedCategory && selectedDiploma && (
        <PathFinder
          local_lang={auth.local}
          categories_id={selectedCategory}
          user_diploma_id={selectedDiploma}
          categories={categories}
          diplomas={diplomas}
          onCategoryChange={setSelectedCategory}
          onDiplomaChange={setSelectedDiploma}
        />
      )}
    </div>
  );
}




