"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { fetchUniversity } from "@/components/(moel-oua)/api";
import { Section, boxClass, isWebLink } from "@/components/(moel-oua)/details";
import { University } from "./types";

interface UniversityPanelProps {
  universityId: string;
  onClose: () => void;
}

const chipClass = "text-[10px] font-bold border border-black rounded-lg px-1.5 py-0.5 whitespace-nowrap";

export default function UniversityPanel({ universityId, onClose }: UniversityPanelProps) {
  const t = useTranslations("map");
  const tPath = useTranslations("path");
  const locale = useLocale();
  const [university, setUniversity] = useState<University | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchUniversity(universityId, locale)
      .then((found) => {
        if (!cancelled) setUniversity(found);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [universityId, locale]);

  const facilities = [
    { label: tPath("dormitory"), available: university?.internat_available },
    { label: tPath("scholarship"), available: university?.bourse_available },
  ];

  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"} className="fixed inset-0 z-[1100] flex items-end sm:items-stretch sm:justify-end font-sans">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full sm:w-[440px] max-h-[92vh] sm:max-h-none sm:h-full flex flex-col bg-[#faf7f2] border-t-2 sm:border-t-0 sm:border-s-2 border-black rounded-t-2xl sm:rounded-none overflow-y-auto">
        {!university && (
          <p className="p-6 text-sm font-bold text-black">{failed ? t("error") : t("loading")}</p>
        )}

        {university && (
          <>
            {isWebLink(university.image) && (
              <div className="relative w-full h-40 border-b-2 border-black flex-shrink-0">
                <Image src={university.image!} alt={university.name} fill unoptimized className="object-cover" />
              </div>
            )}
            <div className="p-4 bg-[#ccee00] border-b-2 border-black flex-shrink-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 bg-white ${boxClass}`}>{university.abrv}</span>
                <span className="text-[9px] font-bold uppercase bg-black text-white px-2 py-0.5 rounded-full">{t(`type.${university.type}`)}</span>
              </div>
              <h2 className="text-base font-black text-black leading-tight">{university.name}</h2>
            </div>

            <div className="p-4 flex flex-col gap-5 flex-1">
              {university.description && (
                <Section title={t("about")}>
                  <p className="text-xs text-slate-700 leading-relaxed">{university.description}</p>
                </Section>
              )}

              <Section title={tPath("facilities")}>
                <div className="flex flex-wrap gap-2">
                  {facilities.map((facility) => (
                    <span
                      key={facility.label}
                      className={`text-[11px] font-bold px-2.5 py-1 ${boxClass} ${facility.available ? "bg-[#b7f7b5] text-black" : "bg-slate-100 text-slate-400"}`}
                    >
                      {facility.label}: {facility.available ? tPath("available") : tPath("notAvailable")}
                    </span>
                  ))}
                </div>
              </Section>

              <Section title={`${t("campuses")} (${university.locations.length})`}>
                <div className="flex flex-col gap-1.5">
                  {university.locations.map((location) => (
                    <div key={location.id} className={`bg-white ${boxClass} p-3 text-xs text-black`}>
                      <span className="block font-black">{location.city}</span>
                      {location.address && <span className="block text-slate-600">{location.address}</span>}
                      {isWebLink(location.website) && (
                        <a href={location.website!} target="_blank" rel="noopener noreferrer" className="font-bold text-sky-700 underline break-all" dir="ltr">
                          {location.website}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </Section>

              <Section title={`${t("programs")} (${university.programs.length})`}>
                {university.programs.length === 0 && <p className="text-xs text-slate-600">{t("noPrograms")}</p>}
                <div className="flex flex-col gap-1.5">
                  {university.programs.map((program) => (
                    <div key={program.id} className={`bg-white ${boxClass} p-3 text-black`}>
                      <span className="block text-xs font-black mb-1">{program.prog_name}</span>
                      {program.output_diploma && <span className="block text-[11px] text-slate-600 mb-1.5">{program.output_diploma}</span>}
                      <div className="flex flex-wrap gap-1">
                        <span className={`${chipClass} bg-[#ccee00]`}>{tPath("years", { count: program.years_of_study })}</span>
                        <span className={`${chipClass} bg-[#9bf6ff]`}>
                          {program.monthly_subscription ? tPath("amount", { amount: program.monthly_subscription }) : tPath("free")}
                        </span>
                        <span className={`${chipClass} bg-[#ffd6a5]`}>{program.has_concours ? tPath("concours") : tPath("direct")}</span>
                        {program.job_titles.map((job) => (
                          <span key={job.id} className={`${chipClass} bg-slate-100`}>{job.title}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          </>
        )}

        <div className="p-3 border-t-2 border-black bg-[var(--color-bg)] flex-shrink-0">
          <button
            onClick={onClose}
            className={`w-full py-2.5 bg-white text-black font-black text-xs uppercase tracking-wider hover:bg-black hover:text-white transition-all cursor-pointer ${boxClass}`}
          >
            {tPath("close")}
          </button>
        </div>
      </div>
    </div>
  );
}
