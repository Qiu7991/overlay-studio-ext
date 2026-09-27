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

export interface GrainBedParams {
  theme: "dark" | "light";
  /** 颗粒强度 */
  opacity: number;
  /** 暗角强度 */
  vignette: number;
  accent: string;
  offsetX?: number;
  offsetY?: number;
}

/**
 * 颗粒底噪:全屏最底层,纯 CSS 多层细颗粒平铺 + 暗角,
 * 颗粒缓慢呼吸/位移。给整段画面加质感,通常拉满整段时长、放在最底层。
 */
function GrainBed({ params, playToken }: EffectProps<GrainBedParams>) {
  const { opacity, vignette, accent } = params;
  const entered = useEnter(playToken);
  const grain = Math.max(0.02, Math.min(0.3, Number(opacity) || 0.12));
  const vig = Math.max(0, Math.min(0.8, Number(vignette) || 0));

  return (
    <div
      className={`hud xsc-gb ${entered ? "is-in" : ""}`}
      style={{
        ["--hud-acc" as string]: ACCENT_VAR[accent],
        ["--xsc-gb-op" as string]: grain,
        ["--xsc-gb-vig" as string]: vig,
        ...offsetVars(params),
      }}
    >
      <div className="xsc-gb-breathe">
        <div className="xsc-gb-grain" />
      </div>
      <div className="xsc-gb-vig" />
    </div>
  );
}

export const grainBedDef: EffectDef<GrainBedParams> = {
  id: "grain-bed",
  name: "GrainBed",
  description: "颗粒底噪 · 全屏细颗粒 + 暗角,给整段画面加质感",
  tags: ["玻璃虚化"],
  selfPosition: true,
  defaults: {
    theme: "dark",
    opacity: 0.12,
    vignette: 0.4,
    accent: "blue",
    ...OFFSET_DEFAULTS,
  },
  controls: [
    { key: "theme", label: "底色(此卡独立生效)", type: "select", options: THEME_OPTIONS },
    { key: "opacity", label: "颗粒强度", type: "range", min: 0.02, max: 0.3, step: 0.01 },
    { key: "vignette", label: "暗角强度", type: "range", min: 0, max: 0.8, step: 0.02 },
    { key: "accent", label: "强调色(顶部氛围光)", type: "select", options: ACCENT_OPTIONS },
    ...OFFSET_CONTROLS,
  ],
  Component: GrainBed,
};
