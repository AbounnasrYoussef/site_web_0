"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/app/(zguellou)/providers/AuthProvider";
import { useAuthFetch } from "@/app/(zguellou)/hooks/useAuthFetch";
import { fetchCategories, fetchDiplomas, PROFILE_URL } from "@/components/(moel-oua)/api";
import { Option, Student } from "@/components/(moel-oua)/path/types";
import PathSetup from "@/components/(moel-oua)/path/path-setup";

const EMPTY_STUDENT: Student = { grade: null, birthYear: null, graduationYear: null };

const toNumber = (value: unknown) => (value === null || value === undefined || value === "" ? null : Number(value));

const PathFinder = dynamic(() => import("@/components/(moel-oua)/path"), { ssr: false });

export default function PathPage() {
  const locale = useLocale();
  const t = useTranslations("path");
  const { user, isInitialized } = useAuth();
  const authFetch = useAuthFetch();
  const userId = user?.id;

  const [categories, setCategories] = useState<Option[]>([]);
  const [diplomas, setDiplomas] = useState<Option[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [diplomaId, setDiplomaId] = useState("");
  const [hasProfileDiploma, setHasProfileDiploma] = useState(false);
  const [profileStudent, setProfileStudent] = useState<Student>(EMPTY_STUDENT);
  const [student, setStudent] = useState<Student>(EMPTY_STUDENT);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");

  useEffect(() => {
    if (!isInitialized) return;

    const fetchProfile = async () => {
      if (!userId) return null;
      const res = await authFetch(PROFILE_URL);
      return res.ok ? (await res.json()).user : null;
    };

    const load = async () => {
      const [categoryList, diplomaList, profile] = await Promise.all([
        fetchCategories(locale),
        fetchDiplomas(locale),
        fetchProfile().catch(() => null),
      ]);
      const profileDiplomaId = profile?.diploma?.diploma_id ?? "";
      setCategories(categoryList);
      setDiplomas(diplomaList);
      setHasProfileDiploma(!!profileDiplomaId);
      const fromProfile = {
        grade: toNumber(profile?.diploma?.general_grade),
        birthYear: toNumber(profile?.year_of_birth),
        graduationYear: toNumber(profile?.diploma?.obtained_year),
      };
      setProfileStudent(fromProfile);
      setStudent(fromProfile);
      setCategoryId((current) => current || profile?.interested_categories[0]?.category_id || "");
      setDiplomaId((current) => current || profileDiplomaId);
      setStatus("ready");
    };

    load().catch(() => setStatus("error"));
  }, [isInitialized, userId, locale, authFetch]);

  if (status !== "ready") {
    return (
      <div className="w-full flex-1 flex items-center justify-center font-sans">
        <div className="border-2 border-black bg-amber-300 px-6 py-4 rounded-2xl shadow-[4px_4px_0px_#000] font-bold text-lg text-black">
          {t(status)}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col font-sans">
      {categoryId && diplomaId ? (
        <PathFinder
          key={`${categoryId}-${diplomaId}-${locale}-${Object.values(student).join("-")}`}
          categories={categories}
          diplomas={diplomas}
          categoryId={categoryId}
          diplomaId={diplomaId}
          student={student}
          canChangeDiploma={!hasProfileDiploma}
          onCategoryChange={setCategoryId}
          onDiplomaChange={setDiplomaId}
          onReset={() => setCategoryId("")}
        />
      ) : (
        <PathSetup
          categories={categories}
          diplomas={diplomas}
          categoryId={categoryId}
          diplomaId={diplomaId}
          student={student}
          profileStudent={profileStudent}
          onStart={(category, diploma, entered) => {
            setCategoryId(category);
            setDiplomaId(diploma);
            setStudent(entered);
          }}
        />
      )}
    </div>
  );
}
