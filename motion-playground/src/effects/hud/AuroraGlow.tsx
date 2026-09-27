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

export interface AuroraGlowParams {
  theme: "dark" | "light";
  /** 主色相(色相 A) */
  hueA: string;
  /** 副色相(色相 B) */
  hueB: string;
  /** 光晕强度 */
  intensity: number;
  /** 漂移速度 */
  speed: number;
  accent: string;
  offsetX?: number;
  offsetY?: number;
}

/** 漂移动画的基准时长(秒),speed = 1 时生效;speed 越大漂得越快 */
const BASE_DRIFT = 18;

/**
 * 光晕氛围:全屏 2–3 团大半径柔光斑缓慢漂移/呼吸,叠在画面最底层做氛围。
 * 只用 radial-gradient + blur,不用 backdrop-filter(导出会丢)。
 */
function AuroraGlow({ params, playToken }: EffectProps<AuroraGlowParams>) {
  const { hueA, hueB, intensity, speed, accent } = params;
  const entered = useEnter(playToken);
  const k = BASE_DRIFT / Math.max(0.2, Math.min(2, Number(speed) || 1));
  const i = Math.max(0.1, Math.min(1, Number(intensity) || 0.55));

  return (
    <div
      className={`hud xsc-ag ${entered ? "is-in" : ""}`}
      style={{
        ["--hud-acc" as string]: ACCENT_VAR[accent],
        ["--xsc-ag-a" as string]: ACCENT_VAR[hueA],
        ["--xsc-ag-b" as string]: ACCENT_VAR[hueB],
        ["--xsc-ag-i" as string]: i,
        ...offsetVars(params),
      }}
    >
      <span className="xsc-ag-blob xsc-ag-blob--a" style={{ animationDuration: `${k}s` }} />
      <span className="xsc-ag-blob xsc-ag-blob--b" style={{ animationDuration: `${k * 1.25}s` }} />
      <span className="xsc-ag-blob xsc-ag-blob--c" style={{ animationDuration: `${k * 0.85}s` }} />
    </div>
  );
}

export const auroraGlowDef: EffectDef<AuroraGlowParams> = {
  id: "aurora-glow",
  name: "AuroraGlow",
  description: "光晕氛围 · 柔光团缓慢漂移,垫在画面最底层",
  tags: ["玻璃虚化", "聚散飞行"],
  selfPosition: true,
  defaults: {
    theme: "dark",
    hueA: "blue",
    hueB: "orange",
    intensity: 0.55,
    speed: 1,
    accent: "blue",
    ...OFFSET_DEFAULTS,
  },
  controls: [
    { key: "theme", label: "底色(此卡独立生效)", type: "select", options: THEME_OPTIONS },
    { key: "hueA", label: "主色相", type: "select", options: ACCENT_OPTIONS },
    { key: "hueB", label: "副色相", type: "select", options: ACCENT_OPTIONS },
    { key: "intensity", label: "光晕强度", type: "range", min: 0.1, max: 1, step: 0.05 },
    { key: "speed", label: "漂移速度", type: "range", min: 0.2, max: 2, step: 0.1, unit: "×" },
    { key: "accent", label: "强调色(第三团光)", type: "select", options: ACCENT_OPTIONS },
    ...OFFSET_CONTROLS,
  ],
  Component: AuroraGlow,
};
