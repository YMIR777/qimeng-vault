# 绮梦帐间 — 多页面优化与后悔率整合计划

> **For implementer:** Use TDD throughout. Write failing test first. Watch it fail. Then implement.

**Goal:** 同时优化 Reports 报表、Workbench 工作台，完成后悔率整合，提升整体数据可视化质感。

**Architecture:** 保持现有页面结构，新增洞察模块和后悔率时间胶囊功能。使用 taste-skill 视觉规范提升质感。

**Tech Stack:** React + TypeScript + Recharts + GSAP + Tailwind CSS + vitest

---

## Task 1: Workbench 工作台洞察系统

**Files:**
- Modify: `src/pages/Workbench.tsx`
- Create: `src/__tests__/WorkbenchInsights.test.tsx`

**新增内容：**
1. **工作概览卡片**（顶部）
   - 本月工作天数
   - 最高单笔收入
   - 回头客数量
   - 平均订单金额
   
2. **时段分析**
   - 哪几天收入最高（热力图）
   - 工作时长趋势
   
3. **客户价值分析**
   - 回头客 vs 新客户比例
   - 高价值客户标记（消费 > ¥500）

**视觉风格：**
- 保持现有 neumorphism
- 加入 taste-skill 规范：
  - DESIGN_VARIANCE: 8 → 不对称布局
  - MOTION_INTENSITY: 6 → 弹簧动画
  - 无 3 列等宽
  - 使用 font-mono 数字

---

## Task 2: Reports 报表优化

**Files:**
- Modify: `src/pages/Reports.tsx`
- Create: `src/__tests__/ReportsOptimized.test.tsx`

**优化内容：**
1. **简化收入来源分布**
   - 缩小或移到次要位置
   - 或者改为"收入渠道占比"（更小的展示）
   
2. **增强支出洞察**
   - 支出类型占比
   - 日均支出趋势
   
3. **新增"生活投资"视角**
   - 标记支出为"生活投资"（设备升级、技能提升）
   - 与普通消费区分开

---

## Task 3: 后悔率整合 — 时间胶囊

**Files:**
- Modify: `src/pages/Reflection.tsx`
- Create: `src/components/reflection/TimeCapsule.tsx`
- Create: `src/__tests__/TimeCapsule.test.tsx`
- Modify: `src/store/db.ts`（如有需要）

**功能设计：**
1. **月底复盘按钮**
   - 每月 1 日自动弹出或手动触发
   - 显示上月所有标记"值得"的支出
   
2. **重新打分**
   - 对每笔支出重新标记：仍然值得 / 后悔了
   - 后悔率 = 后悔数量 / 总标记数
   
3. **后悔率可视化**
   - 月度后悔率趋势
   - 后悔类型分析（哪些类别最容易后悔）
   
4. **洞察**
   - "你的判断力在提升" / "注意这类支出"

---

## Task 4: Dashboard 洞察卡片

**Files：**
- Modify: `src/pages/Dashboard.tsx`
- Create: `src/__tests__/DashboardInsights.test.tsx`

**新增内容：**
1. **今日工作激励卡片**
   - "今日已工作 X 小时，赚了 Y 元"
   - "本周目标进度"
   
2. **许愿瓶快速查看**
   - 最近的一个许愿瓶进度
   - 点击跳转详情
   
3. **快速记账入口**
   - 大按钮，减少操作步骤

---

## Task 5: 全量 taste-skill 视觉升级

**Files：**
- Modify: 所有页面文件（选择性）

**升级内容：**
1. **字体系统**
   - 数字使用等宽字体
   - 标题使用更紧凑的字间距
   
2. **动画升级**
   - 卡片入场弹簧动画
   - 数字滚动动画
   - 布局过渡 smooth
   
3. **交互反馈**
   - 按钮 hover/active 状态
   - 加载骨架屏
   
4. **空状态设计**
   - 没有数据时的优雅展示

---

## 任务总览

| 任务 | 页面 | 内容 | 预估时间 |
|------|------|------|---------|
| Task 1 | Workbench | 洞察系统 | 20 min |
| Task 2 | Reports | 报表优化 | 15 min |
| Task 3 | Reflection | 后悔率时间胶囊 | 25 min |
| Task 4 | Dashboard | 洞察卡片 | 15 min |
| Task 5 | All | taste-skill 视觉升级 | 20 min |
| **总计** | | | **~95 min** |

---

## 验证标准

- [ ] 所有测试通过 (`npx vitest run`)
- [ ] 构建成功 (`npm run build`)
- [ ] 手动验证各页面功能正常
- [ ] 代码符合 taste-skill 规范
- [ ] 每个 Task 有独立 commit

---

## taste-skill 规范（强制执行）

```
【设计规范 - 强制执行】
- DESIGN_VARIANCE: 8
- MOTION_INTENSITY: 6
- VISUAL_DENSITY: 4
- 无 3 列等宽卡片
- 数字使用 font-mono
- 弹簧动画：cubic-bezier(0.34, 1.56, 0.64, 1)
- 禁止纯黑 #000000
- 禁止霓虹/外发光
- 卡片内边距：p-8 或 p-10
- 圆角：rounded-[2.5rem] 用于大容器
- Liquid Glass 效果
```
