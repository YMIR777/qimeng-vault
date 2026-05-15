# 绮梦帐间 — 产品路线图终极文档

> 生成日期：2026-05-11
> 最后更新：2026-05-16
> 维护者：Ymir & AI
> 状态：核心功能已完成

---

## 一、产品愿景

**核心理念：** 记账是记录存在，不是批判消费。财务软件应该是镜子，不是鞭子。

**目标用户：** 小黒秋（19岁，学生，陪玩为生，月生活费¥1000，存款几百）

**核心矛盾：** 收入极低但消费欲和自我批判强。通过记账建立"值得"的判断力，而不是焦虑。

---

## 二、当前产品状态

### 已完成 ✅

| 功能 | 文件/路径 | 完成日期 |
|------|----------|----------|
| Dashboard 首页 | src/pages/Dashboard.tsx | 2026-05-07 |
| MagicInput 魔法输入框 | src/components/magic/MagicInput.tsx | 2026-05-07 |
| TabBar 底部导航 | src/components/ui/TabBar.tsx | 2026-05-07 |
| Wish 页面（欲望星体） | src/pages/Wishes.tsx | 2026-05-09 |
| 多账户管理 | src/store/db.ts, src/components/magic/SupplementForm.tsx | 2026-05-09 |
| 预算系统 | src/store/useBudgets.ts, src/pages/Settings.tsx, src/pages/Dashboard.tsx | 2026-05-09 |
| 周期性记账（自动记账） | src/store/useRecurring.ts, RecurringRuleCard, RecurringRuleModal, RecurringConfirmModal | 2026-05-15 |
| 标签系统 | src/components/tags/TagPicker.tsx, src/store/db.ts (tags table) | 2026-05-15 |
| 债务追踪 | src/store/useDebts.ts, src/components/debts/DebtModal.tsx | 2026-05-15 |
| Workbench 工作台 | src/pages/Workbench.tsx | 2026-05-09/10 |
| Reports 报表页 | src/pages/Reports.tsx | 2026-05-10 |
| Reports 目标追踪区 | src/pages/Reports.tsx, GoalProgressCard.tsx, ReportCard.tsx, ReportNav.tsx | 2026-05-16 |
| FinancialSummary 财务摘要 | src/components/reports/FinancialSummary.tsx | 2026-05-10 |
| GoldenGooseCard 金鹅账户 | src/components/reports/GoldenGooseCard.tsx | 2026-05-10 |
| WisdomTooltip 财富智慧 | src/components/ui/WisdomTooltip.tsx | 2026-05-10 |
| GoalSettings 财富目标 | src/components/goals/GoalSettings.tsx | 2026-05-10 |
| Records 页面增强（筛选+分页+标签） | src/pages/Records.tsx, RecordsFilterBar.tsx | 2026-05-16 |
| 页面过渡动画 | src/styles/global.css + App.tsx | 2026-05-11 |
| Liquid Glass 效果增强 | src/index.css | 2026-05-11 |
| QuickAddFAB 全局按钮 | src/components/ui/QuickAddFAB.tsx | 2026-05-10 |
| Toast 通知系统 | src/components/ui/Toast.tsx | 2026-05-10 |
| Settings 页面（含周期性规则管理） | src/pages/Settings.tsx | 2026-05-15 |
| 字体系统（中文字体） | src/index.css | 2026-05-10 |
| Taste-skill 视觉规范 | 全局 | 2026-05-10 |

---

## 三、下一阶段方向

> 所有核心功能已完成。接下来的选择取决于你的目标：

### 选项 A：继续打磨（锦上添花）

```
云端备份 → PWA 打包 → 移动端适配 → 更多图表类型（Sankey/年度复盘）
```

### 选项 B：发布 + 验证（Build in Public）

```
本地测试确认没问题 → 分享给朋友/社区 → 收集真实反馈
```

### 选项 C：开始新项目（大金库）

```
这个项目先放一放 → 去做下一个产品（用 MVP 思维快速跑）
```

---

## 四、已归档文档

| 原文件 | 归档原因 |
|--------|----------|
| docs/archived/2026-05-07-dashboard-v0-design.md | Dashboard 已完全实现并超越原设计 |
| docs/archived/2026-05-07-dashboard-v0-implementation.md | Dashboard 实现计划，已完成并多次迭代 |
| docs/archived/2026-05-07-workbench-v1-implementation.md | Workbench 已实现洞察系统 |
| docs/archived/2026-05-10-multi-page-optimization.md | 内容已全部实现 |
| docs/archived/2026-05-10-reports-extension.md | 内容已全部实现 |
| docs/2026-05-11-four-features-design.md | 周期性记账/标签/债务/Records 增强已完成 |
| docs/2026-05-11-four-features-implementation-plan.md | 实现计划已完成 |

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

*本文档为最新权威来源，如果与 docs/plans/ 中的其他文档冲突，以本文档为准。*