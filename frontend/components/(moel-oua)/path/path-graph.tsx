"use client";
import { useState, useMemo } from "react";
import ReactFlow, { Controls, MarkerType } from "reactflow";
import "reactflow/dist/style.css";
import { useLocale, useTranslations } from "next-intl";
import Dropdown, { DropdownOption } from "@/components/dropdown";
import ProgramDetailsSidebar from "@/components/(moel-oua)/ProgramDetailsSidebar";
import { Direction, JobTitle, Option, PathResult } from "./types";
import { nodeTypes } from "./graph-nodes";
import { PATH_COLORS, START_ID, AutoCenter, buildGraph, pathEdgeIds } from "./graph-layout";

const EDGE_COLOR = "#94a3b8";
const DIMMED_EDGE_COLOR = "#e2e8f0";

interface PathGraphProps {
  paths: PathResult[];
  direction: Direction;
  startLabel: string;
  loading: boolean;
  error: string | null;
  categories: Option[];
  diplomas: Option[];
  categoryId: string;
  diplomaId: string;
  canChangeDiploma: boolean;
  onCategoryChange: (id: string) => void;
  onDiplomaChange: (id: string) => void;
  onReset: () => void;
}

const overlayClass = "absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-md z-30 p-4";
const messageClass = "border-2 border-black text-black font-bold px-6 py-4 rounded-3xl shadow-[6px_6px_0px_#000] text-sm text-center";

const sameItems = (a: number[], b: number[]) => a.length === b.length && a.every((item, i) => item === b[i]);

export default function PathGraph({
  paths: allPaths, direction, startLabel, loading, error, categories, diplomas,
  categoryId, diplomaId, canChangeDiploma, onCategoryChange, onDiplomaChange, onReset,
}: PathGraphProps) {
  const t = useTranslations("path");
  const dir = useLocale() === "ar" ? "rtl" : "ltr";
  const [activePaths, setActivePaths] = useState<number[]>([]);
  const [jobId, setJobId] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [onlyEligible, setOnlyEligible] = useState(false);

  const lastProgram = ({ programs }: PathResult) => programs[programs.length - 1];
  const eligibleCount = allPaths.filter((path) => path.eligible).length;
  const canFilterEligible = eligibleCount > 0 && eligibleCount < allPaths.length;

  const jobs = useMemo(() => {
    const byId = new Map<string, JobTitle>();
    allPaths.forEach((path) => lastProgram(path).job_titles.forEach((job) => byId.set(job.id, job)));
    return [...byId.values()];
  }, [allPaths]);

  const toOptions = (options: Option[]) => options.map((option) => ({ label: option.name, value: option.id }));
  const diplomaOptions = useMemo(() => toOptions(diplomas), [diplomas]);
  const categoryOptions = useMemo(() => toOptions(categories), [categories]);
  const jobOptions = useMemo(
    () => [{ label: t("allJobs", { count: jobs.length }), value: "" }, ...jobs.map((job) => ({ label: job.title, value: job.id }))],
    [jobs, t]
  );

  const visiblePaths = useMemo(
    () =>
      allPaths.filter(
        (path) =>
          (!jobId || lastProgram(path).job_titles.some((job) => job.id === jobId)) &&
          (!onlyEligible || !canFilterEligible || path.eligible)
      ),
    [allPaths, jobId, onlyEligible, canFilterEligible]
  );

  const graph = useMemo(
    () => (visiblePaths.length > 0 ? buildGraph(visiblePaths, direction, startLabel) : null),
    [visiblePaths, direction, startLabel]
  );
  const summary = activePaths.length === 1 ? visiblePaths[activePaths[0]] : null;

  const paths = graph?.paths ?? [];
  const selected = graph?.nodes.find((node) => node.id === selectedId)?.data;

  const pathsWhere = (matches: (path: string[]) => boolean) =>
    paths.flatMap((path, index) => (matches(path) ? [index] : []));

  const togglePaths = (indices: number[]) =>
    setActivePaths((current) => (sameItems(current, indices) ? [] : indices));

  const selectJob = (id: string) => {
    setJobId(id);
    setActivePaths([]);
  };

  const toggleEligible = () => {
    setOnlyEligible((current) => !current);
    setActivePaths([]);
  };

  const { nodes, edges } = useMemo(() => {
    if (!graph) return { nodes: [], edges: [] };

    const highlighting = activePaths.length > 0;
    const nodeColors = new Map<string, string>();
    const edgeColors = new Map<string, string>();
    activePaths.forEach((index) => {
      const color = PATH_COLORS[index % PATH_COLORS.length];
      graph.paths[index].forEach((id) => nodeColors.set(id, color));
      pathEdgeIds(graph.paths[index]).forEach((id) => edgeColors.set(id, color));
    });

    return {
      nodes: graph.nodes.map((node) => {
        const highlighted = highlighting && (node.id === START_ID || nodeColors.has(node.id));
        return {
          ...node,
          data: {
            ...node.data,
            highlighted,
            dimmed: highlighting && !highlighted,
            pathColor: nodeColors.get(node.id),
            onShowDetails: setSelectedId,
          },
        };
      }),
      edges: graph.edges.map((edge) => {
        const activeColor = edgeColors.get(edge.id);
        const color = activeColor ?? (highlighting ? DIMMED_EDGE_COLOR : EDGE_COLOR);
        return {
          ...edge,
          animated: !!activeColor,
          style: { stroke: color, strokeWidth: activeColor ? 3.5 : 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color },
        };
      }),
    };
  }, [graph, activePaths]);

  return (
    <div dir={dir} className="w-full flex-1 flex flex-col overflow-hidden select-none">
      <div className="squared-bg relative flex-1 min-h-[380px] overflow-hidden">
        <div className="absolute top-3 inset-x-3 z-20 flex flex-row items-start gap-2 pointer-events-none">
          {canChangeDiploma && (
            <Filter label={t("currentDiploma")} value={diplomaId} onChange={onDiplomaChange} options={diplomaOptions} />
          )}
          <Filter label={t("category")} value={categoryId} onChange={onCategoryChange} options={categoryOptions} />
          {jobs.length > 0 && (
            <Filter label={t("targetJob")} value={jobId} onChange={selectJob} options={jobOptions} />
          )}
          {canFilterEligible && (
            <button
              type="button"
              aria-pressed={onlyEligible}
              onClick={toggleEligible}
              className={`pointer-events-auto shrink-0 self-stretch px-3 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] text-[11px] font-black uppercase cursor-pointer active:translate-y-0.5 active:shadow-none transition-all ${
                onlyEligible ? "bg-[#ccee00] text-black" : "bg-white text-black"
              }`}
            >
              {onlyEligible ? "✓ " : ""}
              {t("onlyEligible", { count: eligibleCount })}
            </button>
          )}
        </div>

        {activePaths.length > 0 && (
          <div className="absolute bottom-14 start-3 z-20 bg-black/90 text-white text-xs font-mono px-3 py-1.5 rounded-2xl border-2 border-white/20 pointer-events-none">
            {summary ? (
              <>
                {t("pathSummary", { years: summary.total_years, steps: summary.programs.length, concours: summary.concours_count })}
                <span className={`ms-2 font-black ${summary.eligible ? "text-[#ccee00]" : "text-red-400"}`}>
                  {summary.eligible ? t("eligible") : t("notEligible")}
                </span>
              </>
            ) : (
              t("highlighted", { count: activePaths.length })
            )}
          </div>
        )}
        {loading && (
          <div className={overlayClass}>
            <div className={`${messageClass} bg-amber-300 animate-pulse`}>{t("loading")}</div>
          </div>
        )}
        {error && (
          <div className={overlayClass}>
            <div className={`${messageClass} bg-red-400 flex flex-col items-center gap-3`}>
              {t(error)}
              <button
                onClick={onReset}
                className="px-4 py-2 rounded-xl border-2 border-black bg-white text-black font-black text-xs uppercase shadow-[3px_3px_0px_#000] cursor-pointer active:translate-y-0.5 active:shadow-none transition-all"
              >
                {t("startOver")}
              </button>
            </div>
          </div>
        )}

        <div dir="ltr" className="absolute inset-x-0 bottom-0 top-20">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodeClick={(_, node) => togglePaths(pathsWhere((path) => node.id === START_ID || path.includes(node.id)))}
            onEdgeClick={(_, edge) => togglePaths(pathsWhere((path) => pathEdgeIds(path).includes(edge.id)))}
            onPaneClick={() => setActivePaths([])}
            minZoom={0.1}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
          >
            <AutoCenter graph={graph} />
            <Controls position="bottom-right" fitViewOptions={{ nodes: [{ id: START_ID }], maxZoom: 1, duration: 400 }} />
          </ReactFlow>
        </div>

        <ProgramDetailsSidebar
          program={selected?.program ?? null}
          checks={selected?.checks ?? []}
          color1={selected?.color1}
          color2={selected?.color2}
          onClose={() => setSelectedId(null)}
        />
      </div>
    </div>
  );
}

interface FilterProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
}

function Filter({ label, value, onChange, options }: FilterProps) {
  return (
    <div className="pointer-events-auto flex-1 min-w-0 sm:flex-none sm:w-56 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] px-2 py-1.5">
      <Dropdown label={label} value={value} onChange={onChange} options={options} placeholder={label} />
    </div>
  );
}
