import type { EffectDef, EffectProps } from "../types";
import { useEnter } from "../useAnimation";
import { ACCENT_OPTIONS, ACCENT_VAR, THEME_OPTIONS } from "./accent";

export interface SplitWipeParams {
  theme: "dark" | "light";
  /** 中缝露出的大字(可空) */
  text: string;
  /** 大字上方的小标签(可空) */
  label: string;
  accent: string;
}

/**
 * 分屏划开(全屏):两块色板(强调色 + 深色)从中缝向左右两侧划开,
 * 中缝先亮一条细线再展开,展开后中间露出大字与标签。
 * 整体是一次「划开 → 露出 → 继续划走」的转场。
 */
function SplitWipe({ params, playToken }: EffectProps<SplitWipeParams>) {
  const { text, label, accent } = params;
  const entered = useEnter(playToken);

  return (
    <div
      className={`hud xsb-sw ${entered ? "is-in" : ""}`}
      style={{ ["--hud-acc" as string]: ACCENT_VAR[accent] }}
    >
      {/* 底层:划开后露出的画面(主题底色)+ 中缝文字 */}
      <div className="xsb-sw-base" />
      <div className="xsb-sw-mid">
        {label && <div className="xsb-sw-label">{label}</div>}
        {text && <div className="xsb-sw-text">{text}</div>}
      </div>
      {/* 两块色板压在上面,is-in 后向两侧划走 */}
      <div className="xsb-sw-panel a" />
      <div className="xsb-sw-panel b" />
      <div className="xsb-sw-seam" />
    </div>
  );
}

export const splitWipeDef: EffectDef<SplitWipeParams> = {
  id: "split-wipe",
  name: "SplitWipe",
  description: "分屏划开 · 两块色板从中缝向两侧划开,露出大字",
  tags: ["聚散飞行"],
  selfPosition: true,
  defaults: {
    theme: "dark",
    text: "划开露出的大字写在这",
    label: "SECTION LABEL",
    accent: "blue",
  },
  controls: [
    { key: "theme", label: "底色(此卡独立生效)", type: "select", options: THEME_OPTIONS },
    { key: "text", label: "中缝大字(可空)", type: "text" },
    { key: "label", label: "小标签(可空)", type: "text" },
    { key: "accent", label: "强调色(左板/细线)", type: "select", options: ACCENT_OPTIONS },
  ],
  Component: SplitWipe,
};
