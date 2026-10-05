import { useEffect } from "react";
import { Node, Edge, useReactFlow, useStore } from "reactflow";
import dagre from "dagre";
import { Check, Direction, GraphData, PathResult } from "./types";

export const START_ID = "start";
const OTHER_SIDE_SUFFIX = ":other";
const MIN_ZOOM = 0.6;
const MIN_ZOOM_ON_PHONE = 0.35;
const PHONE_WIDTH = 640;
const VIEW_MARGIN = 24;
export const NODE_SIZE = { width: 270, height: 140 };
export const START_SIZE = { width: 210, height: 56 };

export const PATH_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#06b6d4", "#84cc16"];

const CARD_COLORS = [
  { color1: "#FFD166", color2: "#06D6A0" },
  { color1: "#FF9F1C", color2: "#2EC4B6" },
  { color1: "#9BF6FF", color2: "#CAFFBF" },
  { color1: "#FFADAD", color2: "#FDFFB6" },
  { color1: "#BDB2FF", color2: "#FFC6FF" },
  { color1: "#A8E6CF", color2: "#DCEDC1" },
  { color1: "#FF8B94", color2: "#FFAAA5" },
  { color1: "#81D4FA", color2: "#E1BEE7" },
  { color1: "#FFE082", color2: "#80CBC4" },
  { color1: "#F8A5C2", color2: "#F190B7" },
  { color1: "#C5E1A5", color2: "#FFF59D" },
  { color1: "#FFAB91", color2: "#80DEEA" },
];

const nodeSize = (node: Node) => (node.id === START_ID ? START_SIZE : NODE_SIZE);

export function pathEdgeIds(path: string[]): string[] {
  return path.map((id, i) => `${i === 0 ? START_ID : path[i - 1]}-->${id}`);
}

function applyLayout(nodes: Node[], edges: Edge[], direction: Direction): Node[] {
  const graph = new dagre.graphlib.Graph();
  graph.setGraph({ rankdir: direction, nodesep: 30, ranksep: 140, marginx: 80, marginy: 80 });
  graph.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => graph.setNode(node.id, { ...nodeSize(node) }));
  edges.forEach((edge) => graph.setEdge(edge.source, edge.target));
  dagre.layout(graph);

  return nodes.map((node) => {
    const { x, y } = graph.node(node.id);
    const { width, height } = nodeSize(node);
    return { ...node, position: { x: x - width / 2, y: y - height / 2 } };
  });
}

const opposite = (direction: Direction): Direction => (direction === "LR" ? "RL" : "LR");

const failures = (checks: Check[]) => checks.filter((check) => check.ok === false).length;

function pickOtherSideStarts(results: PathResult[]): Set<string> {
  const pathCounts = new Map<string, number>();
  results.forEach(({ programs }) => pathCounts.set(programs[0].id, (pathCounts.get(programs[0].id) ?? 0) + 1));

  const otherSide = new Set<string>();
  let mainTotal = 0;
  let otherTotal = 0;
  [...pathCounts].sort((a, b) => b[1] - a[1]).forEach(([id, count]) => {
    if (mainTotal <= otherTotal) {
      mainTotal += count;
    } else {
      otherTotal += count;
      otherSide.add(id);
    }
  });
  return otherSide;
}

export function buildGraph(results: PathResult[], direction: Direction, startLabel: string): GraphData {
  const position = { x: 0, y: 0 };
  const dir = direction === "RL" ? "rtl" : "ltr";
  const otherSideStarts = pickOtherSideStarts(results);
  const start: Node = { id: START_ID, type: "startNode", position, data: { label: startLabel, direction, dir } };
  const colors = new Map<string, (typeof CARD_COLORS)[number]>();
  const mainNodes = new Map<string, Node>();
  const otherNodes = new Map<string, Node>();
  const edges = new Map<string, Edge>();

  const paths = results.map(({ programs: path, checks }) => {
    const isOtherSide = otherSideStarts.has(path[0].id);
    const sideNodes = isOtherSide ? otherNodes : mainNodes;
    const ids = path.map((program) => (isOtherSide ? `${program.id}${OTHER_SIDE_SUFFIX}` : program.id));
    const edgeIds = pathEdgeIds(ids);

    path.forEach((program, i) => {
      if (!colors.has(program.id)) colors.set(program.id, CARD_COLORS[colors.size % CARD_COLORS.length]);
      // A program shared by several paths keeps the checks of the path where it fares best.
      const previous = sideNodes.get(ids[i])?.data.checks;
      const stepChecks = previous && failures(previous) <= failures(checks[i]) ? previous : checks[i];
      const data = { program, checks: stepChecks, dir, direction: isOtherSide ? opposite(direction) : direction, ...colors.get(program.id) };
      sideNodes.set(ids[i], { id: ids[i], type: "programNode", position, data });
      edges.set(edgeIds[i], {
        id: edgeIds[i],
        source: i === 0 ? START_ID : ids[i - 1],
        target: ids[i],
        sourceHandle: isOtherSide ? "other" : "main",
      });
    });
    return ids;
  });

  const edgeList = [...edges.values()];
  const layoutSide = (side: Map<string, Node>, sideDirection: Direction) =>
    applyLayout([start, ...side.values()], edgeList.filter((edge) => side.has(edge.target)), sideDirection);

  const [mainStart, ...mainSide] = layoutSide(mainNodes, direction);
  const [otherStart, ...otherSide] = layoutSide(otherNodes, opposite(direction));
  const shift = { x: mainStart.position.x - otherStart.position.x, y: mainStart.position.y - otherStart.position.y };
  const movedSide = otherSide.map((node) => ({ ...node, position: { x: node.position.x + shift.x, y: node.position.y + shift.y } }));

  return { nodes: [mainStart, ...mainSide, ...movedSide], edges: edgeList, paths };
}

export function AutoCenter({ graph }: { graph: GraphData | null }) {
  const { setViewport } = useReactFlow();
  const width = useStore((state) => state.width);
  const height = useStore((state) => state.height);

  useEffect(() => {
    if (!graph || !width || !height) return;

    const left = Math.min(...graph.nodes.map((node) => node.position.x));
    const top = Math.min(...graph.nodes.map((node) => node.position.y));
    const right = Math.max(...graph.nodes.map((node) => node.position.x + nodeSize(node).width));
    const bottom = Math.max(...graph.nodes.map((node) => node.position.y + nodeSize(node).height));
    const minZoom = width < PHONE_WIDTH ? MIN_ZOOM_ON_PHONE : MIN_ZOOM;
    const fitZoom = Math.min(width / (right - left + VIEW_MARGIN), height / (bottom - top + VIEW_MARGIN), 1);

    if (fitZoom >= minZoom) {
      setViewport({ x: (width - (left + right) * fitZoom) / 2, y: (height - (top + bottom) * fitZoom) / 2, zoom: fitZoom });
      return;
    }

    const start = graph.nodes.find((node) => node.id === START_ID)!.position;
    const x = width / 2 - (start.x + START_SIZE.width / 2) * minZoom;
    const y = height / 2 - (start.y + START_SIZE.height / 2) * minZoom;
    setViewport({ x, y, zoom: minZoom });
  }, [graph, width, height, setViewport]);

  return null;
}
