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

export interface LayeredStackParams {
  theme: "dark" | "light";
  position: "left" | "center" | "right";
  /** 分层,一行一层「层名|说明」,3–5 层;第一行=最顶层(最窄),最后一行=最底层(最宽) */
  layers: string;
  /** 每层升起的间隔 */
  stepMs: number;
  accent: string;
  offsetX?: number;
  offsetY?: number;
}

interface Layer {
  name: string;
  sub: string;
}

function parseLayers(raw: string): Layer[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 5)
    .map((l) => {
      const [name = "", sub = ""] = l.split("|").map((s) => s.trim());
      return { name, sub };
    });
}

/**
 * 分层堆叠卡:最底层最宽、越往上越窄,自下而上逐层升起落位,
 * 每层左侧一条强调色竖线 —— 把「一层压一层」的结构一次立起来。
 */
function LayeredStack({ params, playToken }: EffectProps<LayeredStackParams>) {
  const { position, layers, stepMs, accent } = params;
  const entered = useEnter(playToken);
  const list = parseLayers(layers);
  const n = list.length;
  const step = Math.max(0, stepMs);
  // 第一行 = 最顶层(最窄),最后一行 = 最底层(最宽)
  const widthOf = (i: number) => (n <= 1 ? 100 : 58 + (i * 42) / (n - 1));
  // 自下而上:最后一行(底层)先升起,越往上越晚
  const delayOf = (i: number) => (n - 1 - i) * step;

  return (
    <div
      className={`hud xsa-ls hud-anchor hud-anchor--${position} ${entered ? "is-in" : ""}`}
      style={{ ["--hud-acc" as string]: ACCENT_VAR[accent], ...offsetVars(params) }}
    >
      <div className="xsa-ls-stack">
        {list.map((l, i) => (
          <div
            className="xsa-ls-row"
            key={i}
            style={{ width: `${widthOf(i)}%`, transitionDelay: `${delayOf(i)}ms` }}
          >
            <i className="xsa-ls-mark" style={{ transitionDelay: `${delayOf(i) + 130}ms` }} />
            <div className="xsa-ls-name">{l.name}</div>
            {l.sub && <div className="xsa-ls-sub">{l.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

export const layeredStackDef: EffectDef<LayeredStackParams> = {
  id: "layered-stack",
  name: "LayeredStack",
  description: "分层堆叠 · 3–5 层自下而上堆起,越往上越窄",
  tags: ["堆叠累积", "逐条落位"],
  selfPosition: true,
  defaults: {
    theme: "dark",
    position: "center",
    layers: "顶层|收口成塔尖\n中层|逐级收窄\n底层|最宽,做地基",
    stepMs: 420,
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
      key: "layers",
      label: "分层(一行一层「层名|说明」,3–5 层;第一行=最顶层,最后一行=最底层)",
      type: "textarea",
      rows: 5,
    },
    {
      key: "stepMs",
      label: "逐层升起间隔",
      type: "range",
      min: 0,
      max: 2000,
      step: 50,
      unit: "ms",
    },
    { key: "accent", label: "强调色(层侧竖线)", type: "select", options: ACCENT_OPTIONS },
    ...OFFSET_CONTROLS,
  ],
  Component: LayeredStack,
};
