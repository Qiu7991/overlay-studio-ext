/**
 * 风格档案(风格复用)· Pro 能力。
 *
 * 一期视频调好的「长什么样」——主题、强调色、字体、文字色、画幅、动效倍速、
 * 卡片缩放、光晕——存成一个档案;下一期一键套上,不用从零再调一遍。
 *
 * 设计取舍:
 *  - 档案只存「视觉层」,不存内容(卡片/文案/时间)也不存口播视频 ——
 *    跨期复用的是风格,不是这一期的稿子。
 *  - 档案是纯 JSON,存在浏览器 localStorage(`overlayStudioStyles`),
 *    也能导出成 .json 文件、从文件导入,便于备份与在两台机器之间搬。
 *  - 套用时**不改**已有卡片的文案类参数,只改视觉类参数(强调色/主题/缩放/倍速),
 *    并且可以撤销(调用方负责 pushHistory)。
 */
import type { OverlayDoc } from "./overlay/types";
import { normalizeAspect, type Aspect } from "./stage";

export interface StyleProfile {
  /** 档案名(用户自己起,如「我的口播·钴蓝暗底」) */
  name: string;
  /** 建立时间(ISO) */
  savedAt: string;
  /** 画幅 */
  aspect: Aspect;
  /** 全局底色 */
  theme: "dark" | "light";
  /** 全局字体(src/assets/fonts 里的文件名,空 = 默认) */
  font?: string;
  /** 全局文字色(空 = 主题默认) */
  inkColor?: string;
  /** 文字光晕 */
  glow?: boolean;
  /** 强调色(blue / alert / orange):套用时改写每张卡的 accent */
  accent?: string;
  /** 动效整体缩放 */
  fxScale?: number;
  /** 动画速度倍率 */
  animSpeed?: number;
  /** 记一笔这期用了什么卡片库(只作说明,不参与套用) */
  note?: string;
}

const KEY = "overlayStudioStyles";

export function loadStyles(): StyleProfile[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.filter((s) => s && typeof s.name === "string");
  } catch {
    return [];
  }
}

export function saveStyles(list: StyleProfile[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* 隐私模式:本次会话内仍可用,只是刷新后没了 */
  }
}

export function upsertStyle(list: StyleProfile[], p: StyleProfile): StyleProfile[] {
  const next = list.filter((s) => s.name !== p.name);
  next.unshift(p);
  return next.slice(0, 40);
}

/** 从当前编排 + 编辑台状态抽一份档案 */
export function profileFromDoc(
  name: string,
  doc: OverlayDoc | null,
  extra: { accent?: string; fxScale?: number; animSpeed?: number },
): StyleProfile {
  return {
    name,
    savedAt: new Date().toISOString(),
    aspect: normalizeAspect(doc?.aspect),
    theme: doc?.theme === "light" ? "light" : "dark",
    font: doc?.font,
    inkColor: doc?.inkColor,
    glow: !!doc?.glow,
    accent: extra.accent,
    fxScale: extra.fxScale,
    animSpeed: extra.animSpeed,
  };
}

/** 从任意 JSON 里认出一份档案(导入用);认不出返回 null */
export function parseProfile(raw: unknown): StyleProfile | null {
  try {
    const o = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!o || typeof o !== "object") return null;
    const r = o as Record<string, unknown>;
    if (typeof r.name !== "string" || !r.name.trim()) return null;
    return {
      name: r.name.trim().slice(0, 40),
      savedAt: typeof r.savedAt === "string" ? r.savedAt : new Date().toISOString(),
      aspect: normalizeAspect(r.aspect),
      theme: r.theme === "light" ? "light" : "dark",
      font: typeof r.font === "string" && r.font ? r.font : undefined,
      inkColor: typeof r.inkColor === "string" && /^#[0-9a-fA-F]{3,8}$/.test(r.inkColor) ? r.inkColor : undefined,
      glow: r.glow === true,
      accent: typeof r.accent === "string" && r.accent ? r.accent : undefined,
      fxScale: typeof r.fxScale === "number" ? r.fxScale : undefined,
      animSpeed: typeof r.animSpeed === "number" ? r.animSpeed : undefined,
      note: typeof r.note === "string" ? r.note : undefined,
    };
  } catch {
    return null;
  }
}

/** 套用:把档案的视觉取值写回编排(只动视觉参数,不动文案/时间/卡片类型) */
export function applyProfile(doc: OverlayDoc, p: StyleProfile): OverlayDoc {
  return {
    ...doc,
    aspect: p.aspect,
    theme: p.theme,
    font: p.font,
    inkColor: p.inkColor,
    glow: p.glow,
    cards: doc.cards.map((c) => {
      const params = { ...c.params };
      params.theme = p.theme;
      if (p.accent && "accent" in params) params.accent = p.accent;
      return { ...c, params };
    }),
  };
}
