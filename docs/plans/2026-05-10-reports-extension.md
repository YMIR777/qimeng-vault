# Reports 页面扩展 — 财务洞察与财富智慧

> **For implementer:** Use TDD throughout. Write failing test first. Watch it fail. Then implement.

**Goal:** 扩展 Reports 页面，新增财务摘要卡片（自动洞察）、净资产曲线、金鹅增长图、财富自由进度、应急资金指标、时薪转化洞察，以及每个数据背后的财富智慧 Tooltip 系统。

**Architecture:** 保持现有 Reports 单页长滚动结构，新增独立计算模块（utils/financialHealth.ts）和财富智慧引擎（utils/wisdomEngine.ts）。数据通过 useLedger 已有 transactions 计算，无需新增数据库字段。Tooltip 用纯 CSS + React state 实现，不引入新依赖。

**Tech Stack:** React + TypeScript + Recharts + GSAP + Tailwind CSS (v3) + vitest

---

## Task 1: 创建财务健康计算模块

**Files:**
- Create: `src/utils/financialHealth.ts`
- Test: `src/__tests__/financialHealth.test.ts`

**Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest';
import {
  calcNetWorth,
  calcSavingsRate,
  calcEmergencyFundMonths,
  calcFreedomProgress,
  calcHourlyRate,
  calcTimeCost,
} from '../utils/financialHealth';

describe('financialHealth utils', () => {
  const mockTx = [
    { type: 'income', amount: 5000, date: Date.now(), platform: '比心', timeSpent: 240 },
    { type: 'expense', amount: 2000, date: Date.now(), category: '餐饮' },
    { type: 'expense', amount: 1000, date: Date.now(), category: '交通' },
    { type: 'income', amount: 3000, date: Date.now() - 30 * 24 * 60 * 60 * 1000, timeSpent: 180 },
    { type: 'expense', amount: 1500, date: Date.now() - 30 * 24 * 60 * 60 * 1000 },
  ];

  it('calculates net worth correctly', () => {
    expect(calcNetWorth(mockTx)).toBe(5000 + 3000 - 2000 - 1000 - 1500);
  });

  it('calculates savings rate for current month', () => {
    // Current month: income 5000, expense 3000 → savings rate = 40%
    expect(calcSavingsRate(mockTx, 'current')).toBeCloseTo(40, 1);
  });

  it('calculates emergency fund months', () => {
    // Net worth 3500 / avg monthly expense 2250 ≈ 1.56
    expect(calcEmergencyFundMonths(mockTx)).toBeCloseTo(1.56, 1);
  });

  it('calculates hourly rate from income with time', () => {
    // Total income with time: 5000 + 3000 = 8000
    // Total minutes: 240 + 180 = 420
    // Hourly rate: 8000 / (420/60) = 1142.86
    expect(calcHourlyRate(mockTx)).toBeCloseTo(1143, 0);
  });

  it('calculates time cost for an expense', () => {
    // ¥299 item at ¥1143/hr → 299/1143*60 ≈ 15.7 minutes
    expect(calcTimeCost(299, 1143)).toBeCloseTo(15.7, 0);
  });

  it('calculates freedom progress', () => {
    // Net worth 3500 / (avg monthly expense 2250) = 1.56 months
    // Target: 6 months → 1.56/6 = 26%
    expect(calcFreedomProgress(mockTx, 6)).toBeCloseTo(26, 0);
  });
});
```

**Step 2: Run test — confirm it fails**

```bash
cd ~/Documents/绮梦帐间 && npx vitest run src/__tests__/financialHealth.test.ts
```

Expected: FAIL — "Module not found" or "function not defined"

**Step 3: Write minimal implementation**

```typescript
// src/utils/financialHealth.ts

export interface Transaction {
  type: 'income' | 'expense';
  amount: number;
  date: number;
  category?: string;
  platform?: string;
  timeSpent?: number;
}

export function calcNetWorth(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => {
    return t.type === 'income' ? sum + t.amount : sum - t.amount;
  }, 0);
}

export function calcMonthlyStats(transactions: Transaction[], monthStr?: string) {
  const now = new Date();
  const targetMonth = monthStr || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [year, month] = targetMonth.split('-').map(Number);
  const start = new Date(year, month - 1, 1).getTime();
  const end = new Date(year, month, 1).getTime();
  
  const monthTx = transactions.filter(t => t.date >= start && t.date < end);
  const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  
  return { income, expense, net: income - expense, savingsRate: income > 0 ? ((income - expense) / income) * 100 : 0 };
}

export function calcSavingsRate(transactions: Transaction[], period: 'current' | string = 'current'): number {
  const stats = calcMonthlyStats(transactions, period === 'current' ? undefined : period);
  return Math.max(0, stats.savingsRate);
}

export function calcAvgMonthlyExpense(transactions: Transaction[]): number {
  if (transactions.length === 0) return 0;
  const expenses = transactions.filter(t => t.type === 'expense');
  if (expenses.length === 0) return 0;
  
  const dates = transactions.map(t => t.date);
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const monthsDiff = Math.max(1, Math.ceil((maxDate - minDate) / (30 * 24 * 60 * 60 * 1000)));
  
  const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);
  return totalExpense / monthsDiff;
}

export function calcEmergencyFundMonths(transactions: Transaction[]): number {
  const netWorth = calcNetWorth(transactions);
  const avgExpense = calcAvgMonthlyExpense(transactions);
  if (avgExpense === 0) return 0;
  return netWorth / avgExpense;
}

export function calcHourlyRate(transactions: Transaction[]): number {
  const incomeWithTime = transactions.filter(t => t.type === 'income' && t.timeSpent && t.timeSpent > 0);
  if (incomeWithTime.length === 0) return 0;
  
  const totalIncome = incomeWithTime.reduce((s, t) => s + t.amount, 0);
  const totalMinutes = incomeWithTime.reduce((s, t) => s + (t.timeSpent ?? 0), 0);
  
  if (totalMinutes === 0) return 0;
  return Math.round(totalIncome / (totalMinutes / 60));
}

export function calcTimeCost(amount: number, hourlyRate: number): number {
  if (hourlyRate <= 0) return 0;
  return (amount / hourlyRate) * 60; // returns minutes
}

export function calcFreedomProgress(transactions: Transaction[], targetMonths: number = 6): number {
  const emergencyMonths = calcEmergencyFundMonths(transactions);
  if (targetMonths <= 0) return 0;
  return Math.min(100, (emergencyMonths / targetMonths) * 100);
}

export function calcNetWorthHistory(transactions: Transaction[]) {
  if (transactions.length === 0) return [];
  
  const sorted = [...transactions].sort((a, b) => a.date - b.date);
  const history: { date: string; netWorth: number }[] = [];
  let runningTotal = 0;
  
  // Group by month
  const monthly: Record<string, Transaction[]> = {};
  for (const tx of sorted) {
    const d = new Date(tx.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!monthly[key]) monthly[key] = [];
    monthly[key].push(tx);
  }
  
  for (const [month, txs] of Object.entries(monthly)) {
    const monthNet = txs.reduce((s, t) => t.type === 'income' ? s + t.amount : s - t.amount, 0);
    runningTotal += monthNet;
    history.push({ date: month, netWorth: runningTotal });
  }
  
  return history;
}
```

**Step 4: Run test — confirm it passes**

```bash
cd ~/Documents/绮梦帐间 && npx vitest run src/__tests__/financialHealth.test.ts
```

Expected: PASS — 6 tests passed

**Step 5: Commit**

```bash
cd ~/Documents/绮梦帐间 && git add src/utils/financialHealth.ts src/__tests__/financialHealth.test.ts && git commit -m "feat: add financial health calculation utilities with tests"
```

---

## Task 2: 创建财富智慧引擎

**Files:**
- Create: `src/utils/wisdomEngine.ts`
- Test: `src/__tests__/wisdomEngine.test.ts`

**Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { getSavingsRateInsight, getEmergencyFundInsight, getFreedomProgressInsight, WisdomLevel } from '../utils/wisdomEngine';

describe('wisdomEngine', () => {
  it('returns correct insight for excellent savings rate', () => {
    const result = getSavingsRateInsight(35);
    expect(result.level).toBe(WisdomLevel.EXCELLENT);
    expect(result.message).toContain('金鹅');
  });

  it('returns warning for low savings rate', () => {
    const result = getSavingsRateInsight(5);
    expect(result.level).toBe(WisdomLevel.WARNING);
    expect(result.message).toContain('饿了');
  });

  it('returns emergency fund status', () => {
    const result = getEmergencyFundInsight(1.5);
    expect(result.level).toBe(WisdomLevel.WARNING);
    expect(result.months).toBe(1.5);
  });

  it('returns freedom progress for beginner', () => {
    const result = getFreedomProgressInsight(15);
    expect(result.level).toBe(WisdomLevel.BEGINNER);
    expect(result.message).toContain('第一步');
  });
});
```

**Step 2: Run test — confirm it fails**

```bash
cd ~/Documents/绮梦帐间 && npx vitest run src/__tests__/wisdomEngine.test.ts
```

Expected: FAIL

**Step 3: Write minimal implementation**

```typescript
// src/utils/wisdomEngine.ts

export enum WisdomLevel {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  WARNING = 'warning',
  DANGER = 'danger',
  BEGINNER = 'beginner',
}

export interface Insight {
  level: WisdomLevel;
  message: string;
  emoji?: string;
  color: string;
}

const SAVINGS_RATE_INSIGHTS: Record<WisdomLevel, string[]> = {
  [WisdomLevel.EXCELLENT]: [
    "博多·舍费尔会为你骄傲。你的金鹅吃得很饱，未来会回报你。",
    "你在为未来的自己发红包。这种自律，本身就是财富。",
    "纳瓦尔说财富是睡觉时也能赚钱的资产。你的金鹅正在长大。",
  ],
  [WisdomLevel.GOOD]: [
    "金鹅在慢慢长大，继续保持。时间是你的盟友。",
    "好的储蓄习惯比高收入更重要。你在正确的路上。",
  ],
  [WisdomLevel.WARNING]: [
    "你的金鹅有点饿了。试着找到那些'隐形支出'。",
    "收入不是问题，存不下来才是。——《小狗钱钱》",
  ],
  [WisdomLevel.DANGER]: [
    "金鹅正在挨饿。这个月花的比赚的多，它在减肥。",
    "清崎说：穷人先花钱，富人先存钱。是时候改变了。",
  ],
  [WisdomLevel.BEGINNER]: [
    "每个财富故事都从第一块钱开始。",
  ],
};

const EMERGENCY_INSIGHTS: Record<WisdomLevel, string[]> = {
  [WisdomLevel.EXCELLENT]: [
    "你的安全网足够结实。即使明天不工作，也能安心生活。",
  ],
  [WisdomLevel.GOOD]: [
    "应急资金稳步积累。继续这样，自由就在不远处。",
  ],
  [WisdomLevel.WARNING]: [
    "安全网还不够大。建议储备至少 3-6 个月的生活费。",
    "摩根·豪塞尔说：容错空间是最被低估的财务指标。",
  ],
  [WisdomLevel.DANGER]: [
    "危险区。任何意外都可能让你陷入困境。优先建立应急资金。",
  ],
  [WisdomLevel.BEGINNER]: [
    "从零开始不可怕。第一个月的储备，比任何投资都重要。",
  ],
};

const FREEDOM_INSIGHTS: Record<WisdomLevel, string[]> = {
  [WisdomLevel.EXCELLENT]: [
    "你已经跨过了财务自由的第一道门槛。这是大多数人一辈子没到达的地方。",
  ],
  [WisdomLevel.GOOD]: [
    "进度不错。继续喂养金鹅，它在为你工作。",
  ],
  [WisdomLevel.WARNING]: [
    "第一步已经迈出。每一个百分比，都是你为自己赢得的时间。",
  ],
  [WisdomLevel.DANGER]: [
    "还在起点。但起点不是坏事——它是所有故事开始的地方。",
  ],
  [WisdomLevel.BEGINNER]: [
    "0% 只是起点。纳瓦尔说：'财富是拥有时间的自由。'你开始了吗？",
  ],
};

function pickMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

function getLevelColor(level: WisdomLevel): string {
  const colors: Record<WisdomLevel, string> = {
    [WisdomLevel.EXCELLENT]: '#7a9e7e',
    [WisdomLevel.GOOD]: '#6b9fcf',
    [WisdomLevel.WARNING]: '#c9923a',
    [WisdomLevel.DANGER]: '#d4a0a0',
    [WisdomLevel.BEGINNER]: '#b8af9e',
  };
  return colors[level];
}

export function getSavingsRateInsight(rate: number): Insight {
  let level: WisdomLevel;
  if (rate >= 30) level = WisdomLevel.EXCELLENT;
  else if (rate >= 20) level = WisdomLevel.GOOD;
  else if (rate >= 10) level = WisdomLevel.WARNING;
  else if (rate > 0) level = WisdomLevel.DANGER;
  else level = WisdomLevel.BEGINNER;

  return {
    level,
    message: pickMessage(SAVINGS_RATE_INSIGHTS[level]),
    color: getLevelColor(level),
  };
}

export function getEmergencyFundInsight(months: number): Insight {
  let level: WisdomLevel;
  if (months >= 6) level = WisdomLevel.EXCELLENT;
  else if (months >= 3) level = WisdomLevel.GOOD;
  else if (months >= 1) level = WisdomLevel.WARNING;
  else if (months > 0) level = WisdomLevel.DANGER;
  else level = WisdomLevel.BEGINNER;

  return {
    level,
    message: pickMessage(EMERGENCY_INSIGHTS[level]),
    color: getLevelColor(level),
  };
}

export function getFreedomProgressInsight(progress: number): Insight {
  let level: WisdomLevel;
  if (progress >= 100) level = WisdomLevel.EXCELLENT;
  else if (progress >= 50) level = WisdomLevel.GOOD;
  else if (progress >= 20) level = WisdomLevel.WARNING;
  else if (progress > 0) level = WisdomLevel.DANGER;
  else level = WisdomLevel.BEGINNER;

  return {
    level,
    message: pickMessage(FREEDOM_INSIGHTS[level]),
    color: getLevelColor(level),
  };
}
```

**Step 4: Run test — confirm it passes**

```bash
cd ~/Documents/绮梦帐间 && npx vitest run src/__tests__/wisdomEngine.test.ts
```

Expected: PASS — 4 tests passed

**Step 5: Commit**

```bash
cd ~/Documents/绮梦帐间 && git add src/utils/wisdomEngine.ts src/__tests__/wisdomEngine.test.ts && git commit -m "feat: add wisdom engine with financial insights"
```

---

## Task 3: 创建数据解释 Tooltip 组件

**Files:**
- Create: `src/components/ui/WisdomTooltip.tsx`
- Test: `src/__tests__/WisdomTooltip.test.tsx`

**Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WisdomTooltip } from '../components/ui/WisdomTooltip';

describe('WisdomTooltip', () => {
  it('renders trigger element', () => {
    render(<WisdomTooltip wisdom="Test wisdom"><span>Hover me</span></WisdomTooltip>);
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('shows tooltip on hover', () => {
    render(<WisdomTooltip wisdom="金鹅理论"><span>Hover me</span></WisdomTooltip>);
    const trigger = screen.getByText('Hover me');
    fireEvent.mouseEnter(trigger);
    expect(screen.getByText('金鹅理论')).toBeInTheDocument();
  });
});
```

**Step 2: Run test — confirm it fails**

```bash
cd ~/Documents/绮梦帐间 && npx vitest run src/__tests__/WisdomTooltip.test.tsx
```

Expected: FAIL

**Step 3: Write minimal implementation**

```typescript
// src/components/ui/WisdomTooltip.tsx

import { useState, ReactNode } from 'react';

interface WisdomTooltipProps {
  wisdom: string;
  children: ReactNode;
  detail?: string;
}

export function WisdomTooltip({ wisdom, children, detail }: WisdomTooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '280px',
            background: '#f0ebe0',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '6px 6px 14px #cdc5b8, -6px -6px 14px #fffbf5',
            zIndex: 100,
            fontSize: '13px',
            lineHeight: '1.6',
            color: '#3d3427',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontWeight: 500, marginBottom: '6px', color: '#c9923a' }}>
            💡 背后的智慧
          </div>
          <div>{wisdom}</div>
          {detail && (
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#a89f8e' }}>
              {detail}
            </div>
          )}
          <div
            style={{
              position: 'absolute',
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '0',
              height: '0',
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #f0ebe0',
            }}
          />
        </div>
      )}
    </span>
  );
}
```

**Step 4: Run test — confirm it passes**

```bash
cd ~/Documents/绮梦帐间 && npx vitest run src/__tests__/WisdomTooltip.test.tsx
```

Expected: PASS

**Step 5: Commit**

```bash
cd ~/Documents/绮梦帐间 && git add src/components/ui/WisdomTooltip.tsx src/__tests__/WisdomTooltip.test.tsx && git commit -m "feat: add WisdomTooltip component for data explanations"
```

---

## Task 4: 创建财务摘要卡片组件

**Files:**
- Create: `src/components/reports/FinancialSummary.tsx`
- Test: `src/__tests__/FinancialSummary.test.tsx`

**Step 1: Write the failing test**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FinancialSummary } from '../components/reports/FinancialSummary';

vi.mock('../utils/financialHealth', () => ({
  calcMonthlyStats: () => ({ income: 5000, expense: 3000, net: 2000, savingsRate: 40 }),
  calcEmergencyFundMonths: () => 2.5,
  calcHourlyRate: () => 120,
}));

vi.mock('../utils/wisdomEngine', () => ({
  getSavingsRateInsight: () => ({ level: 'good', message: '金鹅在长大', color: '#7a9e7e' }),
  getEmergencyFundInsight: () => ({ level: 'warning', message: '继续积累', color: '#c9923a' }),
  WisdomLevel: { EXCELLENT: 'excellent', GOOD: 'good' },
}));

describe('FinancialSummary', () => {
  it('renders summary cards', () => {
    render(<FinancialSummary transactions={[]} />);
    expect(screen.getByText('本月收入')).toBeInTheDocument();
    expect(screen.getByText('本月支出')).toBeInTheDocument();
    expect(screen.getByText('净结余')).toBeInTheDocument();
    expect(screen.getByText('储蓄率')).toBeInTheDocument();
  });
});
```

**Step 2: Run test — confirm it fails**

```bash
cd ~/Documents/绮梦帐间 && npx vitest run src/__tests__/FinancialSummary.test.tsx
```

**Step 3: Write minimal implementation**

```typescript
// src/components/reports/FinancialSummary.tsx

import { useMemo } from 'react';
import { calcMonthlyStats, calcEmergencyFundMonths, calcHourlyRate } from '../../utils/financialHealth';
import { getSavingsRateInsight, getEmergencyFundInsight } from '../../utils/wisdomEngine';
import { WisdomTooltip } from '../ui/WisdomTooltip';

interface Transaction {
  type: 'income' | 'expense';
  amount: number;
  date: number;
  category?: string;
  platform?: string;
  timeSpent?: number;
}

interface Props {
  transactions: Transaction[];
}

function AnimatedCard({ title, value, prefix = '', suffix = '', color = '#3d3427', wisdom, detail }: {
  title: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  color?: string;
  wisdom?: string;
  detail?: string;
}) {
  return (
    <div style={{
      background: '#f0ebe0',
      borderRadius: '18px',
      padding: '20px',
      boxShadow: '5px 5px 10px #cdc5b8, -5px -5px 10px #fffbf5',
      textAlign: 'center',
      position: 'relative',
    }}>
      {wisdom && (
        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
          <WisdomTooltip wisdom={wisdom} detail={detail}>
            <span style={{
              width: '20px', height: '20px', borderRadius: '50%',
              background: 'rgba(201,146,58,0.15)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', color: '#c9923a', cursor: 'help',
            }}>?</span>
          </WisdomTooltip>
        </div>
      )}
      <div style={{
        fontFamily: "'Noto Sans SC', sans-serif",
        fontSize: '10px',
        color: '#a89f8e',
        letterSpacing: '0.12em',
        marginBottom: '8px',
      }}>
        {title}
      </div>
      <div style={{
        fontFamily: "'Noto Serif SC', serif",
        fontSize: 'clamp(22px, 4vw, 32px)',
        color,
        letterSpacing: '-0.02em',
        lineHeight: 1,
      }}>
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </div>
    </div>
  );
}

export function FinancialSummary({ transactions }: Props) {
  const stats = useMemo(() => calcMonthlyStats(transactions), [transactions]);
  const emergencyMonths = useMemo(() => calcEmergencyFundMonths(transactions), [transactions]);
  const hourlyRate = useMemo(() => calcHourlyRate(transactions), [transactions]);
  
  const savingsInsight = useMemo(() => getSavingsRateInsight(stats.savingsRate), [stats.savingsRate]);
  const emergencyInsight = useMemo(() => getEmergencyFundInsight(emergencyMonths), [emergencyMonths]);

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        marginBottom: '16px',
      }}>
        <AnimatedCard
          title="本月收入"
          value={stats.income}
          prefix="¥"
          color="#6b9fcf"
          wisdom="收入是河流，储蓄是湖泊。河流再宽，没有湖泊就会干涸。"
          detail="记录所有进入你口袋的钱，无论来源。"
        />
        <AnimatedCard
          title="本月支出"
          value={stats.expense}
          prefix="¥"
          color="#c9923a"
          wisdom="清崎说：'穷人先花钱，富人先存钱。'每一笔支出都在投票给某种生活。"
          detail="不是所有支出都是坏事。投资自己的支出是资产。"
        />
        <AnimatedCard
          title="净结余"
          value={stats.net}
          prefix={stats.net >= 0 ? '¥' : '-¥'}
          color={stats.net >= 0 ? '#7a9e7e' : '#d4a0a0'}
          wisdom="结余 = 自由。这个月的结余，是你下个月选择权的存款。"
        />
        <AnimatedCard
          title="储蓄率"
          value={Math.round(stats.savingsRate)}
          suffix="%"
          color={savingsInsight.color}
          wisdom={savingsInsight.message}
          detail={`当前 ${Math.round(stats.savingsRate)}%，${stats.savingsRate >= 20 ? '优秀' : '建议提升到 20% 以上'}`}
        />
      </div>

      {/* 洞察徽章 */}
      <div style={{
        background: '#f0ebe0',
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: 'inset 3px 3px 6px #cdc5b8, inset -3px -3px 6px #fffbf5',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '11px', color: '#a89f8e' }}>💡 本月洞察</span>
        <span style={{
          fontSize: '12px',
          color: savingsInsight.color,
          fontWeight: 500,
        }}>
          {savingsInsight.message}
        </span>
        {hourlyRate > 0 && (
          <span style={{ fontSize: '11px', color: '#b8af9e' }}>
            时薪 ¥{hourlyRate}/h
          </span>
        )}
        <span style={{
          fontSize: '11px',
          color: emergencyInsight.color,
        }}>
          应急储备: {emergencyMonths.toFixed(1)} 个月
        </span>
      </div>
    </div>
  );
}
```

**Step 4: Run test — confirm it passes**

```bash
cd ~/Documents/绮梦帐间 && npx vitest run src/__tests__/FinancialSummary.test.tsx
```

**Step 5: Commit**

```bash
cd ~/Documents/绮梦帐间 && git add src/components/reports/FinancialSummary.tsx src/__tests__/FinancialSummary.test.tsx && git commit -m "feat: add FinancialSummary component with insights"
```

---

## Task 5: 扩展 Reports 页面 — 整合所有新功能

**Files:**
- Modify: `src/pages/Reports.tsx`
- Test: `src/__tests__/Reports.test.tsx` (update existing or create new)

**Step 1: 检查现有 Reports 测试**

```bash
cd ~/Documents/绮梦帐间 && ls src/__tests__/Reports* 2>/dev/null || echo "No Reports test yet"
```

**Step 2: 修改 Reports.tsx — 添加新 sections**

在现有 Reports.tsx 中，在"月度收支趋势"之前插入"财务摘要"，在"资产构成"之后追加新 sections。

具体修改点：
1. 顶部导入新增模块
2. 在 Header 下方添加 `<FinancialSummary />`
3. 在底部装饰线之前添加：
   - 净资产增长曲线（AreaChart）
   - 金鹅增长指标卡片
   - 财富自由进度条
   - 时薪转化洞察

**Step 3: 实现新增图表和卡片**

在 Reports.tsx 中实现：

```typescript
// 新增导入
import { FinancialSummary } from '../components/reports/FinancialSummary';
import { 
  calcNetWorthHistory, 
  calcFreedomProgress, 
  calcTimeCost,
  calcEmergencyFundMonths,
} from '../utils/financialHealth';
import { 
  getFreedomProgressInsight,
  getEmergencyFundInsight,
} from '../utils/wisdomEngine';
import { WisdomTooltip } from '../components/ui/WisdomTooltip';
```

新增 Sections（在现有代码中合适位置插入）：

**Section: 净资产增长曲线**
```typescript
const netWorthHistory = useMemo(() => calcNetWorthHistory(transactions), [transactions]);
```

```tsx
{/* 净资产增长曲线 */}
<div className="animate-in" style={{ marginBottom: '12px' }}>
  <Card>
    <div style={{ fontFamily: "'Noto Sans SC', sans-serif", fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>
      净资产增长
      <WisdomTooltip wisdom="清崎把人分为两类：买了资产的人，和买了负债的人。净资产 = 你拥有的资产 - 欠下的债。">
        <span style={{ marginLeft: '8px', fontSize: '11px', color: '#c9923a', cursor: 'help' }}>?</span>
      </WisdomTooltip>
    </div>
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={netWorthHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7a9e7e" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#7a9e7e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(163,158,148,0.15)" vertical={false} />
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#b8af9e', fontSize: 11 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#b8af9e', fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="netWorth" stroke="#7a9e7e" strokeWidth={2} fill="url(#netWorthGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  </Card>
</div>
```

**Section: 财务健康度卡片组**
```tsx
{/* 财务健康度 */}
<div className="animate-in" style={{ marginBottom: '12px' }}>
  <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>
    财务健康度
  </div>
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
    {/* 财富自由进度 */}
    <Card style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '10px', color: '#a89f8e', marginBottom: '8px' }}>财富自由进度</div>
      <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '28px', color: '#6b9fcf' }}>
        {Math.round(freedomProgress)}%
      </div>
      <div style={{ marginTop: '8px', height: '6px', borderRadius: '3px', background: '#e0dbd3' }}>
        <div style={{
          height: '100%', borderRadius: '3px',
          background: 'linear-gradient(90deg, #6b9fcf, #7a9e7e)',
          width: `${Math.min(freedomProgress, 100)}%`,
          transition: 'width 1s ease-out',
        }} />
      </div>
      <div style={{ fontSize: '11px', color: freedomInsight.color, marginTop: '8px' }}>
        {freedomInsight.message}
      </div>
    </Card>

    {/* 应急资金 */}
    <Card style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '10px', color: '#a89f8e', marginBottom: '8px' }}>
        应急储备
        <WisdomTooltip wisdom="摩根·豪塞尔在《金钱心理学》中说：容错空间（Margin of Safety）是最被低估的财务指标。它保护你不被生活击倒。">
          <span style={{ marginLeft: '4px', color: '#c9923a', cursor: 'help' }}>?</span>
        </WisdomTooltip>
      </div>
      <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '28px', color: emergencyInsight.color }}>
        {emergencyMonths.toFixed(1)}<span style={{ fontSize: '14px' }}>个月</span>
      </div>
      <div style={{ fontSize: '11px', color: '#a89f8e', marginTop: '8px' }}>
        目标: 6个月
      </div>
      <div style={{ fontSize: '11px', color: emergencyInsight.color, marginTop: '4px' }}>
        {emergencyInsight.message}
      </div>
    </Card>
  </div>
</div>
```

**Step 4: 测试验证**

```bash
cd ~/Documents/绮梦帐间 && npx vitest run src/__tests__/Reports.test.tsx
```

如果没有现有测试，至少运行构建检查：

```bash
cd ~/Documents/绮梦帐间 && npm run build
```

Expected: 构建成功，无 TypeScript 错误

**Step 5: Commit**

```bash
cd ~/Documents/绮梦帐间 && git add src/pages/Reports.tsx && git commit -m "feat: extend Reports with financial insights, net worth chart, freedom progress, emergency fund"
```

---

## Task 6: 创建 Sticky 锚点导航

**Files:**
- Create: `src/components/reports/ReportNav.tsx`
- Modify: `src/pages/Reports.tsx` (integrate navigation)

**Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReportNav } from '../components/reports/ReportNav';

describe('ReportNav', () => {
  it('renders navigation items', () => {
    render(<ReportNav activeSection="summary" onNavigate={() => {}} />);
    expect(screen.getByText('摘要')).toBeInTheDocument();
    expect(screen.getByText('趋势')).toBeInTheDocument();
  });

  it('calls onNavigate when clicked', () => {
    const mockNavigate = vi.fn();
    render(<ReportNav activeSection="summary" onNavigate={mockNavigate} />);
    fireEvent.click(screen.getByText('趋势'));
    expect(mockNavigate).toHaveBeenCalledWith('trend');
  });
});
```

**Step 2: Run test — confirm it fails**

```bash
cd ~/Documents/绮梦帐间 && npx vitest run src/__tests__/ReportNav.test.tsx
```

**Step 3: Write minimal implementation**

```typescript
// src/components/reports/ReportNav.tsx

interface ReportNavProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

const SECTIONS = [
  { id: 'summary', label: '摘要' },
  { id: 'trend', label: '趋势' },
  { id: 'expense', label: '支出' },
  { id: 'income', label: '收入' },
  { id: 'health', label: '健康度' },
];

export function ReportNav({ activeSection, onNavigate }: ReportNavProps) {
  return (
    <div style={{
      position: 'sticky',
      top: '0',
      zIndex: 50,
      background: 'rgba(245,240,232,0.92)',
      backdropFilter: 'blur(8px)',
      padding: '12px 0',
      marginBottom: '24px',
      borderBottom: '1px solid rgba(163,158,148,0.15)',
    }}>
      <div style={{
        display: 'flex',
        gap: '4px',
        overflowX: 'auto',
        padding: '0 4px',
      }}>
        {SECTIONS.map(section => (
          <button
            key={section.id}
            onClick={() => onNavigate(section.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: 'none',
              background: activeSection === section.id ? '#f0ebe0' : 'transparent',
              color: activeSection === section.id ? '#3d3427' : '#a89f8e',
              fontSize: '12px',
              fontFamily: "'Noto Sans SC', sans-serif",
              cursor: 'pointer',
              boxShadow: activeSection === section.id ? '2px 2px 4px #cdc5b8, -2px -2px 4px #fffbf5' : 'none',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {section.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

**Step 4: Run test — confirm it passes**

```bash
cd ~/Documents/绮梦帐间 && npx vitest run src/__tests__/ReportNav.test.tsx
```

**Step 5: Commit**

```bash
cd ~/Documents/绮梦帐间 && git add src/components/reports/ReportNav.tsx src/__tests__/ReportNav.test.tsx && git commit -m "feat: add sticky report navigation"
```

---

## Task 7: 整合并运行全量测试

**Step 1: 运行全部测试**

```bash
cd ~/Documents/绮梦帐间 && npx vitest run
```

Expected: All tests pass

**Step 2: 构建验证**

```bash
cd ~/Documents/绮梦帐间 && npm run build
```

Expected: Build succeeds with no errors

**Step 3: 启动 dev server 手动验证**

```bash
cd ~/Documents/绮梦帐间 && npm run dev
```

打开 `http://localhost:5173`，导航到 Reports 页面，验证：
- [ ] 财务摘要卡片显示正确
- [ ] 洞察徽章显示随机智慧格言
- [ ] Tooltip 悬停显示财富思想
- [ ] 净资产增长曲线渲染
- [ ] 财富自由进度条有动画
- [ ] 应急资金卡片显示正确
- [ ] Sticky 导航可点击跳转

**Step 4: Final commit**

```bash
cd ~/Documents/绮梦帐间 && git add -A && git commit -m "feat: complete Reports extension with financial insights and wealth wisdom"
```

---

## 任务总览

| 任务 | 内容 | 预估时间 |
|------|------|---------|
| Task 1 | 财务健康计算模块 | 15 min |
| Task 2 | 财富智慧引擎 | 15 min |
| Task 3 | WisdomTooltip 组件 | 10 min |
| Task 4 | FinancialSummary 组件 | 20 min |
| Task 5 | 扩展 Reports 页面 | 25 min |
| Task 6 | Sticky 导航 | 10 min |
| Task 7 | 整合测试 | 15 min |
| **总计** | | **~110 min** |

---

## 验证标准

- [ ] 7 个任务全部完成，每步都有 commit
- [ ] 所有测试通过 (`npx vitest run`)
- [ ] 构建成功 (`npm run build`)
- [ ] 手动验证所有新增功能正常
- [ ] 代码符合 andrej-karpathy-coding 原则（最小变更、匹配现有风格）
