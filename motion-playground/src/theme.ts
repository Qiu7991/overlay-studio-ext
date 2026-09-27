/**
 * 界面主题(浅色 / 深色)· 只作用于编辑台外壳。
 *
 * 背景:编辑台的颜色本来由「配色」(data-palette,index.css 里 13 套令牌表)决定,
 * 但那 13 套里哪几套是浅色,只有看名字才知道(瑞士·亮 / 冷灰白 / 系统蓝·浅……)。
 * 用户要的是「一个开关切浅色和深色」,不该先学会认这 13 个名字。
 *
 * 做法:
 *  - 把 13 套配色按明暗分成两组;开关在两组之间切换;
 *  - 每组各记一个「上次用的那套」,来回切不丢自己挑过的配色;
 *  - 显式选择存 localStorage(`overlayStudioScheme`);没选过就跟随系统 prefers-color-scheme;
 *  - 结果写进 <html data-scheme="light|dark">,供 CSS 做明暗相关的细节修正。
 *
 * 不影响导出画面:画布与卡片用的是另一套令牌(hud.css),和这里无关。
 */

export type Scheme = "light" | "dark";

/** 浅色配色(其余都是深色)。新增配色时记得归组,否则它会被当成深色。 */
export const LIGHT_PALETTES = ["light", "clay", "frost", "blue-light", "md-violet"] as const;

export function isLightPalette(id: string): boolean {
  return (LIGHT_PALETTES as readonly string[]).includes(id);
}

/** 这套配色属于浅色还是深色 */
export function schemeOf(palette: string): Scheme {
  return isLightPalette(palette) ? "light" : "dark";
}

/** 切到浅色时用的默认配色(「瑞士·亮」:同一套骨架的纸白版) */
export const DEFAULT_LIGHT_PALETTE = "light";
/** 切到深色时用的默认配色("" = 出厂默认「瑞士·暗」) */
export const DEFAULT_DARK_PALETTE = "";

const SCHEME_KEY = "overlayStudioScheme";
const LAST_LIGHT_KEY = "overlayStudioPaletteLight";
const LAST_DARK_KEY = "overlayStudioPaletteDark";

export function readStored(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeStored(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* 隐私模式:只在本次会话生效 */
  }
}

/** 用户显式选过的主题;没选过返回 null(由调用方决定要不要跟随系统) */
export function readSchemeChoice(): Scheme | null {
  const v = readStored(SCHEME_KEY, "");
  return v === "light" || v === "dark" ? v : null;
}

export function writeSchemeChoice(s: Scheme) {
  writeStored(SCHEME_KEY, s);
}

/** 系统偏好;取不到(旧浏览器/隐私模式)按深色 —— 出厂默认就是深色 */
export function systemScheme(): Scheme {
  try {
    return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export const KEYS = { SCHEME: SCHEME_KEY, LAST_LIGHT: LAST_LIGHT_KEY, LAST_DARK: LAST_DARK_KEY };
