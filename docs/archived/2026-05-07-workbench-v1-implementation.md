# Workbench (工作台) V1.1 — 实现计划

**Goal:** 收入数据分析工作台：时薪趋势折线图、来源分布饼图、周对比

**Taste Params:** DESIGN_VARIANCE: 8 | MOTION_INTENSITY: 6 | VISUAL_DENSITY: 4
**Style:** Cream Neumorphism (#f5f0e8)

---

## 数据计算逻辑

### 1. 时薪趋势 (Hourly Rate Trend)

```typescript
// 按周分组
interface WeeklyRate {
  week: string;        // "05/01-05/07"
  rate: number;        // 元/小时
  income: number;      // 当周总收入
  hours: number;       // 当周总工时(小时)
}

function calcWeeklyRates(transactions: Transaction[]): WeeklyRate[] {
  const incomeTx = transactions.filter(t => t.type === 'income' && t.timeSpent && t.timeSpent > 0);
  
  // Group by week (Sunday-Saturday)
  const byWeek: Record<string, { income: number; minutes: number }> = {};
  
  for (const tx of incomeTx) {
    const d = new Date(tx.date);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay()); // Sunday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Saturday
    const key = `${weekStart.getMonth()+1}/${weekStart.getDate()}-${weekEnd.getMonth()+1}/${weekEnd.getDate()}`;
    
    if (!byWeek[key]) byWeek[key] = { income: 0, minutes: 0 };
    byWeek[key].income += tx.amount;
    byWeek[key].minutes += tx.timeSpent;
  }
  
  return Object.entries(byWeek)
    .map(([week, data]) => ({
      week,
      rate: Math.round(data.income / (data.minutes / 60)),
      income: data.income,
      hours: +(data.minutes / 60).toFixed(1),
    }))
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-8); // Last 8 weeks
}
```

### 2. 来源分布 (Source Distribution Pie)

```typescript
function calcPlatformDistribution(transactions: Transaction[]) {
  const incomeTx = transactions.filter(t => t.type === 'income');
  const byPlatform: Record<string, number> = {};
  
  for (const tx of incomeTx) {
    const p = tx.platform || '其他';
    byPlatform[p] = (byPlatform[p] || 0) + tx.amount;
  }
  
  return Object.entries(byPlatform)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}
```

### 3. 周对比 (Week-over-Week)

```typescript
function calcWeekComparison(transactions: Transaction[]) {
  const now = new Date();
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - now.getDay());
  thisWeekStart.setHours(0, 0, 0, 0);
  
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);
  
  const lastWeekEnd = new Date(thisWeekStart);
  lastWeekEnd.setDate(thisWeekStart.getDate() - 1);
  lastWeekEnd.setHours(23, 59, 59, 999);
  
  const thisWeekTx = transactions.filter(t => t.date >= thisWeekStart.getTime());
  const lastWeekTx = transactions.filter(t => t.date >= lastWeekStart.getTime() && t.date <= lastWeekEnd.getTime());
  
  const thisIncome = thisWeekTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const thisExpense = thisWeekTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  
  const lastIncome = lastWeekTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const lastExpense = lastWeekTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  
  return {
    thisWeek: { income: thisIncome, expense: thisExpense, net: thisIncome - thisExpense },
    lastWeek: { income: lastIncome, expense: lastExpense, net: lastIncome - lastExpense },
  };
}
```

---

## UI 布局 (taste skills)

### 页面结构

```
┌─────────────────────────────────────┐
│  工作台                              │
│                                     │
│  ┌──────────────┐  ┌────────────┐ │
│  │ 本周          │  │ 上周       │ │
│  │ +¥1500       │  │ +¥1200    │ │
│  │ ▲ +25%      │  │            │ │
│  └──────────────┘  └────────────┘ │
│                                     │
│  ┌────────────────────────────────┐ │
│  │ 时薪趋势 (LineChart)           │ │
│  │ ¥50 ¥60 ¥55 ¥70 ¥80 ¥65     │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌────────────────────┐ ┌─────────┐ │
│  │ 来源分布 (PieChart)│ │ 统计   │ │
│  │  比心 60%          │ │ 平均   │ │
│  │  微信 30%          │ │ 单笔   │ │
│  │  抖音 10%          │ │ ¥150   │ │
│  └────────────────────┘ └─────────┘ │
└─────────────────────────────────────┘
```

### 配色
- 背景: #f5f0e8
- 卡片: #f0ebe0
- 收入线: #6b9fcf (柔蓝)
- 饼图颜色: #6b9fcf, #c9923a, #7a9e7e, #c9923a, #b8af9e
- 文字: #3d3427

### 组件
- LineChart: 时薪趋势（周 X 轴，时薪 Y 轴）
- PieChart: 来源分布（带百分比标签）
- Cards: 周对比数据 + 增长率
- No 3-column equal cards → 用 2fr 1fr 非对称

---

## 文件

- Create: `src/pages/Workbench.tsx`
- Modify: `src/App.tsx` (already has route)
- Recharts: `LineChart`, `Line`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `ResponsiveContainer`, `PieChart`, `Pie`, `Cell`

## 约束
- 中文 UI
- No Tailwind
- Cream neumorphism
- Spring physics
- 日记式数据展示

*计划就绪，开始执行*
