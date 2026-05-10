# Reports（财务报表页）— 设计文档

> 版本：v1.0 | 日期：2026-05-09
> 状态：设计完成，待实现
> Taste Params: DESIGN_VARIANCE: 8 | MOTION_INTENSITY: 6 | VISUAL_DENSITY: 4
> Style: 暖米色新拟物 (Cream Neumorphism) | No Tailwind | CSS Variables + Inline Styles

---

## 1. 阶段目标

完成 **Reports（报表页）** — TabBar 导航上最后一个空白页面。

页面定位：
- **Workbench（工作台）** → "分析视角"（时薪趋势、来源分布、周对比）
- **Reports（报表页）** → "财务报表视角"（月度趋势、资产构成、分类排行、平台分布、本月摘要）

---

## 2. 视觉系统（延续现有）

### 2.1 色彩（Cream Neumorphism）

| 用途 | 色值 |
|------|------|
| 页面背景 | `#f5f0e8` |
| 卡片背景 | `#f0ebe0` |
| 卡片内阴影 | `inset 4px 4px 8px #cdc5b8, inset -4px -4px 8px #fffbf5` |
| 卡片外阴影 | `5px 5px 10px #cdc5b8, -5px -5px 10px #fffbf5` |
| 主文字 | `#3d3427` |
| 次文字 | `#a89f8e` / `#b8af9e` |
| 强调蓝（收入） | `#6b9fcf` |
| 强调金（支出） | `#c9923a` |
| 成功绿 | `#7a9e7e` |
| 损耗红 | `#d4a0a0` |
| 图表配色 | `#6b9fcf`, `#c9923a`, `#7a9e7e`, `#b8af9e`, `#d4a843`, `#a89f8e` |

### 2.2 字体

- **标题/数字**：`Noto Serif SC`（衬线）
- **正文/UI**：`Noto Sans SC`（无衬线）
- 字重：标题 400，正文 400-500

### 2.3 间距

- 页面水平 padding：`24px`
- 卡片内边距：`20px`
- 卡片圆角：`18px`（大卡片）、`14px`（小卡片）
- 卡片间隙：`12px`
- 页面底部：`100px`（TabBar 避让）

---

## 3. 布局架构（DESIGN_VARIANCE: 8 — 高非对称）

### 3.1 整体布局

拒绝居中！使用**左对齐标题 + 非对称网格**。

```
┌─────────────────────────────────────┐
│  绮梦账间                            │  ← 小字标签（居中偏左）
│  财务报表              [月份选择器]  │  ← 左对齐标题 + 右上角控件
│                                     │
│  ┌──────────────────┐ ┌───────────┐ │  ← Row 1: 2fr | 1fr
│  │ 月度收支趋势      │ │ 资产构成   │ │
│  │ (AreaChart)      │ │ (环形图)   │ │
│  │                  │ │           │ │
│  └──────────────────┘ └───────────┘ │
│                                     │
│  ┌──────────┐ ┌────────────────────┐ │  ← Row 2: 1fr | 2fr
│  │ 支出分类  │ │ 收入平台分布        │ │
│  │ 排行     │ │ (柱状图)           │ │
│  │ (横向条) │ │                   │ │
│  └──────────┘ └────────────────────┘ │
│                                     │
│  ┌──────────────────────────────────┐ │  ← Row 3: 全宽
│  │  本月摘要                         │ │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐   │ │  ← 非对称：2fr 1fr 1fr 1fr
│  │  ¥总收入│ ¥总支出│ ¥净结余│ 储蓄率│ │
│  └──────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 3.2 非对称规则

- **Row 1**: `grid-template-columns: 2fr 1fr`（大趋势 + 小概览）
- **Row 2**: `grid-template-columns: 1fr 2fr`（小排行 + 大分布）
- **Row 3**: `grid-template-columns: 2fr 1fr 1fr 1fr`（大数字 + 三个小指标）
- **Mobile** (`< 768px`): 全部变为 `1fr` 单列

---

## 4. 组件设计

### 4.1 月度收支趋势（AreaChart）

**尺寸**: 占据 2fr（大卡片）
**内容**:
- Recharts `AreaChart`
- X轴：月份（如 "1月", "2月"...）
- 双曲线：收入（蓝色渐变填充）+ 支出（金色渐变填充）
- Tooltip：显示当月具体收支

**样式**:
- 卡片：neumorphic 外阴影
- 图表区域：无边框，内边距 `12px`
- 收入曲线：`#6b9fcf`，渐变填充 `rgba(107,159,207,0.2)` → `rgba(107,159,207,0)`
- 支出曲线：`#c9923a`，渐变填充 `rgba(201,146,58,0.2)` → `rgba(201,146,58,0)`
- 坐标轴文字：`#a89f8e`，`12px`
- 网格线：`rgba(163,158,148,0.15)`，虚线

### 4.2 资产构成（环形图）

**尺寸**: 占据 1fr（小卡片）
**内容**:
- Recharts `PieChart`（环形，内半径 60%，外半径 85%）
- 两段：累计收入 vs 累计支出
- 中心文字：净结余（大数字）

**样式**:
- 收入段：`#6b9fcf`
- 支出段：`#c9923a`
- 中心数字：`#3d3427`，`Noto Serif SC`，`clamp(28px, 4vw, 36px)`
- 中心标签："净结余"，`#a89f8e`，`10px`

### 4.3 支出分类排行

**尺寸**: 占据 1fr（小卡片）
**内容**:
- 分类列表，按金额从大到小排列
- 每项：分类名 + 横向条形（宽度 = 金额/最大值 * 100%）+ 金额
- 最多显示前 6 个分类

**样式**:
- 条形颜色：根据分类轮换 `#6b9fcf`, `#c9923a`, `#7a9e7e`, `#b8af9e`, `#d4a843`, `#a89f8e`
- 条形高度：`8px`，圆角 `4px`
- 条形背景：`rgba(163,158,148,0.12)`
- 数字：`Noto Serif SC`，`14px`

### 4.4 收入平台分布

**尺寸**: 占据 2fr（大卡片）
**内容**:
- Recharts `BarChart`
- X轴：平台名（比心、微信、抖音...）
- Y轴：收入金额
- 柱子颜色：各平台不同柔和色

**样式**:
- 柱子圆角：`4px 4px 0 0`
- 柱子宽度：自适应
- 颜色：`#6b9fcf`, `#c9923a`, `#7a9e7e`, `#b8af9e`, `#d4a843`
- 坐标轴：`#a89f8e`

### 4.5 本月摘要（Summary Cards）

**尺寸**: 全宽，内部非对称
**内容**: 4 个指标卡片

| 指标 | 计算方式 | 颜色 |
|------|---------|------|
| 总收入 | 当月收入合计 | `#6b9fcf` |
| 总支出 | 当月支出合计 | `#c9923a` |
| 净结余 | 总收入 - 总支出 | `#3d3427` |
| 储蓄率 | 净结余 / 总收入 * 100% | `#7a9e7e` |

**布局**:
- 第一个卡片（总收入）更大：`2fr`
- 其余三个：`1fr` 均等
- 数字：`Noto Serif SC`，大字号
- 标签：`Noto Sans SC`，小字

---

## 5. 月份选择器

**位置**: 标题右侧
**样式**:
- 下拉选择器，neumorphic 风格
- 选项：最近 12 个月
- 默认：当前月
- 切换月份后所有图表重新计算

---

## 6. 入场动画（MOTION_INTENSITY: 6）

### 6.1 页面入场

```typescript
useEffect(() => {
  if (!pageRef.current) return;
  const sections = pageRef.current.querySelectorAll('.animate-in');
  gsap.fromTo(sections, 
    { y: 36, opacity: 0 }, 
    { y: 0, opacity: 1, duration: 0.65, stagger: 0.1, ease: 'power2.out', delay: 0.1 }
  );
}, [selectedMonth]);
```

### 6.2 数字滚动

使用 `useCountUp` hook（已有），数字从 0 滚动到目标值。

### 6.3 图表入场

Recharts 组件默认有 `isAnimationActive={true}`，使用自带动画。

---

## 7. 数据计算逻辑

### 7.1 按月筛选

```typescript
function filterByMonth(transactions: Transaction[], monthStr: string): Transaction[] {
  // monthStr = "2026-05"
  const [year, month] = monthStr.split('-').map(Number);
  const start = new Date(year, month - 1, 1).getTime();
  const end = new Date(year, month, 1).getTime();
  return transactions.filter(t => t.date >= start && t.date < end);
}
```

### 7.2 月度趋势（最近 6 个月）

```typescript
function calcMonthlyTrend(transactions: Transaction[]) {
  const months: Record<string, { income: number; expense: number }> = {};
  const now = new Date();
  // 生成最近 6 个月的空数据
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months[key] = { income: 0, expense: 0 };
  }
  // 填充数据
  for (const tx of transactions) {
    const d = new Date(tx.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (months[key]) {
      if (tx.type === 'income') months[key].income += tx.amount;
      else months[key].expense += tx.amount;
    }
  }
  return Object.entries(months).map(([month, data]) => ({
    month: month.slice(5) + '月', // "05月"
    income: data.income,
    expense: data.expense,
  }));
}
```

### 7.3 分类排行

```typescript
function calcCategoryRanking(transactions: Transaction[]) {
  const expenses = transactions.filter(t => t.type === 'expense');
  const byCategory: Record<string, number> = {};
  for (const tx of expenses) {
    const cat = tx.category || '其他';
    byCategory[cat] = (byCategory[cat] || 0) + tx.amount;
  }
  return Object.entries(byCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}
```

### 7.4 平台分布

```typescript
function calcPlatformDistribution(transactions: Transaction[]) {
  const incomes = transactions.filter(t => t.type === 'income');
  const byPlatform: Record<string, number> = {};
  for (const tx of incomes) {
    const p = tx.platform || '其他';
    byPlatform[p] = (byPlatform[p] || 0) + tx.amount;
  }
  return Object.entries(byPlatform)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}
```

---

## 8. 技术方案

### 8.1 文件

- **Create**: `src/pages/Reports.tsx`
- **Modify**: `src/App.tsx`（已有路由，无需修改）
- **依赖**: `recharts`（已安装）、`gsap`（已安装）

### 8.2 入口

TabBar 已有 `/reports` 路由，无需修改。

---

## 9. 成功标准

- [ ] 报表页显示 5 个数据可视化区块（月度趋势、资产构成、分类排行、平台分布、本月摘要）
- [ ] 月份选择器可切换，图表随月份更新
- [ ] 所有数字使用滚动动画
- [ ] 页面入场有 gsap 动画
- [ ] 布局非对称（2fr/1fr 交替），移动端自动变为单列
- [ ] 整体风格与现有页面一致（Cream Neumorphism）
- [ ] 无编译错误，无 emoji

---

*文档状态：v1.0 已完成，进入实现阶段*
