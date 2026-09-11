"use client";
import { useState, useEffect } from "react";
import { ReactFlowProvider, MarkerType } from "reactflow";
import { ProgramDetails } from "@/components/(moel-oua)/ProgramDetailsSidebar";
import { PathFinderProps, GraphData, JobTitleItem } from "./types";
import { NODE_W, NODE_H, START_W, START_H } from "./graph-nodes";
import { applyDagreLayout } from "./graph-layout";
import PathGraph from "./path-graph";

export default function PathFinder({
  local_lang, categories_id, user_diploma_id,
  categories, diplomas, onCategoryChange, onDiplomaChange,
}: PathFinderProps) {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobTitles, setJobTitles] = useState<JobTitleItem[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<ProgramDetails | null>(null);

  useEffect(() => {
    setSelectedJobId("");
    setSelectedProgram(null);
  }, [categories_id, user_diploma_id]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setGraphData(null);

    const fetchAndBuild = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/find-paths", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            starting_diploma_id: user_diploma_id,
            category_id: categories_id,
            local: local_lang,
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();
        const paths: unknown[][] = result.data;
        if (!paths || paths.length === 0) throw new Error("No paths found for this selection");

        const jobMap = new Map<string, JobTitleItem>();
        paths.forEach((path) => {
          path.forEach((prog: any) => {
            prog.job_titles?.forEach((jt: JobTitleItem) => {
              if (jt.id && !jobMap.has(jt.id)) jobMap.set(jt.id, jt);
            });
          });
        });
        setJobTitles(Array.from(jobMap.values()));

        const nodeMap = new Map<string, import("reactflow").Node>();
        const edgeSet = new Map<string, import("reactflow").Edge>();
        const pathIds: string[][] = [];

        nodeMap.set("start-root", {
          id: "start-root", type: "startNode",
          position: { x: 0, y: 0 },
          data: { _w: START_W, _h: START_H },
        });

        paths.forEach((path) => {
          const pathNodeIds: string[] = [];
          path.forEach((prog: any, i: number) => {
            const nodeId = prog.id;
            pathNodeIds.push(nodeId);
            if (!nodeMap.has(nodeId)) {
              nodeMap.set(nodeId, {
                id: nodeId, type: "programNode",
                position: { x: 0, y: 0 },
                data: {
                  ...prog,
                  requirements: prog.requirements || [],
                  color1: prog.color1 || "#ff946a",
                  color2: prog.color2 || "#f6f94f",
                  job_titles: prog.job_titles || [],
                  onShowDetails: (progData: ProgramDetails) => setSelectedProgram(progData),
                  _w: NODE_W,
                  _h: NODE_H,
                },
              });
            }
            const prev = i === 0 ? "start-root" : (path[i - 1] as any).id;
            const edgeKey = `${prev}-->${nodeId}`;
            if (!edgeSet.has(edgeKey)) {
              edgeSet.set(edgeKey, {
                id: edgeKey, source: prev, target: nodeId,
                type: "default",
                style: { stroke: "#94a3b8", strokeWidth: 1.5 },
                markerEnd: { type: MarkerType.Arrow, color: "#94a3b8" },
              });
            }
          });
          pathIds.push(pathNodeIds);
        });

        if (cancelled) return;

        const rawNodes = Array.from(nodeMap.values());
        const rawEdges = Array.from(edgeSet.values());
        const layoutedNodes = applyDagreLayout(rawNodes, rawEdges);
        setGraphData({ baseNodes: layoutedNodes, baseEdges: rawEdges, paths: pathIds });
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAndBuild();
    return () => { cancelled = true; };
  }, [categories_id, user_diploma_id, local_lang]);

  return (
    <ReactFlowProvider>
      <PathGraph
        graphData={graphData}
        loading={loading}
        error={error}
        categories={categories}
        diplomas={diplomas}
        jobTitles={jobTitles}
        categories_id={categories_id}
        user_diploma_id={user_diploma_id}
        selectedJobId={selectedJobId}
        selectedProgram={selectedProgram}
        onCategoryChange={onCategoryChange}
        onDiplomaChange={onDiplomaChange}
        onJobChange={setSelectedJobId}
        onCloseSidebar={() => setSelectedProgram(null)}
      />
    </ReactFlowProvider>
  );
}
