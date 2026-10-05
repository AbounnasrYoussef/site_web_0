"use client";
import { useState, useEffect } from "react";
import { ReactFlowProvider } from "reactflow";
import { useLocale } from "next-intl";
import { fetchPaths } from "@/components/(moel-oua)/api";
import { Option, PathResult, Student } from "./types";
import PathGraph from "./path-graph";

interface PathFinderProps {
  categories: Option[];
  diplomas: Option[];
  categoryId: string;
  diplomaId: string;
  student: Student;
  canChangeDiploma: boolean;
  onCategoryChange: (id: string) => void;
  onDiplomaChange: (id: string) => void;
  onReset: () => void;
}

export default function PathFinder(props: PathFinderProps) {
  const { diplomas, categoryId, diplomaId, student } = props;
  const locale = useLocale();
  const [paths, setPaths] = useState<PathResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const direction = locale === "ar" ? "RL" : "LR";
  const startLabel = diplomas.find((diploma) => diploma.id === diplomaId)?.name ?? "";

  useEffect(() => {
    let cancelled = false;
    fetchPaths(categoryId, diplomaId, locale, student)
      .then((found) => {
        if (cancelled) return;
        if (found.length === 0) setError("noPaths");
        else setPaths(found);
      })
      .catch(() => {
        if (!cancelled) setError("error");
      });

    return () => {
      cancelled = true;
    };
  }, [categoryId, diplomaId, locale, student]);

  return (
    <ReactFlowProvider>
      <PathGraph paths={paths ?? []} direction={direction} startLabel={startLabel} loading={!paths && !error} error={error} {...props} />
    </ReactFlowProvider>
  );
}
