interface JobTitle {
  title: string;
  salary: number;
}

interface CardProps {
  uni_name: string;
  uni_abrv: string;
  prog_name: string;
  color1: string;
  color2: string;
  years_of_study?: number;
  job_titles?: JobTitle[];
  onClick?: () => void;
  onShowDetails?: () => void;
}

function getContrastColor(hexColor: string): string {
  if (!hexColor || !hexColor.startsWith("#")) return "#000000";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 140 ? "#000000" : "#ffffff";
}

export default function Card({
  uni_name,
  uni_abrv,
  prog_name,
  color1,
  color2,
  years_of_study,
  job_titles,
  onClick,
  onShowDetails,
}: CardProps) {
  const cardTextColor = getContrastColor(color1);
  const badgeTextColor = getContrastColor(color2);

  return (
    <div
      onClick={onClick}
      style={{ backgroundColor: color1, color: cardTextColor }}
      className="group cursor-pointer w-[250px] sm:w-[270px] p-3 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000] hover:shadow-[5px_5px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-none transition-all duration-200 flex flex-col justify-between select-none relative overflow-hidden font-sans"
    >
      <div>
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span
              style={{ backgroundColor: color2, color: badgeTextColor }}
              className="font-black text-[10px] uppercase px-2 py-0.5 rounded-lg border border-black shadow-[1px_1px_0px_#000] tracking-wider whitespace-nowrap shrink-0"
            >
              {uni_abrv}
            </span>
            <span
              style={{ color: cardTextColor }}
              className="text-[10px] font-mono font-extrabold truncate max-w-[130px] sm:max-w-[145px]"
              title={uni_name}
            >
              {uni_name}
            </span>
          </div>
          {years_of_study ? (
            <span className="text-[9px] font-mono font-bold bg-black text-white px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
              {years_of_study}Y
            </span>
          ) : null}
        </div>

        <div
          style={{ color: cardTextColor }}
          className="text-[11px] sm:text-[12px] font-black leading-tight break-words tracking-tight mb-1.5"
        >
          {prog_name}
        </div>

        {job_titles && job_titles.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {job_titles.slice(0, 3).map((jt, i) => (
              <span
                key={i}
                style={{ backgroundColor: color2, color: badgeTextColor }}
                className="text-[9px] font-bold border border-black/30 px-1.5 py-0.5 rounded-lg leading-none whitespace-nowrap"
                title={`~$${jt.salary.toLocaleString()}/yr`}
              >
                {jt.title}
              </span>
            ))}
            {job_titles.length > 3 && (
              <span
                style={{ color: cardTextColor }}
                className="text-[9px] font-bold opacity-75 px-1 py-0.5 leading-none"
              >
                +{job_titles.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onShowDetails?.();
        }}
        className="w-full mt-2.5 py-1 px-2 text-[9px] font-black uppercase tracking-wider bg-black text-white rounded-xl border-2 border-black hover:bg-slate-800 active:translate-y-0.5 transition-all cursor-pointer shadow-[2px_2px_0px_#000]"
      >
        Show Details
      </button>
    </div>
  );
}
