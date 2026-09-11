import { useEffect } from "react";
import { Node, Edge, useReactFlow } from "reactflow";
import dagre from "dagre";
import { GraphData } from "./types";
import { NODE_W, NODE_H } from "./graph-nodes";

export const PATH_COLORS = ["#6366f1","#f59e0b","#10b981","#ef4444","#8b5cf6","#ec4899","#14b8a6","#f97316","#06b6d4","#84cc16"];

export function applyDagreLayout(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph({ multigraph: false });
  g.setGraph({ rankdir: "LR", nodesep: 65, ranksep: 180, marginx: 80, marginy: 80 });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((n) => g.setNode(n.id, { width: n.data._w || NODE_W, height: n.data._h || NODE_H }));

  const seenEdges = new Set<string>();
  edges.forEach((e) => {
    const key = `${e.source}-->${e.target}`;
    if (!seenEdges.has(key)) { seenEdges.add(key); g.setEdge(e.source, e.target); }
  });

  dagre.layout(g);

  return nodes.map((n) => {
    const pos = g.node(n.id);
    const w = n.data._w || NODE_W;
    const h = n.data._h || NODE_H;
    return { ...n, position: { x: pos.x - w / 2, y: pos.y - h / 2 } };
  });
}

export function AutoCenter({ graphData }: { graphData: GraphData | null }) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (graphData && graphData.baseNodes.length > 0) {
      const timer = setTimeout(() => {
        fitView({ padding: 0.2, duration: 450 });
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [graphData, fitView]);

  return null;
}
