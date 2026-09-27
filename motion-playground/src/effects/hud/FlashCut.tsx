import type { EffectDef, EffectProps } from "../types";
import { useEnter } from "../useAnimation";
import { ACCENT_OPTIONS, ACCENT_VAR, THEME_OPTIONS } from "./accent";

export interface FlashCutParams {
  theme: "dark" | "light";
  /** 闪光色:白 / 黑 / 强调色 */
  flash: "white" | "dark" | "accent";
  /** 闪光后半段弹出的短文字(可空) */
  text: string;
  accent: string;
}

/**
 * 闪切转场(全屏):整屏瞬间闪一下(白/黑/强调色),
 * 同一时刻中心一圈冲击环快速扩散并淡出,短文字在闪光后半段弹出。
 * 用在节奏点上的硬切。
 */
function FlashCut({ params, playToken }: EffectProps<FlashCutParams>) {
  const { flash, text, accent } = params;
  const entered = useEnter(playToken);

  return (
    <div
      className={`hud xsb-fc ${entered ? "is-in" : ""}`}
      data-flash={flash}
      style={{ ["--hud-acc" as string]: ACCENT_VAR[accent] }}
    >
      <div className="xsb-fc-flash" />
      <div className="xsb-fc-ring">
        <svg viewBox="0 0 2000 2000">
          <circle className="xsb-fc-r1" cx={1000} cy={1000} r={420} />
          <circle className="xsb-fc-r2" cx={1000} cy={1000} r={560} />
        </svg>
      </div>
      {text && <div className="xsb-fc-text">{text}</div>}
    </div>
  );
}

export const flashCutDef: EffectDef<FlashCutParams> = {
  id: "flash-cut",
  name: "FlashCut",
  description: "闪切转场 · 全屏闪光 + 中心冲击环扩散",
  tags: ["聚散飞行"],
  selfPosition: true,
  defaults: {
    theme: "dark",
    flash: "white",
    text: "一句短文字",
    accent: "blue",
  },
  controls: [
    { key: "theme", label: "底色(此卡独立生效)", type: "select", options: THEME_OPTIONS },
    {
      key: "flash",
      label: "闪光色",
      type: "select",
      options: [
        { label: "白光", value: "white" },
        { label: "黑场", value: "dark" },
        { label: "强调色", value: "accent" },
      ],
    },
    { key: "text", label: "短文字(可空)", type: "text" },
    { key: "accent", label: "强调色(冲击环)", type: "select", options: ACCENT_OPTIONS },
  ],
  Component: FlashCut,
};
