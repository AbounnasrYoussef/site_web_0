'use client';

import React from 'react';

interface CategoryCardProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onToggle: (id: string) => void;
  activeBg?: string;
  inactiveBg?: string;
}

export default function CategoryCard({
  id,
  label,
  icon,
  isSelected,
  onToggle,
  activeBg = 'bg-(--color-text) text-(--color-light)',
  inactiveBg = 'bg-(--color-light) text-black'
}: CategoryCardProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(id)}
      className={`group cursor-pointer relative flex flex-col items-start justify-between w-full gap-8 p-3 sm:p-6 border-2 border-black transition-all active:scale-[0.98] ${isSelected ? activeBg : inactiveBg}`}
    >
      <div className="flex justify-between w-full">
        <div
          className={`
            text-4xl shrink-0 transition-all duration-300 
            group-hover:scale-110
            ltr:group-hover:-rotate-6
            rtl:group-hover:rotate-6
            ${isSelected ? 'text-(--color-light)' : 'text-black'}
          `}
        >
          {icon}
        </div>
        <div className={`w-7 h-7 border-2 border-black flex items-center justify-center bg-(--color-light) transition-colors`}>
          {isSelected && <div className="w-4 h-4 bg-black" />}
        </div>
      </div>
      <span className="font-black uppercase text-sm tracking-wide text-left">{label}</span>
    </button>
  );
}