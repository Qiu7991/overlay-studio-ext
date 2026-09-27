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

export interface MatrixGridParams {
  theme: "dark" | "light";
  position: "left" | "center" | "right";
  /** 横轴「左轴名|右轴名」 */
  xAxis: string;
  /** 纵轴「下轴名|上轴名」 */
  yAxis: string;
  /** 项目,一行一条「名称 x y」,x/y 为 -1~1 小数 */
  items: string;
  /** 每个项目落位的间隔 */
  stepMs: number;
  accent: string;
  offsetX?: number;
  offsetY?: number;
}

interface Item {
  name: string;
  x: number;
  y: number;
}

function parseItems(raw: string): Item[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 8)
    .map((l) => {
      const m = l.match(/^(.*?)\s+(-?[\d.]+)\s+(-?[\d.]+)$/);
      const cl = (v: number) => Math.max(-1, Math.min(1, v));
      if (!m) return { name: l, x: 0, y: 0 };
      return { name: m[1].trim(), x: cl(parseFloat(m[2])), y: cl(parseFloat(m[3])) };
    });
}

/** useProgress 已切缓动;反解回线性时间 0→1,好按 stepMs 依次落点 */
function unEase(p: number): number {
  return p >= 1 ? 1 : Math.min(1, -Math.log2(1 - p) / 10);
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const W = 760;
const H = 660;
const PAD = 74;
const IN_W = W - PAD * 2;
const IN_H = H - PAD * 2;

/**
 * 四象限矩阵卡:浅描边 2×2 网格 + 中轴线 + 四角轴标签,
 * 项目按 (x,y) 映射到网格内坐标,依次缩放落位 —— 谁强谁弱、往哪偏,一眼可见。
 */
function MatrixGrid({ params, playToken }: EffectProps<MatrixGridParams>) {
  const { position, xAxis, yAxis, items, stepMs, accent } = params;
  const entered = useEnter(playToken);
  const list = parseItems(items);
  const total = Math.max(1, list.length);
  const step = Math.max(100, stepMs);
  const raw = useProgress(Math.max(400, step * total), playToken);
  const t = unEase(raw);
  const on = (i: number) => easeOutExpo(clamp01(t * total - i));

  const [xL = "", xR = ""] = xAxis.split("|").map((s) => s.trim());
  const [yB = "", yT = ""] = yAxis.split("|").map((s) => s.trim());

  return (
    <div
      className={`hud xsa-mg hud-anchor hud-anchor--${position} ${entered ? "is-in" : ""}`}
      style={{ ["--hud-acc" as string]: ACCENT_VAR[accent], ...offsetVars(params) }}
    >
      <div className="xsa-mg-stage" style={{ width: W, height: H }}>
        <svg className="xsa-mg-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <rect className="xsa-mg-cell" x={PAD} y={PAD} width={IN_W / 2} height={IN_H / 2} />
          <rect className="xsa-mg-cell" x={PAD + IN_W / 2} y={PAD} width={IN_W / 2} height={IN_H / 2} />
          <rect className="xsa-mg-cell" x={PAD} y={PAD + IN_H / 2} width={IN_W / 2} height={IN_H / 2} />
          <rect
            className="xsa-mg-cell"
            x={PAD + IN_W / 2}
            y={PAD + IN_H / 2}
            width={IN_W / 2}
            height={IN_H / 2}
          />
          <line className="xsa-mg-axis" x1={W / 2} y1={PAD} x2={W / 2} y2={PAD + IN_H} />
          <line className="xsa-mg-axis" x1={PAD} y1={H / 2} x2={PAD + IN_W} y2={H / 2} />
        </svg>

        {xL && <div className="xsa-mg-axis-lb xsa-mg-axis-lb--xl">{xL}</div>}
        {xR && <div className="xsa-mg-axis-lb xsa-mg-axis-lb--xr">{xR}</div>}
        {yT && <div className="xsa-mg-axis-lb xsa-mg-axis-lb--yt">{yT}</div>}
        {yB && <div className="xsa-mg-axis-lb xsa-mg-axis-lb--yb">{yB}</div>}

        {list.map((it, i) => {
          const k = on(i);
          return (
            <div
              className="xsa-mg-item"
              key={i}
              style={{
                left: PAD + ((it.x + 1) / 2) * IN_W,
                top: PAD + (1 - (it.y + 1) / 2) * IN_H,
                opacity: k,
                transform: `translate(-50%, -50%) scale(${0.5 + 0.5 * k})`,
              }}
            >
              <span className="xsa-mg-dot" />
              <span className="xsa-mg-name">{it.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const matrixGridDef: EffectDef<MatrixGridParams> = {
  id: "matrix-grid",
  name: "MatrixGrid",
  description: "四象限矩阵 · 项目按坐标依次落位",
  tags: ["逐条落位"],
  selfPosition: true,
  defaults: {
    theme: "dark",
    position: "center",
    xAxis: "左轴名|右轴名",
    yAxis: "下轴名|上轴名",
    items: "项目甲 -0.6 0.5\n项目乙 0.4 0.7\n项目丙 -0.3 -0.5\n项目丁 0.6 -0.2",
    stepMs: 420,
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
    { key: "xAxis", label: "横轴「左轴名|右轴名」", type: "text" },
    { key: "yAxis", label: "纵轴「下轴名|上轴名」", type: "text" },
    {
      key: "items",
      label: "项目(一行一条「名称 x y」,x/y 取 -1~1 小数,最多 8 条)",
      type: "textarea",
      rows: 5,
    },
    {
      key: "stepMs",
      label: "逐个落位间隔",
      type: "range",
      min: 100,
      max: 1500,
      step: 50,
      unit: "ms",
    },
    { key: "accent", label: "强调色(项目点)", type: "select", options: ACCENT_OPTIONS },
    ...OFFSET_CONTROLS,
  ],
  Component: MatrixGrid,
};
