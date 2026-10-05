import { Handle, Position, NodeProps } from "reactflow";
import { useTranslations } from "next-intl";
import Card from "@/components/(moel-oua)/Card";
import { PATH_COLORS } from "./graph-layout";
import { Check } from "./types";

export const nodeTypes = { programNode: ProgramNode, startNode: StartNode };

const hiddenHandle = { opacity: 0, pointerEvents: "none" } as const;

function highlightStyle(highlighted: boolean, color: string) {
  return {
    outline: `3px solid ${highlighted ? color : "transparent"}`,
    outlineOffset: 3,
    borderRadius: 16,
    boxShadow: highlighted ? `0 0 24px ${color}66` : "none",
  };
}

export function ProgramNode({ id, data }: NodeProps) {
  const isRTL = data.direction === "RL";

  return (
    <div
      className={`transition-all duration-300 ${data.highlighted ? "scale-105 z-10" : ""}`}
      style={{ ...highlightStyle(data.highlighted, data.pathColor), opacity: data.dimmed ? 0.18 : 1 }}
    >
      <Handle type="target" position={isRTL ? Position.Right : Position.Left} style={hiddenHandle} />
      <Card
        program={data.program}
        blocked={data.checks.some((check: Check) => check.ok === false)}
        color1={data.color1}
        color2={data.color2}
        dir={data.dir}
        onShowDetails={() => data.onShowDetails(id)}
      />
      <Handle type="source" position={isRTL ? Position.Left : Position.Right} style={hiddenHandle} />
    </div>
  );
}

export function StartNode({ data }: NodeProps) {
  const t = useTranslations("path");
  const isRTL = data.direction === "RL";

  return (
    <div
      className={`transition-all duration-300 ${data.highlighted ? "scale-105 z-10" : ""}`}
      style={highlightStyle(data.highlighted, PATH_COLORS[0])}
    >
      <Handle id="main" type="source" position={isRTL ? Position.Left : Position.Right} style={hiddenHandle} />
      <Handle id="other" type="source" position={isRTL ? Position.Right : Position.Left} style={hiddenHandle} />
      <div
        dir={data.dir}
        className="w-[210px] bg-gradient-to-r from-cyan-200 via-sky-200 to-indigo-200 text-black border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] px-4 py-2.5 flex flex-col select-none"
      >
        <span className="text-[9px] font-mono uppercase font-black tracking-widest text-indigo-900">{t("startingPoint")}</span>
        <span className="font-extrabold text-xs text-black tracking-tight truncate">{data.label}</span>
      </div>
    </div>
  );
}
