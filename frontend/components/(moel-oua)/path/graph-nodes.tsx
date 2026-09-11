import { Handle, Position, NodeProps } from "reactflow";
import Card from "@/components/(moel-oua)/Card";

export const NODE_W = 270;
export const NODE_H = 125;
export const START_W = 210;
export const START_H = 56;

export const nodeTypes = { programNode: ProgramNode, startNode: StartNode };

export function ProgramNode({ data }: NodeProps) {
  return (
    <div
      className={`transition-all duration-300 ${data.highlighted ? "scale-105 animate-pulse-border z-10" : ""}`}
      style={{
        opacity: data.dimmed ? 0.18 : 1,
        outline: data.highlighted ? `3px solid ${data.pathColor}` : "3px solid transparent",
        outlineOffset: 3,
        borderRadius: 16,
        boxShadow: data.highlighted ? `0 0 24px ${data.pathColor}66` : "none",
      }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0, pointerEvents: "none" }} />
      <Card
        uni_name={data.uni_name}
        uni_abrv={data.uni_abrv}
        prog_name={data.prog_name}
        color1={data.color1}
        color2={data.color2}
        years_of_study={data.years_of_study}
        job_titles={data.job_titles}
        onShowDetails={() => data.onShowDetails?.(data)}
      />
      <Handle type="source" position={Position.Right} style={{ opacity: 0, pointerEvents: "none" }} />
    </div>
  );
}

export function StartNode({ data }: NodeProps) {
  return (
    <div
      className={`transition-all duration-300 ${data.highlighted ? "scale-105 animate-pulse-border z-10" : ""}`}
      style={{
        outline: data.highlighted ? `3px solid #6366f1` : "3px solid transparent",
        outlineOffset: 3,
        borderRadius: 18,
        boxShadow: data.highlighted ? "0 0 24px #6366f166" : "none",
      }}
    >
      <Handle type="source" position={Position.Right} style={{ opacity: 0, pointerEvents: "none" }} />
      <div className="bg-gradient-to-r from-cyan-200 via-sky-200 to-indigo-200 text-black border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] px-4 py-2.5 flex items-center gap-2.5 select-none">
        <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-black text-xs shrink-0 shadow-[2px_2px_0px_rgba(255,255,255,0.4)]">
          BAC
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-mono uppercase font-black tracking-widest text-indigo-900">Starting Point</span>
          <span className="font-extrabold text-xs text-black tracking-tight">Baccalauréat</span>
        </div>
      </div>
    </div>
  );
}
