/**
 * 画布尺寸的唯一源头。
 *
 * 两套画幅:
 *   "16:9" 横屏(默认)—— 1920×1080
 *   "9:16" 竖屏 —— 1080×1920(抖音/视频号/小红书竖版)
 *
 * 画幅写在编排里(`OverlayDoc.aspect`),编辑台、导出页、导出脚本三处都从这里取值,
 * 不允许各自写死尺寸 —— 以前三处各写一份,加画幅时最容易漏掉导出脚本那一份。
 */
export type Aspect = "16:9" | "9:16";

export interface StageSize {
  w: number;
  h: number;
  /** 画幅的短边/长边,给版式判断用(竖屏下左右锚点要重新映射) */
  portrait: boolean;
  label: string;
}

export const STAGES: Record<Aspect, StageSize> = {
  "16:9": { w: 1920, h: 1080, portrait: false, label: "横屏 16:9" },
  "9:16": { w: 1080, h: 1920, portrait: true, label: "竖屏 9:16" },
};

/** 兼容旧引用:默认画幅 = 横屏 */
export const STAGE = { w: STAGES["16:9"].w, h: STAGES["16:9"].h };

export function stageOf(aspect?: string | null): StageSize {
  return aspect === "9:16" ? STAGES["9:16"] : STAGES["16:9"];
}

/** 规范化画幅取值(认不出的一律回横屏) */
export function normalizeAspect(v: unknown): Aspect {
  return v === "9:16" ? "9:16" : "16:9";
}
