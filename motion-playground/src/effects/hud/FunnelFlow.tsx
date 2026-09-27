import type { EffectDef, EffectProps } from "../types";
import { useCountUp, useEnter } from "../useAnimation";
import {
  ACCENT_OPTIONS,
  ACCENT_VAR,
  OFFSET_CONTROLS,
  OFFSET_DEFAULTS,
  offsetVars,
  THEME_OPTIONS,
} from "./accent";

export interface FunnelFlowParams {
  theme: "dark" | "light";
  position: "left" | "center" | "right";
  /** 阶段,一行一级「阶段名|数值」,3–4 级,自上而下;后一级数值应小于前一级 */
  stages: string;
  /** 数值单位 */
  unit: string;
  accent: string;
  offsetX?: number;
  offsetY?: number;
}

interface Stage {
  name: string;
  value: number;
}

function parseStages(raw: string): Stage[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 4)
    .map((l) => {
      const [name = "", value = "0"] = l.split("|").map((s) => s.trim());
      return { name, value: Number(value) || 0 };
    });
}

/** 单级数值滚动:每级一个实例(钩子不能写在 map 里) */
function StageRow({
  name,
  value,
  unit,
  width,
  highlight,
  delayMs,
  playToken,
}: {
  name: string;
  value: number;
  unit: string;
  width: number;
  highlight: boolean;
  delayMs: number;
  playToken: number;
}) {
  const n = useCountUp(value, 1300, playToken);
  const shown = Math.round(n).toLocaleString("en-US");
  return (
    <div className={`xsa-ff-row ${highlight ? "xsa-ff-row--hi" : ""}`} style={{ width: `${width}%` }}>
      <div
        className={`xsa-ff-bar ${highlight ? "is-hi" : ""}`}
        style={{ transitionDelay: `${delayMs}ms` }}
      >
        <span className="xsa-ff-name">{name}</span>
      </div>
      <div className="xsa-ff-val">
        <span className="xsa-ff-num">{shown}</span>
        {unit && <span className="xsa-ff-unit">{unit}</span>}
      </div>
    </div>
  );
}

/**
 * 漏斗流转卡:自上而下逐级收窄的横条(居中),每级右侧数值滚动计数,
 * 级与级之间向下的小箭头,最后一级强调色高亮 —— 一层层筛到留下的那个数。
 */
function FunnelFlow({ params, playToken }: EffectProps<FunnelFlowParams>) {
  const { position, stages, unit, accent } = params;
  const entered = useEnter(playToken);
  const list = parseStages(stages);
  const n = list.length;
  // 最上最宽 100%,逐级收窄到 46%
  const widthOf = (i: number) => (n <= 1 ? 100 : 100 - (i * 54) / (n - 1));

  return (
    <div
      className={`hud xsa-ff hud-anchor hud-anchor--${position} ${entered ? "is-in" : ""}`}
      style={{ ["--hud-acc" as string]: ACCENT_VAR[accent], ...offsetVars(params) }}
    >
      <div className="xsa-ff-funnel">
        {list.map((s, i) => (
          <div className="xsa-ff-slot" key={i}>
            <StageRow
              name={s.name}
              value={s.value}
              unit={unit}
              width={widthOf(i)}
              highlight={i === n - 1}
              delayMs={i * 260}
              playToken={playToken}
            />
            {i < n - 1 && (
              <div className="xsa-ff-arrow" style={{ transitionDelay: `${i * 260 + 180}ms` }}>
                <i />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export const funnelFlowDef: EffectDef<FunnelFlowParams> = {
  id: "funnel-flow",
  name: "FunnelFlow",
  description: "漏斗流转 · 逐级收窄横条 + 数值滚动,末级高亮",
  tags: ["逐条落位", "滚动计数"],
  selfPosition: true,
  defaults: {
    theme: "dark",
    position: "center",
    stages: "入口阶段|1000\n筛选阶段|420\n成交阶段|96",
    unit: "个",
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
    {
      key: "stages",
      label: "阶段(一行一级「阶段名|数值」,3–4 级,自上而下)",
      type: "textarea",
      rows: 4,
    },
    { key: "unit", label: "数值单位", type: "text" },
    { key: "accent", label: "强调色(末级高亮)", type: "select", options: ACCENT_OPTIONS },
    ...OFFSET_CONTROLS,
  ],
  Component: FunnelFlow,
};
