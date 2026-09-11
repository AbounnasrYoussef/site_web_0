"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
import ReactFlow, { Controls, Node, Edge, MarkerType } from "reactflow";
import "reactflow/dist/style.css";
import ProgramDetailsSidebar from "@/components/(moel-oua)/ProgramDetailsSidebar";
import { PathGraphProps, JobTitleItem } from "./types";
import { nodeTypes } from "./graph-nodes";
import { PATH_COLORS, AutoCenter } from "./graph-layout";

export default function PathGraph({
  graphData, loading, error, categories, diplomas, jobTitles,
  categories_id, user_diploma_id, selectedJobId, selectedProgram,
  onCategoryChange, onDiplomaChange, onJobChange, onCloseSidebar,
}: PathGraphProps) {
  const [activePathIndices, setActivePathIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!graphData || !selectedJobId) {
      setActivePathIndices(new Set());
      return;
    }
    const matching = new Set<number>();
    graphData.paths.forEach((pathNodeIds, pi) => {
      const hasJob = pathNodeIds.some((nodeId) => {
        const node = graphData.baseNodes.find((n) => n.id === nodeId);
        return node?.data?.job_titles?.some((j: JobTitleItem) => j.id === selectedJobId);
      });
      if (hasJob) matching.add(pi);
    });
    setActivePathIndices(matching);
  }, [selectedJobId, graphData]);

  const { nodes, edges } = useMemo(() => {
    if (!graphData) return { nodes: [], edges: [] };
    const { baseNodes, baseEdges, paths } = graphData;

    if (activePathIndices.size === 0) {
      return {
        nodes: baseNodes.map((n) => ({ ...n, data: { ...n.data, highlighted: false, dimmed: false } })),
        edges: baseEdges.map((e) => ({ ...e, style: { stroke: "#94a3b8", strokeWidth: 1.5, opacity: 0.6 }, animated: false, markerEnd: { type: MarkerType.Arrow, color: "#94a3b8" } })),
      };
    }

    const activeNodeIds = new Set<string>(["start-root"]);
    const activeEdgeIds = new Set<string>();

    activePathIndices.forEach((pi) => {
      const path = paths[pi];
      if (!path) return;
      path.forEach((nodeId, i) => {
        activeNodeIds.add(nodeId);
        const prev = i === 0 ? "start-root" : path[i - 1];
        activeEdgeIds.add(`${prev}-->${nodeId}`);
      });
    });

    const pathColorsForNodes: Record<string, string> = {};
    activePathIndices.forEach((pi) => {
      const color = PATH_COLORS[pi % PATH_COLORS.length];
      const path = paths[pi];
      if (!path) return;
      path.forEach((nodeId) => { pathColorsForNodes[nodeId] = color; });
    });

    return {
      nodes: baseNodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          highlighted: activeNodeIds.has(n.id),
          dimmed: !activeNodeIds.has(n.id),
          pathColor: pathColorsForNodes[n.id] || "#6366f1",
        },
      })),
      edges: baseEdges.map((e) => {
        const isActive = activeEdgeIds.has(e.id);
        const pathIdx = Array.from(activePathIndices).find((pi) => {
          const path = paths[pi];
          if (!path) return false;
          return path.some((nodeId, i) => {
            const prev = i === 0 ? "start-root" : path[i - 1];
            return `${prev}-->${nodeId}` === e.id;
          });
        });
        const color = pathIdx !== undefined ? PATH_COLORS[pathIdx % PATH_COLORS.length] : "#6366f1";
        return {
          ...e,
          style: isActive ? { stroke: color, strokeWidth: 3.5, opacity: 1 } : { stroke: "#e2e8f0", strokeWidth: 1, opacity: 0.2 },
          animated: isActive,
          markerEnd: { type: MarkerType.ArrowClosed, color: isActive ? color : "#e2e8f0" },
        };
      }),
    };
  }, [graphData, activePathIndices]);

  const onNodeClick = useCallback((_: unknown, node: Node) => {
    if (!graphData) return;
    const matchingPaths = new Set<number>();
    graphData.paths.forEach((path, pi) => {
      if (node.id === "start-root" || path.includes(node.id)) matchingPaths.add(pi);
    });
    if (matchingPaths.size === 0) return;
    setActivePathIndices((prev) => {
      const same = prev.size === matchingPaths.size && [...matchingPaths].every((i) => prev.has(i));
      return same ? new Set() : matchingPaths;
    });
  }, [graphData]);

  const onEdgeClick = useCallback((_: unknown, edge: Edge) => {
    if (!graphData) return;
    const matchingPaths = new Set<number>();
    graphData.paths.forEach((path, pi) => {
      path.forEach((nodeId, i) => {
        const prev = i === 0 ? "start-root" : path[i - 1];
        if (`${prev}-->${nodeId}` === edge.id) matchingPaths.add(pi);
      });
    });
    if (matchingPaths.size === 0) return;
    setActivePathIndices((prev) => {
      const same = prev.size === matchingPaths.size && [...matchingPaths].every((i) => prev.has(i));
      return same ? new Set() : matchingPaths;
    });
  }, [graphData]);

  const onPaneClick = useCallback(() => setActivePathIndices(new Set()), []);

  const hasFilters = !!(diplomas?.length || categories?.length);
  const hasJobFilter = !loading && !error && graphData && jobTitles && jobTitles.length > 0;

  return (
    <div className="w-full flex flex-col bg-white border-2 border-black rounded-3xl shadow-[6px_6px_0px_#000] overflow-hidden select-none">
      {(hasFilters || hasJobFilter) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 pt-3 pb-2 border-b-2 border-black bg-white/95 z-20 flex-shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {diplomas && diplomas.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono uppercase font-black text-slate-700 shrink-0">Diploma:</span>
                <select
                  value={user_diploma_id}
                  onChange={(e) => onDiplomaChange?.(e.target.value)}
                  className="border-2 border-black bg-amber-200 text-black font-bold text-xs px-2 py-1 rounded-xl outline-none cursor-pointer max-w-[160px] truncate hover:bg-amber-300 transition-colors"
                >
                  {diplomas.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            )}
            {categories && categories.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono uppercase font-black text-slate-700 shrink-0">Category:</span>
                <select
                  value={categories_id}
                  onChange={(e) => onCategoryChange?.(e.target.value)}
                  className="border-2 border-black bg-[#9bf6ff] text-black font-bold text-xs px-2 py-1 rounded-xl outline-none cursor-pointer max-w-[160px] truncate hover:bg-cyan-200 transition-colors"
                >
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
          </div>

          {hasJobFilter && (
            <div className="flex items-center gap-1.5 animate-pop-in">
              <span className="text-[9px] font-mono uppercase font-black text-slate-700 shrink-0">Target Job:</span>
              <select
                value={selectedJobId}
                onChange={(e) => onJobChange?.(e.target.value)}
                className="border-2 border-black bg-emerald-200 text-black font-bold text-xs px-2 py-1 rounded-xl outline-none cursor-pointer max-w-[180px] truncate hover:bg-emerald-300 transition-colors"
              >
                <option value="">All Jobs ({jobTitles!.length})</option>
                {jobTitles!.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      <div className="squared-bg relative h-[65vh] sm:h-[80vh] min-h-[380px] overflow-hidden">
        {activePathIndices.size > 0 && (
          <div className="absolute bottom-14 left-3 z-20 bg-black/90 backdrop-blur-md text-white text-xs font-mono px-3 py-1.5 rounded-2xl border-2 border-white/20 shadow-[3px_3px_0px_#000] animate-pop-in pointer-events-none">
            {activePathIndices.size} path{activePathIndices.size > 1 ? "s" : ""} highlighted
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-md z-30">
            <div className="border-2 border-black bg-amber-300 text-black px-6 py-4 rounded-3xl shadow-[6px_6px_0px_#000] animate-bounce flex items-center gap-3 font-black text-sm">
              <span className="w-3 h-3 rounded-full bg-black animate-ping" />
              Calculating Pathways...
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-md z-30 p-4">
            <div className="border-2 border-black bg-red-400 text-black font-bold px-6 py-4 rounded-3xl shadow-[6px_6px_0px_#000] text-sm text-center animate-pop-in">
              {error}
            </div>
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
          panOnScroll={false}
          panOnDrag={[0, 1, 2]}
          zoomOnPinch
          zoomOnScroll
          preventScrolling
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{
            type: "default",
            style: { stroke: "#94a3b8", strokeWidth: 1.5 },
            markerEnd: { type: MarkerType.Arrow, color: "#94a3b8" },
          }}
        >
          <AutoCenter graphData={graphData} />
          <Controls position="bottom-right" />
        </ReactFlow>

        <ProgramDetailsSidebar
          program={selectedProgram}
          isOpen={!!selectedProgram}
          onClose={onCloseSidebar}
        />
      </div>
    </div>
  );
}
