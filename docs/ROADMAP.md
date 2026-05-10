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
| Records 页面（记录） | src/pages/Records.tsx | ✅ 存在（数据未完全连接） | — |
| Settings 页面 | src/pages/Settings.tsx | ✅ 存在（基础） | — |
| Toast 通知系统 | src/components/ui/Toast.tsx | ✅ 完全实现 | 2026-05-10 |
| 字体系统（中文字体） | src/index.css | ✅ 完全实现 | 2026-05-10 |
| Taste-skill 视觉规范 | 全局 | ✅ 全面应用 | 2026-05-10 |

---

## 三、未完成功能（按优先级）

### 🔴 高优先级

#### 1. 多账户管理
**需求来源：** gap-analysis.md + 用户实际场景  
**用户痛点：** 陪玩收入分散在多个平台（微信、支付宝、银行卡），不知道每个账户具体有多少钱  
**设计状态：** 已有完整设计文档（docs/plans/2026-05-09-gap-analysis.md）  
**实现状态：** ❌ 未实现  
**核心数据结构：**
```typescript
interface Account {
  id: string;
  name: string;        // "微信钱包"
  type: 'wechat' | 'alipay' | 'bank' | 'cash' | 'platform';
  balance: number;     // 当前余额
  color: string;       // 标识色
  icon: string;        // SVG 图标
  createdAt: number;
}
```
**需要的改动：**
- Transaction 表增加 `accountId` 字段
- Dashboard 资产卡片 → 显示各账户余额 + 总资产
- 魔法输入框解析后弹出账户选择
- 新增账户间转账功能
- 新增账户管理页面

**预估工作量：** 1-2 天  
**前置条件：** 无

---

#### 2. 预算系统
**需求来源：** gap-analysis.md  
**用户痛点：** 花钱没节制，超预算了才知道  
**设计状态：** 文档中有方案设计（gap-analysis.md Task 2）  
**实现状态：** ❌ 未实现  
**核心数据结构：**
```typescript
interface Budget {
  id: string;
  category: string;     // "餐饮"
  amount: number;       // 月度预算额
  period: 'monthly';    // 可扩展 weekly/yearly
}
```
**UI：**
- Dashboard 或 Reports 增加"预算进度"区块
- 环形进度条：已用 / 预算
- 超预算时颜色变红 + 提示

**预估工作量：** 半天到一天  
**前置条件：** 分类系统已存在 ✅

---

### 🟡 中优先级

#### 3. 周期性记账（自动记账）
**需求来源：** gap-analysis.md  
**用户场景：** "房租每月1号扣1500"、"iCloud订阅每月扣21"  
**设计状态：** 文档中有方案（gap-analysis.md Task 3）  
**实现状态：** ❌ 未实现  
**核心数据结构：**
```typescript
interface Recurring {
  id: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  category?: string;
  accountId?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  startDate: number;
  endDate?: number;
}
```
**执行逻辑：** 每次打开应用时检查需要生成哪些周期性交易

**预估工作量：** 1-2 天  
**前置条件：** 多账户（因为要关联账户）

---

#### 4. 标签系统
**需求来源：** gap-analysis.md  
**与分类的区别：** 分类是单维度，标签是多维度（"出差"、"春节"、"帮朋友代付"）  
**一个交易可以有多个标签**，方便跨分类统计  
**设计状态：** 只有概述，没有详细设计  
**实现状态：** ❌ 未实现  
**预估工作量：** 半天

---

#### 5. 债务/借贷追踪
**需求来源：** gap-analysis.md  
**用户场景：** "借给朋友500，还没还"、"欠室友200电费"  
**实现：** 新增"借贷"交易类型，有借款人和还款状态  
**实现状态：** ❌ 未实现  
**预估工作量：** 中等

---

### 🟢 低优先级（锦上添花）

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
| docs/archived/2026-05-07-dashboard-v0-implementation.md | 761行实现计划，Dashboard 已完成并已多次迭代 |
| docs/archived/2026-05-07-workbench-v1-implementation.md | Workbench 已实现洞察系统，但原计划部分内容（如热力图）未实现，保留供参考 |

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

## 六、推荐的开发路线

### 短期（解决最痛的问题）

```
多账户管理 → 预算系统 → 周期性记账
```

**理由：**
1. 多账户解决"不知道各账户余额"的核心痛点
2. 预算系统帮助在小收入情况下合理分配
3. 周期性记账减少重复操作

### 中期（完善体验）

```
标签系统 → 债务追踪 → 云端备份 → PWA
```

### 长期（锦上添花）

```
投资追踪 → 移动端深度优化 → 更多图表类型
```

---

## 七、当务之急

**如果现在要继续开发，优先级是：**

1. **多账户管理** — 最痛点，实现后所有收入/支出都绑定账户，资产视图清晰
2. **Dashboard 数据连通性** — 让 Dashboard 显示真实数据，TimeCapsule 演示数据真实化
3. **移动端适配** — 让手机也能用

---

*本文档为最新权威来源，如果与 docs/plans/ 中的其他文档冲突，以本文档为准。*