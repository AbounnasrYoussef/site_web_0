"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Dropdown from "@/components/dropdown";
import Input from "@/components/input";
import { Option, Student } from "./types";

interface PathSetupProps {
  categories: Option[];
  diplomas: Option[];
  categoryId: string;
  diplomaId: string;
  student: Student;
  profileStudent: Student;
  onStart: (categoryId: string, diplomaId: string, student: Student) => void;
}

const CURRENT_YEAR = new Date().getFullYear();

// Optional facts used to check grade, age and graduation-date requirements.
const STUDENT_FIELDS = [
  { key: "grade", label: "yourGrade", min: 0, max: 20, step: 0.01 },
  { key: "birthYear", label: "birthYear", min: 1900, max: CURRENT_YEAR, step: 1 },
  { key: "graduationYear", label: "graduationYear", min: 1950, max: CURRENT_YEAR, step: 1 },
] as const;

const toText = (value: number | null) => (value === null ? "" : String(value));

export default function PathSetup({ categories, diplomas, categoryId, diplomaId, student, profileStudent, onStart }: PathSetupProps) {
  const t = useTranslations("path");
  const [category, setCategory] = useState(categoryId);
  const [diploma, setDiploma] = useState(diplomaId);
  const [values, setValues] = useState<Record<keyof Student, string>>({
    grade: toText(student.grade),
    birthYear: toText(student.birthYear),
    graduationYear: toText(student.graduationYear),
  });

  // Registered users already gave these in their profile, so only ask for what is missing.
  const askedFields = STUDENT_FIELDS.filter((field) => profileStudent[field.key] === null);
  const isValid = askedFields.every(({ key, min, max }) => {
    if (!values[key]) return true;
    const value = Number(values[key]);
    return value >= min && value <= max;
  });

  const entered = (key: keyof Student) => (profileStudent[key] ?? (values[key] ? Number(values[key]) : null));

  return (
    <div className="squared-bg w-full flex-1 flex items-center justify-center p-4 font-sans">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onStart(category, diploma, { grade: entered("grade"), birthYear: entered("birthYear"), graduationYear: entered("graduationYear") });
        }}
        className="w-full max-w-md flex flex-col gap-4 bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_#000] p-6"
      >
        <div>
          <h1 className="text-xl font-black text-black">{t("setupTitle")}</h1>
          <p className="text-sm text-slate-600">{t("setupText")}</p>
        </div>

        <SetupSelect label={t("category")} value={category} onChange={setCategory} options={categories} placeholder={t("choose")} />
        <SetupSelect label={t("currentDiploma")} value={diploma} onChange={setDiploma} options={diplomas} placeholder={t("choose")} />

        {askedFields.length > 0 && (
          <fieldset className="flex flex-col gap-3 border-t-2 border-dashed border-slate-300 pt-4">
            <legend className="text-xs font-bold text-slate-500 pe-2">{t("optionalInfo")}</legend>
            {askedFields.map(({ key, label, min, max, step }) => (
              <Input
                key={key}
                type="number"
                inputMode="decimal"
                inputDir="ltr"
                label={t(label)}
                min={min}
                max={max}
                step={step}
                value={values[key]}
                onChange={(e) => setValues((current) => ({ ...current, [key]: e.target.value }))}
              />
            ))}
          </fieldset>
        )}

        <button
          type="submit"
          disabled={!category || !diploma || !isValid}
          className="py-2.5 rounded-xl border-2 border-black bg-[#ccee00] text-black font-black text-sm uppercase shadow-[3px_3px_0px_#000] cursor-pointer active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("start")}
        </button>
      </form>
    </div>
  );
}

function SetupSelect({ label, value, onChange, options, placeholder }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder: string;
}) {
  const items = useMemo(() => options.map((option) => ({ label: option.name, value: option.id })), [options]);
  return <Dropdown label={label} value={value} onChange={onChange} options={items} placeholder={placeholder} />;
}
