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

export interface MindMapParams {
  theme: "dark" | "light";
  position: "left" | "center" | "right";
  /** 中心词 */
  center: string;
  /** 左侧分支,一行一条「主支|子项1/子项2」,最多 3 条 */
  left: string;
  /** 右侧分支,格式同左侧 */
  right: string;
  /** 每支画出的间隔(卡点用) */
  stepMs: number;
  accent: string;
  offsetX?: number;
  offsetY?: number;
}

interface Branch {
  name: string;
  subs: string[];
}

interface Entry {
  side: "left" | "right";
  i: number;
  idx: number;
}

function parseSide(raw: string): Branch[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 3)
    .map((l) => {
      const [name = "", subs = ""] = l.split("|").map((s) => s.trim());
      return { name, subs: subs.split("/").map((s) => s.trim()).filter(Boolean).slice(0, 4) };
    });
}

/** useProgress 已切缓动;反解回线性时间 0→1,好按 stepMs 严格切「每支」的窗口 */
function unEase(p: number): number {
  return p >= 1 ? 1 : Math.min(1, -Math.log2(1 - p) / 10);
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const W = 1180;
const H = 620;
const CX = W / 2;
const CY = H / 2;
const NODE_W = 340;
const GAPX = 200;
const NODE_LEFT = CX - GAPX - NODE_W;
const NODE_RIGHT = CX + GAPX;

/**
 * 中心胶囊的半宽估算(CJK 34px / 拉丁 19px + 左右内边距 92px,封顶 180)——
 * 曲线端点跟着这个值走,长中心词时线不会缩进胶囊里面。
 */
function approxHalfW(text: string): number {
  let w = 0;
  for (const ch of text) w += (ch.codePointAt(0) ?? 0) > 0x2e80 ? 34 : 19;
  return Math.min(180, Math.max(78, (w + 92) / 2));
}

/**
 * 思维导图卡:中心胶囊向左右两侧发散分支,曲线连回中心,
 * 主支下挂小字子项;分支依次画出、子项跟着淡入 —— 一个中心词的全部外延。
 */
function MindMap({ params, playToken }: EffectProps<MindMapParams>) {
  const { position, center, left, right, stepMs, accent } = params;
  const entered = useEnter(playToken);
  const leftB = parseSide(left);
  const rightB = parseSide(right);

  // 左右交替依次落位(先左后右),idx 决定该支的窗口与延迟
  const entries: Entry[] = [];
  let idx = 0;
  const maxN = Math.max(leftB.length, rightB.length);
  for (let k = 0; k < maxN; k++) {
    if (leftB[k]) {
      entries.push({ side: "left", i: k, idx });
      idx += 1;
    }
    if (rightB[k]) {
      entries.push({ side: "right", i: k, idx });
      idx += 1;
    }
  }
  const total = entries.length;
  const step = Math.max(100, stepMs);
  const raw = useProgress(Math.max(400, step * total), playToken);
  const t = unEase(raw);
  const seg = (e: Entry) => easeOutExpo(clamp01(t * total - e.idx));
  // 曲线在胶囊边缘收口:端点跟随中心词宽度,控制点取中点 → 永远不会打圈
  const halfW = approxHalfW(center);
  const xEndL = CX - halfW - 6;
  const xEndR = CX + halfW + 6;

  return (
    <div
      className={`hud xsa-mm hud-anchor hud-anchor--${position} ${entered ? "is-in" : ""}`}
      style={{ ["--hud-acc" as string]: ACCENT_VAR[accent], ...offsetVars(params) }}
    >
      <div className="xsa-mm-stage" style={{ width: W, height: H }}>
        <svg className="xsa-mm-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {entries.map((e) => {
            const list = e.side === "left" ? leftB : rightB;
            const y0 = (H * (e.i + 0.5)) / list.length;
            // 标准 S 曲线:两段控制点取同一中点 → x 单调,长中心词也不会绕圈
            const x0 = e.side === "left" ? NODE_LEFT + NODE_W : NODE_RIGHT;
            const x1 = e.side === "left" ? xEndL : xEndR;
            const midX = ((x0 + x1) / 2).toFixed(1);
            const d = `M ${x0} ${y0.toFixed(1)} C ${midX} ${y0.toFixed(1)}, ${midX} ${CY}, ${x1} ${CY}`;
            return (
              <path
                key={`${e.side}-${e.i}`}
                className="xsa-mm-path"
                d={d}
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - seg(e)}
              />
            );
          })}
        </svg>

        <div className="xsa-mm-pill">{center}</div>

        {entries.map((e) => {
          const list = e.side === "left" ? leftB : rightB;
          const b = list[e.i];
          const top = (H * (e.i + 0.5)) / list.length;
          return (
            <div
              className={`xsa-mm-node xsa-mm-node--${e.side}`}
              key={`${e.side}-${e.i}`}
              style={{
                left: e.side === "left" ? NODE_LEFT : NODE_RIGHT,
                top,
                transitionDelay: `${e.idx * step + 60}ms`,
              }}
            >
              <div className="xsa-mm-name">{b.name}</div>
              {b.subs.length > 0 && (
                <div className="xsa-mm-subs">
                  {b.subs.map((s, j) => (
                    <div
                      className="xsa-mm-sub"
                      key={j}
                      style={{ transitionDelay: `${e.idx * step + 240 + j * 80}ms` }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const mindMapDef: EffectDef<MindMapParams> = {
  id: "mind-map",
  name: "MindMap",
  description: "思维导图 · 中心向两侧发散分支,曲线依次画出",
  tags: ["生长描画", "逐条落位"],
  selfPosition: true,
  defaults: {
    theme: "dark",
    position: "center",
    center: "中心词",
    left: "左侧主支|子项一/子项二\n左侧次支|子项一",
    right: "右侧主支|子项一/子项二\n右侧次支|子项一",
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
    { key: "center", label: "中心词", type: "text" },
    {
      key: "left",
      label: "左侧分支(一行一条「主支|子项1/子项2」,最多 3 条)",
      type: "textarea",
      rows: 3,
    },
    {
      key: "right",
      label: "右侧分支(格式同左侧,最多 3 条)",
      type: "textarea",
      rows: 3,
    },
    {
      key: "stepMs",
      label: "每支画出间隔(卡点用)",
      type: "range",
      min: 100,
      max: 1500,
      step: 50,
      unit: "ms",
    },
    { key: "accent", label: "强调色(曲线/圆点)", type: "select", options: ACCENT_OPTIONS },
    ...OFFSET_CONTROLS,
  ],
  Component: MindMap,
};
