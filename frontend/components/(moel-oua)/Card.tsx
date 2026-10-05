import { useTranslations } from "next-intl";
import { Program } from "./path/types";

const MAX_VISIBLE_JOBS = 2;

interface CardProps {
  program: Program;
  blocked: boolean;
  color1: string;
  color2: string;
  dir: "ltr" | "rtl";
  onShowDetails: () => void;
}

export default function Card({ program, blocked, color1, color2, dir, onShowDetails }: CardProps) {
  const t = useTranslations("path");
  const visibleJobs = program.job_titles.slice(0, MAX_VISIBLE_JOBS);
  const hiddenJobs = program.job_titles.length - visibleJobs.length;

  return (
    <div
      dir={dir}
      style={{ backgroundColor: color1 }}
      className="cursor-pointer w-[270px] h-[140px] p-3 rounded-2xl border-2 border-black text-black shadow-[3px_3px_0px_#000] hover:shadow-[5px_5px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between select-none font-sans"
    >
      <div>
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span
              style={{ backgroundColor: color2 }}
              className="font-black text-[10px] uppercase px-2 py-0.5 rounded-lg border border-black shadow-[1px_1px_0px_#000] tracking-wider whitespace-nowrap shrink-0"
            >
              {program.uni_abrv}
            </span>
            <span className="text-[10px] font-mono font-extrabold truncate max-w-[130px] sm:max-w-[145px]" title={program.uni_name}>
              {program.uni_name}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {blocked && (
              <span className="text-[9px] font-black uppercase bg-red-500 text-white px-1.5 py-0.5 rounded-full border border-black">
                {t("notEligible")}
              </span>
            )}
            <span className="text-[9px] font-mono font-bold bg-black text-white px-2 py-0.5 rounded-full">
              {t("yearsShort", { count: program.years_of_study })}
            </span>
          </div>
        </div>
        <div className="text-[12px] font-black leading-tight tracking-tight mb-1.5 line-clamp-2">
          {program.prog_name}
        </div>
        <div className="flex gap-1 mt-0.5 overflow-hidden">
          {visibleJobs.map((job) => (
            <span
              key={job.id}
              style={{ backgroundColor: color2 }}
              className="text-[9px] font-bold border border-black/30 px-1.5 py-0.5 rounded-lg leading-none whitespace-nowrap"
            >
              {job.title}
            </span>
          ))}
          {hiddenJobs > 0 && <span className="text-[9px] font-bold opacity-75 px-1 py-0.5 leading-none">+{hiddenJobs}</span>}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onShowDetails();
        }}
        className="w-full mt-2.5 py-1 px-2 text-[9px] font-black uppercase tracking-wider bg-black text-white rounded-xl border-2 border-black hover:bg-slate-800 active:translate-y-0.5 transition-all cursor-pointer shadow-[2px_2px_0px_#000]"
      >
        {t("showDetails")}
      </button>
    </div>
  );
}
