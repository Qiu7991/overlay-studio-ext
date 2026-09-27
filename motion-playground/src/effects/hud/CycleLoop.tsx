import type { EffectDef, EffectProps } from "../types";
import { useEnter, useProgress } from "../useAnimation";
import {
  ACCENT_OPTIONS,
  ACCENT_VAR,
  OFFSET_CONTROLS,
  OFFSET_DEFAULTS,
  offsetVars,
  THEME_OPTIONS,
} from "./accent";

export interface CycleLoopParams {
  theme: "dark" | "light";
  /** 节点名,一行一个(3–5 个) */
  nodes: string;
  /** 圆环中心文案 */
  center: string;
  /** 每个节点的间隔,整圈 = 节点数 × 间隔 */
  stepMs: number;
  accent: string;
  offsetX?: number;
  offsetY?: number;
}

const CX = 450;
const CY = 330;
const R = 230;

function parseNodes(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5);
}

/**
 * 循环闭环:圆环上均匀排 3–5 个节点,弧线一路连出去把节点依次点亮,
 * 走满一圈后留一条慢速虚线环;中心落一句收束。
 * 弧线绘制与点亮阈值全部走进度钩子 —— 吃倍速,导出虚拟时间下逐帧一致。
 */
function CycleLoop({ params, playToken }: EffectProps<CycleLoopParams>) {
  const { nodes, center, stepMs, accent } = params;
  const entered = useEnter(playToken);
  const list = parseNodes(nodes);
  const n = list.length;
  const draw = useProgress(Math.max(600, n * stepMs), playToken);
  if (!n) return null;
  // useProgress 给的是「快起慢收」的缓动值;先还原成时间比例,再换成柔和的 S 曲线:
  // 弧线按 stepMs 的节奏匀速扫过、节点依次点亮,而不是一上来就全亮完
  const t01 = Math.min(1, -Math.log2(Math.max(1e-6, 1 - draw)) / 10);
  const sweep = t01 * t01 * (3 - 2 * t01);
  const done = sweep > 0.995;

  return (
    <div
      className={`hud xsb-cyc hud-anchor hud-anchor--center ${entered ? "is-in" : ""} ${done ? "is-done" : ""}`}
      style={{ ["--hud-acc" as string]: ACCENT_VAR[accent], ...offsetVars(params) }}
    >
      <div className="xsb-cyc-ring">
        <svg viewBox="0 0 900 660">
          <circle className="xsb-cyc-track" cx={CX} cy={CY} r={R} />
          <circle className="xsb-cyc-orbit" cx={CX} cy={CY} r={R - 26} />
          {/* 一整圈的弧线:从顶部顺时针画满,dashoffset 由进度驱动 */}
          <path
            className="xsb-cyc-arc"
            d={`M ${CX} ${CY - R} A ${R} ${R} 0 0 1 ${CX} ${CY + R} A ${R} ${R} 0 0 1 ${CX} ${CY - R}`}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - sweep}
          />
          {list.map((name, i) => {
            const rad = ((-90 + (i * 360) / n) * Math.PI) / 180;
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);
            const x = CX + R * cos;
            const y = CY + R * sin;
            const lx = CX + (R + 62) * cos;
            const ly = CY + (R + 62) * sin + 10;
            const anchor = Math.abs(cos) < 0.25 ? "middle" : cos > 0 ? "start" : "end";
            // 弧线扫到节点后再亮(阈值略留一点余量,观感是"依次点亮")
            const on = sweep >= (i + 0.35) / n;
            return (
              <g className={`xsb-cyc-pt ${on ? "is-on" : ""}`} key={i}>
                <circle className="xsb-cyc-halo" cx={x} cy={y} r={27} />
                <circle className="xsb-cyc-dot" cx={x} cy={y} r={13} />
                <text className="xsb-cyc-lb" x={lx} y={ly} textAnchor={anchor}>
                  {name}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="xsb-cyc-center">
          <div className="xsb-cyc-center-t">{center}</div>
        </div>
      </div>
    </div>
  );
}

export const cycleLoopDef: EffectDef<CycleLoopParams> = {
  id: "cycle-loop",
  name: "CycleLoop",
  description: "循环闭环 · 圆环节点依次点亮,弧线走满一圈",
  tags: ["生长描画", "扫过点亮"],
  selfPosition: true,
  defaults: {
    theme: "dark",
    nodes: "环节一\n环节二\n环节三\n环节四",
    center: "中心文案写在这",
    stepMs: 600,
    accent: "blue",
    ...OFFSET_DEFAULTS,
  },
  controls: [
    { key: "theme", label: "底色(此卡独立生效)", type: "select", options: THEME_OPTIONS },
    { key: "nodes", label: "节点(一行一个,3–5 个)", type: "textarea", rows: 5 },
    { key: "center", label: "中心文案", type: "text" },
    { key: "stepMs", label: "每个节点间隔", type: "range", min: 200, max: 2000, step: 50, unit: "ms" },
    { key: "accent", label: "强调色(弧线/节点)", type: "select", options: ACCENT_OPTIONS },
    ...OFFSET_CONTROLS,
  ],
  Component: CycleLoop,
};
