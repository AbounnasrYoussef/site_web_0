"use client";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Check, Program } from "./path/types";
import { Section, boxClass, isWebLink } from "./details";

interface Props {
  program: Program | null;
  checks: Check[];
  color1: string;
  color2: string;
  onClose: () => void;
}

export default function ProgramDetailsSidebar({ program, checks, color1, color2, onClose }: Props) {
  const t = useTranslations("path");
  const tMap = useTranslations("map");

  if (!program) return null;

  const overview = [
    { label: t("duration"), value: t("years", { count: program.years_of_study }), bg: "bg-[#ccee00]" },
    { label: t("tuition"), value: program.monthly_subscription ? t("amount", { amount: program.monthly_subscription }) : t("free"), bg: "bg-[#9bf6ff]" },
    { label: t("entrance"), value: program.has_concours ? t("concours") : t("direct"), bg: "bg-[#ffd6a5]" },
    { label: t("ageLimit"), value: program.max_age ? t("maxAge", { age: program.max_age }) : t("none"), bg: "bg-[#ffb3c6]" },
  ];

  const recognition = [
    { label: t("recognitionMorocco"), status: program.recognition_morocco },
    { label: t("recognitionAbroad"), status: program.recognition_abroad },
  ].filter((item) => item.status !== null);

  const facilities = [
    { label: t("dormitory"), available: program.internat_available },
    { label: t("scholarship"), available: program.bourse_available },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end font-sans">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:w-[440px] max-h-[92vh] sm:max-h-none sm:h-full flex flex-col bg-[#faf7f2] border-t-2 sm:border-t-0 sm:border-s-2 border-black rounded-t-2xl sm:rounded-none overflow-y-auto">
        <div className="border-b-2 border-black flex-shrink-0">
          {isWebLink(program.uni_image) && (
            <div className="relative w-full h-40 border-b-2 border-black">
              <Image src={program.uni_image!} alt={program.uni_name} fill unoptimized className="object-cover" />
            </div>
          )}
          <div className="p-4" style={{ backgroundColor: color1 }}>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 ${boxClass}`} style={{ backgroundColor: color2 }}>
                {program.uni_abrv}
              </span>
              <span className="text-[9px] font-bold uppercase bg-black text-white px-2 py-0.5 rounded-full">
                {tMap(`type.${program.uni_type}`)}
              </span>
            </div>
            <h2 className="text-base font-black text-black leading-tight mb-0.5">{program.uni_name}</h2>
            <p className="text-xs font-bold text-black/70">{program.prog_name}</p>
            {program.uni_address && <p className="text-[10px] font-mono font-bold text-black/50 mt-1">{program.uni_address}</p>}
          </div>
        </div>

        <div className="p-4 flex flex-col gap-5 flex-1">
          <Section title={t("overview")}>
            <div className="grid grid-cols-2 gap-2">
              {overview.map((item) => (
                <div key={item.label} className={`${item.bg} ${boxClass} p-3`}>
                  <span className="block text-[9px] font-black uppercase tracking-wider text-black/60">{item.label}</span>
                  <span className="text-sm font-black text-black">{item.value}</span>
                </div>
              ))}
            </div>
          </Section>

          {checks.length > 0 && (
            <Section title={t("yourEligibility")}>
              <div className="flex flex-col gap-1.5">
                {checks.map((check) => (
                  <div key={check.type} className={`flex items-start gap-2 ${boxClass} px-3 py-2 text-xs font-bold text-black ${CHECK_STYLES[String(check.ok)]}`}>
                    <span className="font-black" aria-hidden="true">{CHECK_ICONS[String(check.ok)]}</span>
                    <span>{t(checkMessage(check), checkValues(check))}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {program.output_diploma && (
            <Section title={t("awardedDiploma")}>
              <div className={`bg-white ${boxClass} p-3 text-xs font-black text-black`}>{program.output_diploma}</div>
            </Section>
          )}

          {recognition.length > 0 && (
            <Section title={t("recognition")}>
              <div className="flex flex-col gap-1.5">
                {recognition.map((item) => (
                  <div key={item.label} className={`flex items-center justify-between gap-2 bg-white ${boxClass} px-3 py-2`}>
                    <span className="text-xs font-bold text-black">{item.label}</span>
                    <span className={`text-[10px] font-black border border-black rounded px-1.5 py-0.5 text-black ${RECOGNITION_STYLES[item.status!]}`}>
                      {t(`recognitionStatus.${item.status}`)}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          <Section title={t("facilities")}>
            <div className="flex flex-wrap gap-2">
              {facilities.map((facility) => (
                <span
                  key={facility.label}
                  className={`text-[11px] font-bold px-2.5 py-1 ${boxClass} ${facility.available ? "bg-[#b7f7b5] text-black" : "bg-slate-100 text-slate-400"}`}
                >
                  {facility.label}: {facility.available ? t("available") : t("notAvailable")}
                </span>
              ))}
            </div>
            {program.uni_desc && (
              <p className="mt-2 text-[11px] text-slate-600 leading-relaxed bg-white border border-slate-200 rounded-xl p-2.5">
                {program.uni_desc}
              </p>
            )}
          </Section>

          {program.job_titles.length > 0 && (
            <Section title={t("careers")}>
              <div className="flex flex-col gap-1.5">
                {program.job_titles.map((job) => (
                  <div key={job.id} className={`flex items-center justify-between gap-2 bg-white ${boxClass} px-3 py-2`}>
                    <span className="text-xs font-bold text-black">{job.title}</span>
                    <span className="text-[10px] font-black bg-[#ccee00] border border-black rounded px-1.5 py-0.5 text-black whitespace-nowrap">
                      {t("amount", { amount: job.salary })}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {program.requirements.length > 0 && (
            <Section title={t("requirements")}>
              <div className="flex flex-col gap-1.5">
                {program.requirements.map((requirement, i) => (
                  <div key={i} className={`bg-white ${boxClass} p-3 text-xs`}>
                    {requirement.required_diploma && (
                      <div className="mb-1">
                        <span className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-0.5">{t("requiredDiploma")}</span>
                        <span className="font-bold text-black">{requirement.required_diploma}</span>
                      </div>
                    )}
                    {requirement.min_grade !== null && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-semibold">{t("minGrade")}:</span>
                        <span className="font-black bg-[#ccee00] border border-black rounded px-1.5 text-black" dir="ltr">
                          {requirement.min_grade} / 20
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {isWebLink(program.uni_website) && (
            <a
              href={program.uni_website!}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full py-2.5 text-center bg-[#0ea5e9] text-black font-black text-xs uppercase tracking-wider hover:bg-[#ccee00] transition-all ${boxClass}`}
            >
              {t("website")}
            </a>
          )}
        </div>

        <div className="p-3 border-t-2 border-black bg-[var(--color-bg)] flex-shrink-0">
          <button
            onClick={onClose}
            className={`w-full py-2.5 bg-white text-black font-black text-xs uppercase tracking-wider hover:bg-black hover:text-white transition-all cursor-pointer ${boxClass}`}
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}

const CHECK_STYLES: Record<string, string> = { true: "bg-[#b7f7b5]", false: "bg-[#ffb3b3]", null: "bg-white" };
const CHECK_ICONS: Record<string, string> = { true: "✓", false: "✕", null: "?" };
const RECOGNITION_STYLES: Record<string, string> = {
  RECOGNIZED: "bg-[#b7f7b5]",
  EVALUATION_REQUIRED: "bg-[#ffd6a5]",
  NOT_RECOGNIZED: "bg-[#ffb3b3]",
};

// Message keys live under path.checks.<type>.<passed|failed|unknown>.
function checkMessage(check: Check) {
  if (check.type === "future_grade") return "checks.future_grade";
  const outcome = check.ok === null ? "unknown" : check.ok ? "passed" : "failed";
  return `checks.${check.type}.${outcome}`;
}

function checkValues(check: Check): Record<string, number> {
  if (check.type === "future_grade") return { required: check.required };
  if (check.type === "grade") return { required: check.required, actual: check.actual ?? 0 };
  return { max: check.max, actual: check.actual ?? 0 };
}
