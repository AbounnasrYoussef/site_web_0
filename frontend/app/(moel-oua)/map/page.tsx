"use client";

import dynamic from "next/dynamic";

const MyMap = dynamic(() => import("@/components/(moel-oua)/map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[550px] border-2 border-black bg-amber-200 rounded-3xl shadow-[6px_6px_0px_#000] flex items-center justify-center font-black text-sm text-black animate-pulse">
      Loading Interactive Map...
    </div>
  ),
});

export default function MapPage() {
  return (
    <div className="w-full min-h-screen bg-[#f4f1ea] p-4 sm:p-8 flex flex-col gap-6 font-sans">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase font-black px-2.5 py-0.5 rounded-lg border border-black bg-[#9bf6ff] shadow-[2px_2px_0px_#000]">
            Institutions & Campuses
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
          Campus Explorer Map
        </h1>
        <p className="text-xs font-bold text-slate-600">
          Discover partner universities, engineering schools, and specialized institutes across Morocco.
        </p>
      </div>

      <MyMap />
    </div>
  );
}
