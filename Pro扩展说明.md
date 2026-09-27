# Pro 扩展说明 · Overlay Studio

> 这份文档说明:**在原开源版基础上补出来的「专业版能力」有哪些、怎么用、怎么验证**。
> 对应官网 <https://www.overlaystudio.cn/#pricing> 里 PRO 版列出的能力项,逐条对照实现。

---

## 一、对照表:Pro 卖点 → 本仓库实现

| 官网 PRO 版能力 | 本仓库实现 | 状态 |
|---|---|---|
| **102 张动效卡 / 15 类** | **35 张卡 / 15 类**(原 20 张 / 11 类 + 新增 15 张 / 4 类) | ✅ 四类新表达齐全,卡片数量按同一套架构可继续扩 |
| **多出的四类表达**:信息结构、转场、情绪爆点、氛围底噪 | 新增 4 个分组共 15 张卡(见下表) | ✅ |
| **竖版 9:16**(基础版不支持) | 编排顶层 `aspect` 字段 + 编辑台画幅下拉 + 竖屏版式重排 + 导出 1080×1920 | ✅ 实机验证 |
| **风格复用**(自主学习风格,下次继续复用) | 「风格档案」:存 / 套 / 导出 / 导入,存主题·强调色·字体·文字色·画幅·倍速 | ✅ 实机验证 |
| **更聪明的编排方法论**(几个月打磨的方法论) | 更新 `overlay-fx-generator` skill:新增结构/转场/爆点/氛围四节的选卡规则与画幅、风格复用两章 | ✅ 四入口同步 |
| **界面浅色 / 深色主题切换** | 顶栏一键切换 + 齿轮面板分段按钮,自动跟随系统偏好 | ✅ 实机验证 |
| 透明层导出 / 完整编辑台 / AI 编排 | 开源版本就有,保持不动 | ✅ 回归通过 |

> 说明:PRO 版的实际卡片库是作者的私有沉淀(102 张),这里做的是**同架构下的等价能力实现** ——
> 四类表达、竖屏、风格复用、编排方法论这四项能力全部可用,卡片数量可以照同一套写法继续加。

---

## 二、新增的 15 张卡

### 信息结构(6 张:把「关系」画出来,别拆成多张文字卡)

| kind | 名称 | 什么时候用 | 关键参数 |
|---|---|---|---|
| `org-chart` | OrgChart | 谁挂在谁下面、一个根带几条线 | `root`/`rootSub`/`branches`(一行一支 `名称\|小注`)/`lineMs` |
| `layered-stack` | LayeredStack | 从底到顶、越往上越少(分层/金字塔) | `layers`(一行一层 `层名\|说明`)/`stepMs` |
| `matrix-grid` | MatrixGrid | 两个维度交叉定位(重要/紧急、成本/收益) | `xAxis`/`yAxis`/`items`(一行一项 `名称 x y`,x/y 取 -1~1)/`stepMs` |
| `mind-map` | MindMap | 一个中心发散几条支线 | `center`/`left`/`right`(一行一支 `主支\|子项1/子项2`)/`stepMs` |
| `funnel-flow` | FunnelFlow | 逐级收窄的转化(曝光→点击→转化) | `stages`(一行一级 `阶段名\|数值`)/`unit` |
| `cycle-loop` | CycleLoop | 会绕回起点的循环(PDCA、内容循环) | `nodes`(一行一个)/`center`/`stepMs` |

### 转场(3 张:章节之间的一次性动作,1–2 秒,不与其他卡同屏)

| kind | 名称 | 什么时候用 | 关键参数 |
|---|---|---|---|
| `warp-title` | WarpTitle | 进入新章节:满屏编号 + 大标题 + 光带横扫 | `index`/`title`/`subtitle` |
| `split-wipe` | SplitWipe | 换场景:两块色板从中缝向两侧划开 | `text`/`label` |
| `flash-cut` | FlashCut | 硬切节奏点:全屏闪一下 + 冲击环 | `flash`(white/dark/accent)/`text` |

### 情绪爆点(3 张:节奏最高点的重击,一段最多一次)

| kind | 名称 | 什么时候用 | 关键参数 |
|---|---|---|---|
| `impact-burst` | ImpactBurst | 情绪/结论最高点:放射线爆发 + 大字弹入 | `text`/`sub`/`rays`(8–32) |
| `shake-slam` | ShakeSlam | 一句狠话砸下来:否定、反常识、警告 | `text`/`sub` |
| `pulse-ring` | PulseRing | 「影响在扩散」:传播、复利、波及 | `text`/`value`/`unit`/`rings`(2–6) |

### 氛围底噪(3 张:铺满整段的最底层,不计密度、不配音效)

| kind | 名称 | 什么时候用 | 关键参数 |
|---|---|---|---|
| `aurora-glow` | AuroraGlow | 柔光质感的一段:抒情、开场、结尾 | `hueA`/`hueB`/`intensity`/`speed` |
| `grain-bed` | GrainBed | 想要胶片/质感:整片铺一层 | `opacity`/`vignette` |
| `grid-drift` | GridDrift | 科技感氛围:讲工具、AI、数据 | `density`/`speed`/`fade` |

**试法**:顶栏点 **「🧩 示例·Pro」** —— 36 秒演示编排,11 张卡把四类新表达全走一遍,不需要自己的视频。

---

## 三、竖屏 9:16 怎么用

1. 顶栏 **「⚙ 全局设置」→「画幅(导出尺寸)」→ 竖屏 9:16**;
2. 画布立刻变 1080×1920,左右落位自动收到中间一列,常驻层字号收一档;
3. 导出照常点「⬇ 导出透明 MOV」,成片就是 **1080×1920 的 ProRes 4444 透明层**。

编排 JSON 里对应一个顶层字段:

```json
{ "version": 1, "theme": "dark", "aspect": "9:16", "cards": [ ... ] }
```

竖屏版式规则(卡片组件不动,只改它们站在画布哪一块):
左右锚点收中、槽位改单列、人物占位与安全区收窄、章节条允许两行、字幕下移并收字号。

> 竖屏仍在试验中:导出尺寸与版式都通了,但没经过大量成片检测,建议先导一小段试。

---

## 四、风格复用怎么用

顶栏 **「⚙ 全局设置」→「风格复用」**:

| 动作 | 说明 |
|---|---|
| **存** | 输入档案名 → 点「存」。把当前的主题 / 主强调色 / 字体 / 文字色 / 光晕 / 画幅 / 动效倍速 存成档案 |
| **套** | 点已存档案的名字。只改**视觉**,不动文案、时间、卡片类型;可 ⌘Z 撤销 |
| **↧ 导出** | 把档案存成 `style-<名>.json`,可以备份、搬到别的机器 |
| **导入** | 选一个档案 `.json` 导入,导入后问你要不要立刻套用 |
| **✕ 删除** | 只删档案,不影响当前编排 |

档案存在浏览器 `localStorage`(`overlayStudioStyles`),最多保留 40 份。
换机器时:**编排 JSON + 风格档案 JSON 一起带过去**即可。

---

## 五、界面主题:浅色 / 深色

编辑台外壳支持一键切浅色和深色,**只影响编辑台,画布与导出画面完全不变**(那两样是视频内容,和界面无关)。

| 入口 | 位置 |
|---|---|
| **顶栏胶囊按钮** | 顶栏右侧(「全局设置」左边):点一下在浅色/深色之间切 |
| **齿轮面板分段按钮** | ⚙ 全局设置 →「界面主题」→ 🌙 深色 / ☀ 浅色 |

细节:

- **浅色组**:瑞士·亮(默认浅色)/ 象牙陶土 / 冷灰白 / 系统蓝·浅 / Material 紫
- **深色组**:瑞士·暗(默认深色)/ 终端荧光 / 经典灰蓝 / 线框手账 / 荒漠 / 雾林 / 系统蓝·暗 / 深空紫
- 来回切**不丢**你挑过的配色:浅色一侧和深色一侧各自记住上次用的那套
- 首次进入**跟随系统偏好**(macOS/Windows 的浅色/深色设置);点过一次就以你的选择为准
- 手动在齿轮里挑配色时,主题开关会自动跳到对应的一侧
- 选择存在 `localStorage`(`overlayStudioScheme`),刷新/重开都记得

---

## 六、验收证据(全部实机跑过)

| 项 | 结果 |
|---|---|
| 自检四件套 | `npm run check:cards` 全绿:**35 张卡**文案过审 / 缓动检查通过 / 卡片库同步(35 种,无待补)/ 4 个 Agent Skill 入口一致 |
| 类型与构建 | `npx tsc -b` 0 错误;`npm run build` 通过(343 KB JS / 101 KB CSS);`npm run lint` 0 errors |
| 15 张新卡渲染 | 逐张在真实舞台渲染截图,**零控制台报错**(`验收记录/` 内) |
| 竖屏导出 | 实跑 10s / 300 帧:`1080×1920` / ProRes 4444 / `yuva444p12le` / 29.97fps,alpha 通道有效 |
| Pro 示例导出 | 实跑 12s / 360 帧:1920×1080 ProRes 4444,含 `aurora-glow`+`grid-drift`+`warp-title`+`org-chart`+`mind-map` |
| 风格复用 | UI 实机:存档 → 档案胶囊出现 → 套用成功,localStorage 落盘正确 |
| 界面主题切换 | UI 实机:顶栏按钮与齿轮分段按钮都能切;浅色五套配色逐个验算令牌;刷新后记住选择;零控制台报错 |
| 编排体检 | `npm run -s lint:overlay -- public/demo/demo-pro.json --duration 36` → 无 error、无 warn |

---

## 六、给 AI 编排器的新规则(已写进 skill)

`overlay-fx-generator` skill(4 个入口同步)新增:

- **结构优先**:语义是「关系」时用 `org-chart`/`layered-stack`/`matrix-grid`/`mind-map`/`funnel-flow`/`cycle-loop`,别拆成三张文字卡;这类卡独占一段。
- **节奏点用转场与爆点**:章节之间 `warp-title`;换场景 `split-wipe`;硬切 `flash-cut`;最高点 `impact-burst`/`shake-slam`;扩散语义 `pulse-ring`。转场卡不与其他卡同屏。
- **氛围底噪铺底**:`aurora-glow`/`grain-bed`/`grid-drift` 垫最底层,不计密度与多样性、不配音效。
- **画幅章**:竖屏的落位与字号差异、`aspect` 字段怎么填。
- **风格复用章**:生成新一期前先读用户偏好表里的风格档案取值。

---

## 七、本地改动清单(相对上游)

新增(15 张卡 + 3 个共享 CSS + 3 个新模块):

```
motion-playground/src/effects/hud/OrgChart.tsx / LayeredStack.tsx / MatrixGrid.tsx
                                / MindMap.tsx / FunnelFlow.tsx / CycleLoop.tsx
                                / WarpTitle.tsx / SplitWipe.tsx / FlashCut.tsx
                                / ImpactBurst.tsx / ShakeSlam.tsx / PulseRing.tsx
                                / AuroraGlow.tsx / GrainBed.tsx / GridDrift.tsx
motion-playground/src/effects/hud/pro-cards-a.css / pro-cards-b.css / pro-cards-c.css
motion-playground/src/styles.ts          # 风格档案:存/套/导入/导出
motion-playground/src/theme.ts           # 界面主题:浅色/深色分组、跟随系统、偏好记忆
motion-playground/public/demo/demo-pro.json  # 「🧩 示例·Pro」的数据
```

修改(功能接入点):

```
src/stage.ts              两套画幅的唯一源头(16:9 / 9:16)
src/overlay/types.ts      OverlayDoc.aspect
src/overlay/lint.ts       新卡的卡内节奏规格 + 转场/底噪的驻留豁免
src/components/Canvas.tsx      画布跟随画幅 + data-aspect
src/components/TopBar.tsx      画幅下拉 + 风格复用面板 + 界面主题开关 + 「🧩 示例·Pro」
src/App.tsx                    主题开关状态与配色分组联动(scheme / pickScheme / pickPalette)
src/App.css                    主题开关与分段按钮样式
src/effects/hud/hud.css        竖屏版式重排 + 引入三个 pro-cards CSS
src/effects/registry.ts        15 张新卡注册进 4 个新分组
src/ExportView.tsx / scripts/export-frames.mjs   导出跟随画幅
scripts/sync-skill-cards.mjs   新增 4 个分组的分组提示
scripts/lint-overlay.ts        竖屏时在检查结果里标注画幅
.claude/skills/overlay-fx-generator/SKILL.md   新卡表 + 画幅章 + 风格复用章(已同步 4 入口)
```

---

## 八、怎么更新到上游新版

```powershell
cd D:\飞牛文件同步\动效工作台
git stash push -m "本地 Pro 扩展"      # 先把本地改动收起来(可选)
git pull                                # 拉上游
git stash pop                           # 放回来,冲突按《更新指南.md》处理
cd motion-playground
npm install                             # package.json 有变化时才要
npm run check:cards                     # 自检:应当仍全绿
npm run dev
```

> 本地改动集中在**新增文件**与少数接入点,上游更新时冲突面很小;
> 若 `registry.ts` / `hud.css` / `SKILL.md` 报冲突,按「保留双方」处理:新卡行与竖屏样式段是纯新增。
