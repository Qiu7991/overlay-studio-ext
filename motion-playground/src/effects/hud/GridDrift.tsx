import type { EffectDef, EffectProps } from "../types";
import { useEnter } from "../useAnimation";
import {
  ACCENT_OPTIONS,
  ACCENT_VAR,
  OFFSET_CONTROLS,
  OFFSET_DEFAULTS,
  offsetVars,
  THEME_OPTIONS,
} from "./accent";

export interface GridDriftParams {
  theme: "dark" | "light";
  /** 网格密度(格子边长) */
  density: number;
  /** 漂移速度 */
  speed: number;
  /** 远处淡出 */
  fade: number;
  accent: string;
  offsetX?: number;
  offsetY?: number;
}

/** 一次网格循环位移的基准时长(秒),speed = 1 时生效;speed 越大周期越短 */
const BASE_CYCLE = 7;

/**
 * 网格漂移:全屏透视网格缓缓向观众方向移动,远端按 fade 淡出。
 * 用于科技感氛围底,通常拉满整段时长、放在最底层。
 */
function GridDrift({ params, playToken }: EffectProps<GridDriftParams>) {
  const { density, speed, fade, accent } = params;
  const entered = useEnter(playToken);
  const cell = Math.max(20, Math.min(120, Number(density) || 64));
  const sp = Math.max(0.2, Math.min(3, Number(speed) || 1));
  const fd = Math.max(0, Math.min(1, Number(fade) || 0));
  // 远端淡出:0 = 全程实线,1 = 从地平线起一路爬升到全实
  const fadeStop = `${Math.round(fd * 100)}%`;

  return (
    <div
      className={`hud xsc-gd ${entered ? "is-in" : ""}`}
      style={{
        ["--hud-acc" as string]: ACCENT_VAR[accent],
        ["--xsc-gd-cell" as string]: `${cell}px`,
        ["--xsc-gd-fade-stop" as string]: fadeStop,
        ...offsetVars(params),
      }}
    >
      <div className="xsc-gd-plane">
        {/* 位移周期 = 基准 / speed:每周期恰好平移一格,循环无缝 */}
        <div className="xsc-gd-tiles" style={{ animationDuration: `${BASE_CYCLE / sp}s` }} />
      </div>
      <div className="xsc-gd-horizon" />
    </div>
  );
}

export const gridDriftDef: EffectDef<GridDriftParams> = {
  id: "grid-drift",
  name: "GridDrift",
  description: "网格漂移 · 透视网格缓缓前移,科技感氛围底",
  tags: ["生长描画"],
  selfPosition: true,
  defaults: {
    theme: "dark",
    density: 64,
    speed: 1,
    fade: 0.7,
    accent: "blue",
    ...OFFSET_DEFAULTS,
  },
  controls: [
    { key: "theme", label: "底色(此卡独立生效)", type: "select", options: THEME_OPTIONS },
    { key: "density", label: "网格密度", type: "range", min: 20, max: 120, step: 2, unit: "px" },
    { key: "speed", label: "漂移速度", type: "range", min: 0.2, max: 3, step: 0.1, unit: "×" },
    { key: "fade", label: "远处淡出", type: "range", min: 0, max: 1, step: 0.05 },
    { key: "accent", label: "强调色(网格线)", type: "select", options: ACCENT_OPTIONS },
    ...OFFSET_CONTROLS,
  ],
  Component: GridDrift,
};
