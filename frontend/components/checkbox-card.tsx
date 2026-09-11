interface CheckBoxCardProps {
  value: string;
  selected: string;
  onChange: (val: string) => void;
  label: string;
  icon: React.ReactNode;
  activeBg: string;
  inactiveBg: string;
}

export default function CheckBoxCard({ value, selected, onChange, label, icon, activeBg, inactiveBg }: CheckBoxCardProps) {
  const isSelected = selected === value;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`group cursor-pointer relative flex flex-col items-start justify-between w-full gap-8 p-3 sm:p-6 border-2 border-black transition-all active:scale-[0.98] ${isSelected ? activeBg : inactiveBg}`}
    >
      <div className="flex justify-between w-full">
        <div className={`
          text-4xl shrink-0 transition-all duration-300 
          group-hover:scale-110
          ltr:group-hover:-rotate-6
          rtl:group-hover:rotate-6
        `}>
          {icon}
        </div>
        <div className={`w-7 h-7 border-2 border-black flex items-center justify-center bg-(--color-light) transition-colors`}>
          {isSelected && <div className="w-4 h-4 bg-black" />}
        </div>
      </div>
      <span className="font-black uppercase text-sm tracking-wide text-left">{label}</span>
    </button>
  );
};