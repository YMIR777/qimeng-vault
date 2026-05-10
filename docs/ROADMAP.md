# 绮梦帐间 — 产品路线图终极文档

> 生成日期：2026-05-11  
> 维护者：Ymir & AI  
> 状态：活跃开发中

---

## 一、产品愿景

**核心理念：** 记账是记录存在，不是批判消费。财务软件应该是镜子，不是鞭子。

**目标用户：** 小黒秋（19岁，学生，陪玩为生，月生活费¥1000，存款几百）

**核心矛盾：** 收入极低但消费欲和自我批判强。通过记账建立"值得"的判断力，而不是焦虑。

---

## 二、当前产品状态

### 已完成 ✅

| 功能 | 文件/路径 | 状态 | 完成日期 |
|------|----------|------|----------|
| Dashboard 首页 | src/pages/Dashboard.tsx | ✅ 完全实现 | 2026-05-07 |
| MagicInput 魔法输入框 | src/components/magic/MagicInput.tsx | ✅ 完全实现 | 2026-05-07 |
| TabBar 底部导航 | src/components/ui/TabBar.tsx | ✅ 完全实现 | 2026-05-07 |
| Workbench 工作台（基础） | src/pages/Workbench.tsx | ✅ 完全实现 | 2026-05-09 |
| Workbench 洞察系统 | src/pages/Workbench.tsx | ✅ 完全实现 | 2026-05-10 |
| Reports 报表页（完整） | src/pages/Reports.tsx | ✅ 完全实现 | 2026-05-10 |
| FinancialSummary 财务摘要 | src/components/reports/FinancialSummary.tsx | ✅ 完全实现 | 2026-05-10 |
| GoldenGooseCard 金鹅账户 | src/components/reports/GoldenGooseCard.tsx | ✅ 完全实现 | 2026-05-10 |
| WisdomTooltip 财富智慧 | src/components/ui/WisdomTooltip.tsx | ✅ 完全实现 | 2026-05-10 |
| ReportNav 报表导航 | src/components/reports/ReportNav.tsx | ✅ 完全实现 | 2026-05-10 |
| TimeCapsule 时间胶囊 | src/components/reflection/TimeCapsule.tsx | ✅ 完全实现 | 2026-05-10 |
| GoalSettings 财富目标 | src/components/goals/GoalSettings.tsx | ✅ 完全实现 | 2026-05-10 |
| QuickAddFAB 全局按钮 | src/components/ui/QuickAddFAB.tsx | ✅ 完全实现 | 2026-05-10 |
| 页面过渡动画 | src/styles/global.css + App.tsx | ✅ 完全实现 | 2026-05-11 |
| Liquid Glass 效果增强 | src/index.css | ✅ 完全实现 | 2026-05-11 |
| Wish 页面（欲望星体） | src/pages/Wishes.tsx | ✅ 完全实现 | 2026-05-09 |
| 多账户管理（含账户选择、默认账户智能初始化） | src/store/db.ts, src/components/magic/SupplementForm.tsx | ✅ 完全实现 | 2026-05-09 |
| 预算系统（预算设置、进度追踪、超额提醒） | src/store/useBudgets.ts, src/pages/Settings.tsx, src/pages/Dashboard.tsx | ✅ 完全实现 | 2026-05-09 |
| Records 页面（记录） | src/pages/Records.tsx | ✅ 存在（数据未完全连接） | — |
| Settings 页面 | src/pages/Settings.tsx | ✅ 存在（基础） | — |
| Toast 通知系统 | src/components/ui/Toast.tsx | ✅ 完全实现 | 2026-05-10 |
| 字体系统（中文字体） | src/index.css | ✅ 完全实现 | 2026-05-10 |
| Taste-skill 视觉规范 | 全局 | ✅ 全面应用 | 2026-05-10 |

---

## 三、未完成功能（按优先级）

### 🔴 高优先级（暂缓，等收入稳定后再开发）

#### 1. 周期性记账（自动记账）
**需求来源：** gap-analysis.md  
**用户场景：** "房租每月1号扣1500"、"iCloud订阅每月扣21"  
**设计状态：** 文档中有方案  
**实现状态：** ❌ 未实现  
**预估工作量：** 1-2 天  
**前置条件：** 多账户（因为要关联账户）

---

#### 2. 标签系统
**需求来源：** gap-analysis.md  
**与分类的区别：** 分类是单维度，标签是多维度（"出差"、"春节"、"帮朋友代付"）  
**实现状态：** ❌ 未实现  
**预估工作量：** 半天

---

#### 3. 债务/借贷追踪
**需求来源：** gap-analysis.md  
**用户场景：** "借给朋友500，还没还"、"欠室友200电费"  
**实现状态：** ❌ 未实现  
**预估工作量：** 中等

---

### 🟡 中优先级（锦上添花）

#### 6. 云端备份 + 多设备同步
**现状：** 只有本地 IndexedDB + JSON 导出  
**方案：** Firebase / Supabase 免费版 或 GitHub Gist 备份  
**实现状态：** ❌ 未实现  
**注意：** 对当前用户来说本地备份足够

---

#### 7. PWA 打包
**现状：** 只有 Web 版本  
**需要：** PWA manifest + service worker + 图标  
**实现状态：** ❌ 未实现  
**前置条件：** 云端备份（建议）

---

#### 8. 移动端适配优化
**现状：** 基础可用但没有专门优化  
**需要：** 触摸手势、滑动操作、移动端布局优化  
**实现状态：** ❌ 未实现  
**注意：** 当前分辨率 1440x900 主要还是桌面/大屏场景

---

#### 9. 投资账户追踪
**状态：** 暂不考虑，对当前用户场景过度设计

---

## 四、已归档文档

| 原文件 | 归档原因 |
|--------|----------|
| docs/archived/2026-05-07-dashboard-v0-design.md | Dashboard 已完全实现并超越原设计，设计文档过时 |
| docs/archived/2026-05-07-dashboard-v0-implementation.md | Dashboard 实现计划，761行，已完成并多次迭代 |
| docs/archived/2026-05-07-workbench-v1-implementation.md | Workbench 已实现洞察系统，但原计划部分内容（如热力图）未实现，保留供参考 |
| docs/archived/2026-05-10-multi-page-optimization.md | 内容已全部实现，文档过时 |
| docs/archived/2026-10-reports-extension.md | 内容已全部实现，文档过时 |

---

## 五、技术约束

- **前端框架：** React + TypeScript + Vite
- **状态管理：** Dexie.js (IndexedDB) + React state
- **路由：** React Router v6
- **样式：** CSS Variables + Inline Styles（无 Tailwind）
- **动画：** CSS keyframes + GSAP（部分）
- **图表：** Recharts
- **字体：** Noto Sans SC + Noto Serif SC
- **测试：** vitest
- **设计规范：** Taste-skill（DESIGN_VARIANCE: 8, MOTION_INTENSITY: 6, VISUAL_DENSITY: 4）

---

## 六、推荐路线图

> 多账户管理和预算系统已实现（✅），以下路线图基于"已实现"调整：

### 短期（完善体验，解决剩余痛点）

```
周期性记账 → 标签系统 → 债务追踪
```

**理由：**
1. 周期性记账减少重复操作（每月固定支出自动记录）
2. 标签系统让消费记录更多维（出差、春节等场景标签）
3. 债务追踪管理借出/借入，避免遗忘

### 中期（对外发布，跨设备）

```
云端备份 → PWA打包 → 移动端深度优化
```

### 长期（锦上添花）

```
投资追踪 → 更多图表类型（Sankey资金流向、年度复盘日历）
```

---

## 七、当务之急

**已完成最核心功能。如果现在要继续开发，优先级是：**

1. **周期性记账** — 减少每月重复记账操作（固定支出自动记录）
2. **标签系统** — 让消费记录更多维（出差、春节等场景标签）
3. **移动端适配** — 让手机也能用
4. **Records 数据连通性** — 让记录页面显示真实数据

---

*本文档为最新权威来源，如果与 docs/plans/ 中的其他文档冲突，以本文档为准。*