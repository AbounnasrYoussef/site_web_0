"use client";
import React from "react";

export interface ProgramDetails {
  id: string;
  uni_name: string;
  uni_abrv: string;
  uni_type?: string;
  uni_desc?: string;
  uni_image?: string;
  uni_website?: string;
  uni_address?: string;
  internat_available?: boolean;
  bourse_available?: boolean;
  prog_name: string;
  years_of_study: number;
  monthly_subscription?: number;
  max_age?: number;
  has_concours?: boolean;
  output_diploma?: string;
  requirements?: Array<{
    required_diploma?: string;
    min_grade?: number | null;
  }>;
  color1: string;
  color2: string;
  job_titles?: Array<{ id?: string; title: string; salary: number }>;
}

interface Props {
  program: ProgramDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

const defaultImg =
  "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80";

export default function ProgramDetailsSidebar({ program, isOpen, onClose }: Props) {
  if (!isOpen || !program) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end font-sans">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full sm:w-[440px] max-h-[92vh] sm:max-h-none sm:h-full flex flex-col bg-[#faf7f2] border-t-2 sm:border-t-0 sm:border-l-2 border-black shadow-[-4px_0_0_#000] rounded-t-2xl sm:rounded-none overflow-y-auto animate-slide-up sm:animate-slide-right">

        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-9 h-1 rounded-full bg-slate-300" />
        </div>

        <div className="relative border-b-2 border-black flex-shrink-0">
          <div className="h-40 overflow-hidden bg-slate-900">
            <img
              src={program.uni_image || defaultImg}
              alt={program.uni_name}
              className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black text-white border-2 border-white text-xs font-black flex items-center justify-center hover:bg-red-500 transition-colors cursor-pointer z-10"
          >
            X
          </button>

          <div className="p-4 border-t-2 border-black" style={{ backgroundColor: program.color1 }}>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg border-2 border-black shadow-[2px_2px_0_#000]"
                style={{ backgroundColor: program.color2 }}
              >
                {program.uni_abrv}
              </span>
              {program.uni_type && (
                <span className="text-[9px] font-bold uppercase bg-black text-white px-2 py-0.5 rounded-full">
                  {program.uni_type}
                </span>
              )}
            </div>
            <h2 className="text-base font-black text-black leading-tight mb-0.5">{program.uni_name}</h2>
            <p className="text-xs font-bold text-black/70">{program.prog_name}</p>
            {program.uni_address && (
              <p className="text-[10px] font-mono font-bold text-black/50 mt-1">{program.uni_address}</p>
            )}
          </div>
        </div>

        <div className="p-4 flex flex-col gap-5 flex-1">

          <section>
            <Label text="Program Overview" />
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Duration", value: `${program.years_of_study} Years`, bg: "bg-[#ccee00]" },
                { label: "Tuition/mo", value: program.monthly_subscription && program.monthly_subscription > 0 ? `${program.monthly_subscription} MAD` : "Free", bg: "bg-[#9bf6ff]" },
                { label: "Entrance", value: program.has_concours ? "Concours" : "Direct", bg: "bg-[#ffd6a5]" },
                { label: "Age Limit", value: program.max_age ? `Max ${program.max_age} yrs` : "None", bg: "bg-[#ffb3c6]" },
              ].map((s) => (
                <div key={s.label} className={`${s.bg} border-2 border-black rounded-xl shadow-[2px_2px_0_#000] p-3 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000] transition-all`}>
                  <span className="block text-[9px] font-black uppercase tracking-wider text-black/60">{s.label}</span>
                  <span className="text-sm font-black text-black">{s.value}</span>
                </div>
              ))}
            </div>
          </section>

          {program.output_diploma && (
            <section>
              <Label text="Awarded Diploma" />
              <div className="bg-white border-2 border-black rounded-xl shadow-[2px_2px_0_#000] p-3 flex items-center gap-2.5">
                <span className="text-xs font-black text-black">{program.output_diploma}</span>
              </div>
            </section>
          )}

          <section>
            <Label text="Facilities" />
            <div className="flex flex-wrap gap-2">
              <Badge available={!!program.internat_available} label="Dormitory" yes="bg-[#b7f7b5]" />
              <Badge available={!!program.bourse_available} label="Scholarship" yes="bg-[#9bf6ff]" />
            </div>
            {program.uni_desc && (
              <p className="mt-2 text-[11px] text-slate-600 leading-relaxed bg-white border border-slate-200 rounded-xl p-2.5">
                {program.uni_desc}
              </p>
            )}
          </section>

          {program.job_titles && program.job_titles.length > 0 && (
            <section>
              <Label text="Career Opportunities" />
              <div className="flex flex-col gap-1.5">
                {program.job_titles.map((j, i) => (
                  <div key={i} className="flex items-center justify-between bg-white border-2 border-black rounded-xl shadow-[2px_2px_0_#000] px-3 py-2 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000] transition-all">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-black text-white text-[9px] font-black flex items-center justify-center flex-shrink-0">{i + 1}</span>
                      <span className="text-xs font-bold text-black">{j.title}</span>
                    </div>
                    {j.salary > 0 && (
                      <span className="text-[10px] font-black bg-[#ccee00] border border-black rounded px-1.5 py-0.5 text-black whitespace-nowrap">
                        {j.salary.toLocaleString()} MAD
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {program.requirements && program.requirements.length > 0 && (
            <section>
              <Label text="Admission Requirements" />
              <div className="flex flex-col gap-1.5">
                {program.requirements.map((r, i) => (
                  <div key={i} className="bg-white border-2 border-black rounded-xl shadow-[2px_2px_0_#000] p-3 text-xs">
                    {r.required_diploma && (
                      <div className="mb-1">
                        <span className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-0.5">Required Background</span>
                        <span className="font-bold text-black">{r.required_diploma}</span>
                      </div>
                    )}
                    {r.min_grade && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-semibold">Min. Grade:</span>
                        <span className="font-black bg-[#ccee00] border border-black rounded px-1.5 text-black">{r.min_grade} / 20</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {program.uni_website && (
            <a
              href={program.uni_website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-black bg-[#0ea5e9] text-black font-black text-xs uppercase tracking-wider shadow-[3px_3px_0_#000] hover:bg-[#ccee00] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] active:translate-y-0 active:shadow-none transition-all"
            >
              Visit Official Website
            </a>
          )}
        </div>

        <div className="p-3 border-t-2 border-black bg-[#f4f1ea] flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border-2 border-black bg-white text-black font-black text-xs uppercase tracking-wider shadow-[3px_3px_0_#000] hover:bg-black hover:text-white hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] active:translate-y-0 active:shadow-none transition-all cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}

function Label({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">{text}</span>
      <div className="flex-1 h-px bg-slate-300" />
    </div>
  );
}

function Badge({ available, label, yes }: { available: boolean; label: string; yes: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0_#000] ${available ? yes : "bg-slate-100 text-slate-400"}`}>
      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black ${available ? "bg-black text-white" : "bg-slate-300 text-slate-500"}`}>
        {available ? "Y" : "N"}
      </span>
      {label}: {available ? "Available" : "N/A"}
    </span>
  );
}
