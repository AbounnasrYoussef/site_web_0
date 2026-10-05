"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

function MapLoading() {
  const t = useTranslations("map");

  return (
    <div className="flex flex-col items-center justify-center gap-3 flex-1 w-full">
      <div className="w-10 h-10 border-4 border-black border-t-[#ccee00] rounded-full animate-spin" />
      <p className="font-black text-sm uppercase">{t("loading")}</p>
    </div>
  );
}

const MyMap = dynamic(() => import("./map-view"), { ssr: false, loading: () => <MapLoading /> });

export default MyMap;
