import type { EffectDef, EffectProps } from "../types";
import { useEnter } from "../useAnimation";
import { ACCENT_OPTIONS, ACCENT_VAR, THEME_OPTIONS } from "./accent";

export interface WarpTitleParams {
  theme: "dark" | "light";
  /** 章节编号,如 01 / 04 */
  index: string;
  /** 章节大标题 */
  title: string;
  /** 下方一行副标 */
  subtitle: string;
  accent: string;
}

/**
 * 章节转场(全屏):中央巨大编号 + 大标题 + 一行副标,
 * 一条强调色光带从左到右横扫整屏,扫过时标题轻微放大推进。
 * 用在章节与章节之间的硬转场,一般 1–2 秒。
 */
function WarpTitle({ params, playToken }: EffectProps<WarpTitleParams>) {
  const { index, title, subtitle, accent } = params;
  const entered = useEnter(playToken);

  return (
    <div
      className={`hud xsb-warp ${entered ? "is-in" : ""}`}
      style={{ ["--hud-acc" as string]: ACCENT_VAR[accent] }}
    >
      <div className="xsb-warp-bg" />
      <div className="xsb-warp-wash" />
      {/* 光带:满高的光柱,is-in 后从左扫到右 */}
      <div className="xsb-warp-band">
        <i className="xsb-warp-glow" />
        <i className="xsb-warp-core" />
      </div>
      <div className="xsb-warp-mid">
        {index && <div className="xsb-warp-idx">{index}</div>}
        {title && <div className="xsb-warp-title">{title}</div>}
        {subtitle && <div className="xsb-warp-sub">{subtitle}</div>}
      </div>
    </div>
  );
}

export const warpTitleDef: EffectDef<WarpTitleParams> = {
  id: "warp-title",
  name: "WarpTitle",
  description: "章节转场 · 满屏编号 + 大标题,光带横扫过场",
  tags: ["扫过点亮"],
  selfPosition: true,
  defaults: {
    theme: "dark",
    index: "01 / 04",
    title: "章节标题写在这",
    subtitle: "副标题一行写在这",
    accent: "blue",
  },
  controls: [
    { key: "theme", label: "底色(此卡独立生效)", type: "select", options: THEME_OPTIONS },
    { key: "index", label: "章节编号(如 01 / 04)", type: "text" },
    { key: "title", label: "大标题", type: "text" },
    { key: "subtitle", label: "副标(一行)", type: "text" },
    { key: "accent", label: "强调色(光带)", type: "select", options: ACCENT_OPTIONS },
  ],
  Component: WarpTitle,
};
