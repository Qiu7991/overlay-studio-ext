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

export interface ImpactBurstParams {
  theme: "dark" | "light";
  /** 爆点大字 */
  text: string;
  /** 小字补充(可空) */
  sub: string;
  /** 放射线条数 8–32 */
  rays: number;
  accent: string;
  offsetX?: number;
  offsetY?: number;
}

const CX = 500;
const CY = 500;

/**
 * 情绪爆点:中心一圈放射细线向外爆发(长度伸展、透明度随进度衰减),
 * 大字在爆发峰值处弹入(轻微过冲后回正),小字随后淡入;
 * 强调色在爆发瞬间吃满整屏。射线几何 / 文字弹入全部由进度算出,导出逐帧一致。
 */
function ImpactBurst({ params, playToken }: EffectProps<ImpactBurstParams>) {
  const { text, sub, rays, accent } = params;
  const entered = useEnter(playToken);
  const p = useProgress(1400, playToken);
  const n = Math.max(8, Math.min(32, Math.round(rays) || 24));

  // 大字:爆发峰值处弹入,轻微过冲后回正
  const tp = Math.max(0, Math.min(1, (p - 0.16) / 0.5));
  const pop =
    tp <= 0
      ? 0.62
      : tp < 0.75
        ? 0.62 + (1.12 - 0.62) * (tp / 0.75)
        : 1.12 - 0.12 * ((tp - 0.75) / 0.25);
  const textOp = Math.min(1, tp * 3);
  // 小字随后淡入
  const sp = Math.max(0, Math.min(1, (p - 0.62) / 0.33));
  // 强调色吃满屏:爆发瞬间亮起,随进度退走
  const washOp = Math.min(1, p * 5) * (1 - p) * 0.85;
  // 射线:爆发包络 —— 快速伸展到峰值,随后长度与透明度一起衰减
  const rayOp = Math.min(1, p * 8) * (1 - p * 0.85);
  const rayEnv = p < 0.3 ? p / 0.3 : 1 - ((p - 0.3) / 0.7) * 0.6;

  return (
    <div
      className={`hud xsb-ib hud-anchor hud-anchor--center ${entered ? "is-in" : ""}`}
      style={{ ["--hud-acc" as string]: ACCENT_VAR[accent], ...offsetVars(params) }}
    >
      <div className="xsb-ib-wash" style={{ opacity: washOp }} />
      <div className="xsb-ib-inner">
        <svg className="xsb-ib-rays" viewBox="0 0 1000 1000">
          {Array.from({ length: n }, (_, i) => {
            const a = (((i + 0.5) / n) * 360 * Math.PI) / 180;
            const cos = Math.cos(a);
            const sin = Math.sin(a);
            // 长短交错(确定性伪随机,两次导出完全一致)
            const lenK = 0.72 + (((i * 37) % 10) / 10) * 0.5;
            const r0 = 92 + p * 46;
            const r1 = r0 + 430 * rayEnv * lenK;
            return (
              <line
                key={i}
                x1={CX + r0 * cos}
                y1={CY + r0 * sin}
                x2={CX + r1 * cos}
                y2={CY + r1 * sin}
                opacity={rayOp}
              />
            );
          })}
        </svg>
        <div className="xsb-ib-mid">
          <div className="xsb-ib-text" style={{ opacity: textOp, transform: `scale(${pop})` }}>
            {text}
          </div>
          {sub && (
            <div
              className="xsb-ib-sub"
              style={{ opacity: sp, transform: `translateY(${(1 - sp) * 14}px)` }}
            >
              {sub}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const impactBurstDef: EffectDef<ImpactBurstParams> = {
  id: "impact-burst",
  name: "ImpactBurst",
  description: "情绪爆点 · 放射线爆发 + 大字弹入,强调色吃满屏",
  tags: ["聚散飞行", "生长描画"],
  selfPosition: true,
  defaults: {
    theme: "dark",
    text: "爆点大字写在这",
    sub: "小字补充写在这",
    rays: 24,
    accent: "orange",
    ...OFFSET_DEFAULTS,
  },
  controls: [
    { key: "theme", label: "底色(此卡独立生效)", type: "select", options: THEME_OPTIONS },
    { key: "text", label: "爆点大字", type: "text" },
    { key: "sub", label: "小字(可空)", type: "text" },
    { key: "rays", label: "放射线条数", type: "range", min: 8, max: 32, step: 1, unit: "条" },
    { key: "accent", label: "强调色(射线/满屏色)", type: "select", options: ACCENT_OPTIONS },
    ...OFFSET_CONTROLS,
  ],
  Component: ImpactBurst,
};
