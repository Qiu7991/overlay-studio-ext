import type { EffectDef, EffectProps } from "../types";
import { easeOutExpo, useEnter, useProgress } from "../useAnimation";
import {
  ACCENT_OPTIONS,
  ACCENT_VAR,
  OFFSET_CONTROLS,
  OFFSET_DEFAULTS,
  offsetVars,
  THEME_OPTIONS,
} from "./accent";

export interface OrgChartParams {
  theme: "dark" | "light";
  position: "left" | "center" | "right";
  /** 根节点文案 */
  root: string;
  /** 根节点小注 */
  rootSub: string;
  /** 分支,一行一条「名称|小注」,2–4 条 */
  branches: string;
  /** 每支连接线画出的间隔(卡点用) */
  lineMs: number;
  accent: string;
  offsetX?: number;
  offsetY?: number;
}

interface Branch {
  name: string;
  sub: string;
}

function parseBranches(raw: string): Branch[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 4)
    .map((l) => {
      const [name = "", sub = ""] = l.split("|").map((s) => s.trim());
      return { name, sub };
    });
}

/**
 * useProgress 的返回值已经过 easeOutExpo;这里反解回线性时间 0→1,
 * 好让每支连接线严格按 lineMs 依次推进 —— 直接切缓动后的进度会把
 * 三支线的窗口揉在一起(第一支瞬间画完,后两支挤在尾巴上)。
 */
function unEase(p: number): number {
  return p >= 1 ? 1 : Math.min(1, -Math.log2(1 - p) / 10);
}

const W = 860;
const GAP = 22;
const LINE_H = 104;

/**
 * 组织架构卡:顶部一个玻璃底根节点,向下 2–4 条「先竖后横」的折线依次生长,
 * 子节点卡片跟着滑入 —— 谁挂在谁下面、有几支,一眼看清。
 */
function OrgChart({ params, playToken }: EffectProps<OrgChartParams>) {
  const { position, root, rootSub, branches, lineMs, accent } = params;
  const entered = useEnter(playToken);
  const list = parseBranches(branches);
  const n = Math.max(1, list.length);
  const step = Math.max(200, lineMs);
  // 总时长 = 每支间隔 × 支数;反解出的线性时间再按支切窗口,逐支画出
  const raw = useProgress(step * n, playToken);
  const t = unEase(raw);

  const colW = (W - (n - 1) * GAP) / n;
  const colX = (i: number) => colW * (i + 0.5) + i * GAP;
  const seg = (i: number) => easeOutExpo(Math.max(0, Math.min(1, t * n - i)));

  return (
    <div
      className={`hud xsa-org hud-anchor hud-anchor--${position} ${entered ? "is-in" : ""}`}
      style={{ ["--hud-acc" as string]: ACCENT_VAR[accent], ...offsetVars(params) }}
    >
      <div className="xsa-org-inner" style={{ width: W }}>
        <div className="xsa-org-root">
          <div className="xsa-org-root-name">{root}</div>
          {rootSub && <div className="xsa-org-root-sub">{rootSub}</div>}
        </div>

        <svg className="xsa-org-lines" width={W} height={LINE_H} viewBox={`0 0 ${W} ${LINE_H}`}>
          {list.map((_, i) => {
            const x = colX(i);
            const y = LINE_H / 2;
            const d = `M ${W / 2} 0 L ${W / 2} ${y} L ${x} ${y} L ${x} ${LINE_H}`;
            return (
              <path
                key={i}
                className="xsa-org-path"
                d={d}
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - seg(i)}
              />
            );
          })}
        </svg>

        <div className="xsa-org-children" style={{ gap: GAP }}>
          {list.map((b, i) => (
            <div
              className="xsa-org-child"
              key={i}
              style={{ transitionDelay: `${i * step + 140}ms` }}
            >
              <div className="xsa-org-child-name">{b.name}</div>
              {b.sub && <div className="xsa-org-child-sub">{b.sub}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const orgChartDef: EffectDef<OrgChartParams> = {
  id: "org-chart",
  name: "OrgChart",
  description: "组织架构 · 根节点向下逐支画出连线与子节点",
  tags: ["生长描画", "逐条落位"],
  selfPosition: true,
  defaults: {
    theme: "dark",
    position: "center",
    root: "根节点写在这",
    rootSub: "一句话小注",
    branches: "分支一|小注一行\n分支二|小注一行\n分支三|小注一行",
    lineMs: 520,
    accent: "blue",
    ...OFFSET_DEFAULTS,
  },
  controls: [
    { key: "theme", label: "底色(此卡独立生效)", type: "select", options: THEME_OPTIONS },
    {
      key: "position",
      label: "落位",
      type: "select",
      options: [
        { label: "居中", value: "center" },
        { label: "左侧", value: "left" },
        { label: "右侧", value: "right" },
      ],
    },
    { key: "root", label: "根节点文案", type: "text" },
    { key: "rootSub", label: "根节点小注", type: "text" },
    {
      key: "branches",
      label: "分支(一行一条「名称|小注」,2–4 条)",
      type: "textarea",
      rows: 4,
    },
    {
      key: "lineMs",
      label: "每支画出间隔(卡点用)",
      type: "range",
      min: 200,
      max: 2000,
      step: 50,
      unit: "ms",
    },
    { key: "accent", label: "强调色(连线)", type: "select", options: ACCENT_OPTIONS },
    ...OFFSET_CONTROLS,
  ],
  Component: OrgChart,
};
