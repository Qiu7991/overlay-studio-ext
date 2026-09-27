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

export interface PulseRingParams {
  theme: "dark" | "light";
  /** 中心文字(可空) */
  text: string;
  /** 中心数字(可空) */
  value: number;
  /** 数字单位 */
  unit: string;
  /** 环数 */
  rings: number;
  accent: string;
  offsetX?: number;
  offsetY?: number;
}

/** 单环从中心扩散到最大并淡出的时长(秒),与 CSS 关键帧 xsc-pr-pulse 一致 */
const RING_CYCLE = 3.2;

/**
 * 脉冲圆环:多重圆环从中心依次向外扩散并淡出(持续循环),
 * 圆心可选滚动计数的数字 + 单位 + 一行说明。
 * 适合「持续影响 / 传播 / 扩散」类语义。
 */
function PulseRing({ params, playToken }: EffectProps<PulseRingParams>) {
  const { text, value, unit, rings, accent } = params;
  const entered = useEnter(playToken);
  const target = Number(value) || 0;
  // 数字滚动走 useCountUp:吃倍速、导出虚拟时间下逐帧准确
  const n = useCountUp(target, 1500, playToken);
  const count = Math.max(2, Math.min(6, Math.round(Number(rings)) || 3));
  const decimals = Number.isInteger(target) ? 0 : 1;
  const shown = n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <div
      className={`hud xsc-pr hud-anchor hud-anchor--center ${entered ? "is-in" : ""}`}
      style={{ ["--hud-acc" as string]: ACCENT_VAR[accent], ...offsetVars(params) }}
    >
      <div className="xsc-pr-stage">
        {/* 环数 = 同尺寸圆环的份数;负延迟把相位均匀错开,同时向外扩散 */}
        {Array.from({ length: count }, (_, i) => (
          <span
            className="xsc-pr-ring"
            key={i}
            style={{ animationDelay: `${-(i * RING_CYCLE) / count}s` }}
          />
        ))}
        <span className="xsc-pr-glow" />
        <div className="xsc-pr-core">
          {target > 0 && (
            <div className="xsc-pr-num">
              {shown}
              {unit && <em className="xsc-pr-unit">{unit}</em>}
            </div>
          )}
          {text && <div className="xsc-pr-text">{text}</div>}
        </div>
      </div>
    </div>
  );
}

export const pulseRingDef: EffectDef<PulseRingParams> = {
  id: "pulse-ring",
  name: "PulseRing",
  description: "脉冲圆环 · 多重圆环向外扩散 + 中心滚动计数",
  tags: ["聚散飞行", "滚动计数"],
  selfPosition: true,
  defaults: {
    theme: "dark",
    text: "正在扩散的影响",
    value: 128,
    unit: "次",
    rings: 3,
    accent: "blue",
    ...OFFSET_DEFAULTS,
  },
  controls: [
    { key: "theme", label: "底色(此卡独立生效)", type: "select", options: THEME_OPTIONS },
    { key: "text", label: "中心文字(可空)", type: "text" },
    { key: "value", label: "中心数字(可空,可带小数)", type: "text" },
    { key: "unit", label: "数字单位", type: "text" },
    { key: "rings", label: "环数", type: "range", min: 2, max: 6, step: 1 },
    { key: "accent", label: "强调色(圆环/柔光)", type: "select", options: ACCENT_OPTIONS },
    ...OFFSET_CONTROLS,
  ],
  Component: PulseRing,
};
