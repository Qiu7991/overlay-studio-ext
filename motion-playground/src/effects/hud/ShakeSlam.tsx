import type { EffectDef, EffectProps } from "../types";
import { useEnter } from "../useAnimation";
import { ACCENT_OPTIONS, ACCENT_VAR, THEME_OPTIONS } from "./accent";

export interface ShakeSlamParams {
  theme: "dark" | "light";
  /** 砸下的大字 */
  text: string;
  /** 小字(可空,落定后淡入) */
  sub: string;
  accent: string;
}

/**
 * 重击落字:大字从画面上方快速砸下,落定瞬间整卡抖一下(一次性)+
 * 底部冲击横线弹出,随后小字淡入。
 * 适合「结论落地 / 关键一击」类语义。
 */
function ShakeSlam({ params, playToken }: EffectProps<ShakeSlamParams>) {
  const { text, sub, accent } = params;
  const entered = useEnter(playToken);

  return (
    <div
      className={`hud xsc-ss ${entered ? "is-in" : ""}`}
      style={{ ["--hud-acc" as string]: ACCENT_VAR[accent] }}
    >
      <div className="xsc-ss-flash" />
      <div className="xsc-ss-title">{text}</div>
      <div className="xsc-ss-line" />
      {sub && <div className="xsc-ss-sub">{sub}</div>}
    </div>
  );
}

export const shakeSlamDef: EffectDef<ShakeSlamParams> = {
  id: "shake-slam",
  name: "ShakeSlam",
  description: "重击落字 · 大字砸下 + 落定整屏轻抖",
  tags: ["逐条落位"],
  selfPosition: true,
  defaults: {
    theme: "dark",
    text: "重点来了",
    sub: "小字补充说明写在这",
    accent: "blue",
  },
  controls: [
    { key: "theme", label: "底色(此卡独立生效)", type: "select", options: THEME_OPTIONS },
    { key: "text", label: "砸下的大字", type: "text" },
    { key: "sub", label: "小字(可空)", type: "text" },
    { key: "accent", label: "强调色(冲击线/光)", type: "select", options: ACCENT_OPTIONS },
  ],
  Component: ShakeSlam,
};
