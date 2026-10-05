export const boxClass = "border-2 border-black rounded-xl shadow-[2px_2px_0_#000]";

export const isWebLink = (url: string | null) => !!url && /^https?:\/\//i.test(url);

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">{title}</span>
        <div className="flex-1 h-px bg-slate-300" />
      </div>
      {children}
    </section>
  );
}
