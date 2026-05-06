# Dashboard + 魔法输入框 — 实现计划

> **For implementer:** Use TDD throughout. Write failing test first. Watch it fail. Then implement.

**Goal:** 完成 V0.1+D 的核心交付物：清理粒子系统 + Dashboard 骨架 + 魔法输入框 + 支出决策流程

**Architecture:** 基于 React + Vite + TypeScript + React Router v6 + Dexie.js(IndexedDB)。页面路由使用 react-router-dom Outlet 模式，Tab 导航固定底部。数据通过自定义 hook `useLedger` 操作 Dexie 数据库。

**Tech Stack:** react, react-dom, react-router-dom, dexie, vite, typescript, CSS Variables

---

## 前置依赖

- [ ] Task 0（清理）必须最先完成，提供干净的代码基底

---

## Task 1: 清理 Three.js 粒子系统

**Files:**
- Delete: `src/components/particles/` (整个目录)
- Modify: `src/App.tsx`
- Modify: `package.json`
- Modify: `src/index.css` (若有粒子残留样式)

**Step 1: Write the failing test**
（清理任务无需测试，跳过 TDD）

**Step 2: 确认粒子代码存在**
```bash
ls src/components/particles/
grep -r "ParticleCanvas\|ParticleField\|particleShader" src/
```
Expected: 文件存在 / grep 有结果

**Step 3: 执行清理**
```bash
# 删除粒子目录
rm -rf src/components/particles/

# 从 App.tsx 移除 ParticleCanvas 引用和 theme 状态
# 从 package.json 移除: three, @react-three/fiber, @react-three/drei, gsap
# 重新安装依赖
npm install
```

**Step 4: 验证**
```bash
ls src/components/particles/  # Expected: No such file or directory
grep -r "ParticleCanvas" src/  # Expected: (empty)
npm run dev  # Expected: 正常启动，无编译错误
```

**Step 5: Commit**
`git add -A && git commit -m "feat: remove Three.js particle system"`

---

## Task 2: 更新 global.css 为 v3 色彩系统

**Files:**
- Modify: `src/styles/global.css`

**Step 1: Write the failing test**
（CSS 变更无需单元测试，通过人工验收）

**Step 2: 验证当前色彩值**
```bash
grep -E "bg-primary|text-primary|accent-blue" src/styles/global.css | head -10
```
Expected: 显示当前使用的 CSS 变量

**Step 3: 更新 global.css 为 v3 色彩系统**

按 v3 文档定义的色彩替换所有变量值：
- 背景 #0D0D10 / 卡片 #161619 / 主文字 #EEE8DC / 次文字 #7A756E
- 强调蓝 #4FC3F7 / 强调金 #E8B84B / 成功绿 #6DBF82 / 损耗红 #D97373
- 添加 Noto Serif SC + Noto Sans SC Google Fonts 引用
- 删除 HYShuSong 字体引用
- 更新 border-subtle 为 rgba(255,255,255,0.07)
- 卡片圆角统一为 16px，内边距 20px

**Step 4: 验证**
```bash
grep "#0D0D10\|#161619\|#EEE8DC\|#4FC3F7\|#E8B84B" src/styles/global.css
# Expected: 5行颜色值
grep "Noto Serif\|Noto Sans" src/styles/global.css
# Expected: 2行 font-face 引用
```

**Step 5: Commit**
`git add src/styles/global.css && git commit -m "feat: update color system to v3 dark gold luxury palette"`

---

## Task 3: 创建 React Router 路由结构

**Files:**
- Create: `src/App.tsx` (重写)
- Create: `src/components/ui/TabBar.tsx`
- Create: `src/components/ui/GlassCard.tsx`

**Step 1: Write the failing test**
```typescript
// src/__tests__/App.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';

describe('App routing', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container.querySelector('.tab-bar')).toBeTruthy();
  });
});
```

**Step 2: Run test — confirm it fails**
```bash
npm run test -- --run src/__tests__/App.test.tsx
# Expected: FAIL — module not found 或 test 对 App 有断言
```

**Step 3: Write minimal implementation**

`src/components/ui/TabBar.tsx` — 底部 Tab 栏：
- 4个 Tab：首页（/）、星体（/wishes）、工作台（/workbench）、报表（/reports）
- 当前路由高亮（有颜色变化）
- 固定在底部 `position: fixed`
- SVG 图标（不用图标库，内联简单 SVG path）

`src/components/ui/GlassCard.tsx` — 玻璃质感卡片：
```typescript
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}
// 样式：background: var(--glass-bg), backdrop-filter: blur, border: 1px solid var(--glass-border), border-radius: 16px
```

`src/App.tsx` — 路由 + TabBar 布局：
```typescript
// 使用 BrowserRouter + Routes + Route + Outlet
// TabBar 放在 <Outlet /> 下方，固定底部
// 4个路由各自 render 一个占位组件（Dashboard/Wishes/Workbench/Reports）
```

**Step 4: Run test — confirm it passes**
```bash
npm run test -- --run src/__tests__/App.test.tsx
# Expected: PASS
```

**Step 5: Commit**
`git add -A && git commit -m "feat: add React Router with bottom TabBar navigation"`

---

## Task 4: 创建 Dashboard 页面骨架

**Files:**
- Create: `src/pages/Dashboard.tsx`
- Create: `src/pages/Wishes.tsx`
- Create: `src/pages/Workbench.tsx`
- Create: `src/pages/Reports.tsx`

**Step 1: Write the failing test**
```typescript
// src/__tests__/Dashboard.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Dashboard from '../../pages/Dashboard';

describe('Dashboard page', () => {
  it('renders total asset display', () => {
    const { getByText } = render(<Dashboard />);
    expect(getByText('总资产')).toBeTruthy();
  });
});
```

**Step 2: Run test — confirm it fails**
```bash
npm run test -- --run src/__tests__/Dashboard.test.tsx
# Expected: FAIL — module not found
```

**Step 3: Write minimal implementation**

Dashboard 页面结构：
- 顶部：页面标题 "绮梦账间" 左对齐 + 副标题 "总资产"
- 中间：总资产数字（大号字体，使用 Noto Serif SC）
- 下方：快捷统计行（今日收入 / 今日支出 / 本周趋势）
- 最下方：最近3条记录列表
- TabBar 之上留出 padding-bottom

Wishes/Workbench/Reports 暂时是占位组件，return 对应页面标题。

**Step 4: Run test — confirm it passes**
```bash
npm run test -- --run src/__tests__/Dashboard.test.tsx
# Expected: PASS
```

**Step 5: Commit**
`git add -A && git commit -m "feat: add Dashboard page skeleton with asset display"`

---

## Task 5: 创建 Dexie 数据库和 useLedger Hook

**Files:**
- Create: `src/store/db.ts`
- Create: `src/store/useLedger.ts`

**Step 1: Write the failing test**
```typescript
// src/__tests__/useLedger.test.ts
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLedger } from '../store/useLedger';

describe('useLedger hook', () => {
  it('initializes with empty transactions', async () => {
    const { result } = renderHook(() => useLedger());
    await act(async () => {});
    expect(Array.isArray(result.current.transactions)).toBe(true);
  });
});
```

**Step 2: Run test — confirm it fails**
```bash
npm run test -- --run src/__tests__/useLedger.test.ts
# Expected: FAIL — module not found
```

**Step 3: Write minimal implementation**

`src/store/db.ts` — Dexie 数据库定义：
```typescript
import Dexie, { Table } from 'dexie';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  platform?: string;
  bossName?: string;
  judgment?: 'worthy' | 'unworthy';
  timeSpent?: number;
  wishId?: string;
  note?: string;
  date: number;
  createdAt: number;
}

export interface Wish {
  id: string;
  name: string;
  targetPrice: number;
  currentBalance: number;
  status: 'building' | 'achieved' | 'withdrawn';
  createdAt: number;
  achievedAt?: number;
}

class VaultDatabase extends Dexie {
  transactions!: Table<Transaction>;
  wishes!: Table<Wish>;
  constructor() {
    super('vault');
    this.version(1).stores({
      transactions: '++id, type, date',
      wishes: '++id, status'
    });
  }
}
export const db = new VaultDatabase();
```

`src/store/useLedger.ts` — 记账 Hook：
```typescript
import { useState, useEffect } from 'react';
import { db, Transaction } from './db';

export function useLedger() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalAsset, setTotalAsset] = useState(0);

  useEffect(() => {
    // 从 IndexedDB 加载所有记录
    db.transactions.toArray().then(setTransactions);
  }, []);

  // 计算总资产
  useEffect(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    setTotalAsset(income - expense);
  }, [transactions]);

  const addTransaction = async (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const id = crypto.randomUUID();
    await db.transactions.add({ ...tx, id, createdAt: Date.now() });
    const all = await db.transactions.toArray();
    setTransactions(all);
  };

  return { transactions, totalAsset, addTransaction };
}
```

**Step 4: Run test — confirm it passes**
```bash
npm run test -- --run src/__tests__/useLedger.test.ts
# Expected: PASS
```

**Step 5: Commit**
`git add -A && git commit -m "feat: add Dexie database and useLedger hook"`

---

## Task 6: 魔法输入框 — 解析引擎

**Files:**
- Create: `src/components/magic/parseInput.ts`
- Create: `src/__tests__/parseInput.test.ts`

**Step 1: Write the failing test**
```typescript
// src/__tests__/parseInput.test.ts
import { describe, it, expect } from 'vitest';
import { parseInput, ParseResult } from '../components/magic/parseInput';

describe('parseInput', () => {
  it('parses income: 比心150', () => {
    const result = parseInput('比心150');
    expect(result.type).toBe('income');
    expect(result.platform).toBe('比心');
    expect(result.amount).toBe(150);
  });

  it('parses income: 比心30老板小明', () => {
    const result = parseInput('比心30老板小明');
    expect(result.type).toBe('income');
    expect(result.platform).toBe('比心');
    expect(result.amount).toBe(30);
    expect(result.bossName).toBe('小明');
  });

  it('parses expense: 打车30', () => {
    const result = parseInput('打车30');
    expect(result.type).toBe('expense');
    expect(result.amount).toBe(30);
    expect(result.category).toBe('交通');
  });

  it('returns incomplete when no type detected', () => {
    const result = parseInput('50');
    expect(result.complete).toBe(false);
  });
});
```

**Step 2: Run test — confirm it fails**
```bash
npm run test -- --run src/__tests__/parseInput.test.ts
# Expected: FAIL — parseInput not exported or module not found
```

**Step 3: Write minimal implementation**

`src/components/magic/parseInput.ts`：
```typescript
export interface ParseResult {
  type: 'income' | 'expense' | null;
  platform?: string;
  category?: string;
  amount: number;
  bossName?: string;
  timeSpent?: number;
  note?: string;
  complete: boolean;  // 信息是否完整可记账
  missingFields: string[];  // 缺哪些字段
}

const PLATFORMS = ['比心', '微信', '抖音', '小红书', '建行', '招行'];
const EXPENSE_KEYWORDS = ['花了', '支出', '买', '消费', '转出', '打车', '吃饭', '外卖'];
const INCOME_KEYWORDS = ['转', '收到', '收入', '到账'];
const BOSS_KEYWORDS = ['老板', '甲', '乙', '丙', '丁'];
const TIME_KEYWORDS = ['h', '小时', '分钟'];

const EXPENSE_CATEGORIES: Record<string, string> = {
  '打车': '交通', '地铁': '交通', '公交': '交通', '油费': '交通', '停车': '交通',
  '吃饭': '餐饮', '外卖': '餐饮', '零食': '餐饮', '咖啡': '餐饮',
  '游戏': '娱乐', '电影': '娱乐', '音乐': '娱乐', '演出': '娱乐',
  '衣服': '购物', '电子产品': '购物', '日用品': '购物',
  '房租': '住房', '水电': '住房', '物业': '住房',
  '买药': '医疗', '门诊': '医疗',
  '话费': '通讯', '网络': '通讯',
};

function extractNumber(text: string): number {
  const nums = text.match(/\d+/g);
  if (!nums) return 0;
  return Math.max(...nums.map(Number));
}

function extractBossName(text: string): string | undefined {
  for (const kw of BOSS_KEYWORDS) {
    const idx = text.indexOf(kw);
    if (idx !== -1) {
      const after = text.slice(idx + kw.length).trim();
      const match = after.match(/^([^\s\d]+)/);
      if (match) return match[1];
    }
  }
  return undefined;
}

function extractTimeSpent(text: string): number | undefined {
  for (const kw of TIME_KEYWORDS) {
    if (text.includes(kw)) {
      const num = text.match(/\d+/);
      if (num) return parseInt(num[0], 10);
    }
  }
  return undefined;
}

function detectPlatform(text: string): string | undefined {
  for (const p of PLATFORMS) {
    if (text.includes(p)) return p;
  }
  return undefined;
}

function detectCategory(text: string): string {
  for (const [keyword, category] of Object.entries(EXPENSE_CATEGORIES)) {
    if (text.includes(keyword)) return category;
  }
  return '其他';
}

export function parseInput(input: string): ParseResult {
  const type = INCOME_KEYWORDS.some(k => input.includes(k)) ? 'income'
    : EXPENSE_KEYWORDS.some(k => input.includes(k)) ? 'expense'
    : null;

  const amount = extractNumber(input);
  const platform = detectPlatform(input);
  const bossName = extractBossName(input);
  const timeSpent = extractTimeSpent(input);

  if (!type) {
    return { type: null, amount, complete: false, missingFields: ['type'], platform, bossName, timeSpent };
  }

  if (type === 'income') {
    const missingFields: string[] = [];
    if (!platform) missingFields.push('platform');
    const complete = !!platform;
    return { type, platform, amount, bossName, timeSpent, complete, missingFields, note: input };
  }

  if (type === 'expense') {
    const category = detectCategory(input);
    return { type, category, amount, timeSpent, complete: true, missingFields: [], note: input };
  }

  return { type: null, amount: 0, complete: false, missingFields: ['type'] };
}
```

**Step 4: Run test — confirm it passes**
```bash
npm run test -- --run src/__tests__/parseInput.test.ts
# Expected: PASS
```

**Step 5: Commit**
`git add -A && git commit -m "feat: implement magic input parser engine"`

---

## Task 7: 魔法输入框组件

**Files:**
- Create: `src/components/magic/MagicInput.tsx`
- Create: `src/__tests__/MagicInput.test.tsx`

**Step 1: Write the failing test**
```typescript
// src/__tests__/MagicInput.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MagicInput from '../components/magic/MagicInput';

describe('MagicInput', () => {
  it('renders input field', () => {
    render(<MagicInput onSubmit={async () => {}} />);
    expect(screen.getByPlaceholderText(/输入金额/)).toBeTruthy();
  });

  it('calls onSubmit with parsed result on Enter', async () => {
    let submitted: any;
    render(<MagicInput onSubmit={async (r) => { submitted = r; }} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '比心150' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    // onSubmit should be called with parsed result
    expect(submitted).toBeTruthy();
    expect(submitted.type).toBe('income');
  });
});
```

**Step 2: Run test — confirm it fails**
```bash
npm run test -- --run src/__tests__/MagicInput.test.tsx
# Expected: FAIL
```

**Step 3: Write minimal implementation**

`src/components/magic/MagicInput.tsx`：
- 受控 input，onChange 更新内部 state
- onKeyDown(Enter) → 调用 `parseInput(inputValue)` → 将结果传给 `onSubmit`
- Placeholder: "输入金额，自动识别收入或支出…"
- focus 时有边框亮起效果（冰蓝）
- 输入框外层包裹 glass-card div

**Step 4: Run test — confirm it passes**
```bash
npm run test -- --run src/__tests__/MagicInput.test.tsx
# Expected: PASS
```

**Step 5: Commit**
`git add -A && git commit -m "feat: add MagicInput component"`

---

## Task 8: Toast 提示组件

**Files:**
- Create: `src/components/ui/Toast.tsx`
- Create: `src/components/ui/ToastContainer.tsx`

**Step 1: Write the failing test**
```typescript
// src/__tests__/Toast.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToastProvider, useToast } from '../components/ui/Toast';
import { describe as describeHook, it as itHook, expect as expectHook } from 'vitest';

describe('Toast', () => {
  it('shows message', async () => {
    function TestComponent() {
      const { showToast } = useToast();
      return <button onClick={() => showToast('test message')}>Show</button>;
    }
    render(<ToastProvider><TestComponent /></ToastProvider>);
    // click and verify
  });
});
```

**Step 2: Run test — confirm it fails**
```bash
npm run test -- --run src/__tests__/Toast.test.tsx
# Expected: FAIL
```

**Step 3: Write minimal implementation**

`src/components/ui/Toast.tsx`：
```typescript
// useToast hook + ToastProvider
// toast state: { id, message, type: 'success' | 'info' }
// 自动2秒后消失，CSS transition opacity
// 位置：页面底部居中，z-index 高
// 样式：background #161619, border-radius 12px, 背景 blur
```

**Step 4: Run test — confirm it passes**
```bash
npm run test -- --run src/__tests__/Toast.test.tsx
# Expected: PASS
```

**Step 5: Commit**
`git add -A && git commit -m "feat: add Toast notification system"`

---

## Task 9: 支出决策卡片

**Files:**
- Create: `src/components/magic/ExpenseDecision.tsx`
- Create: `src/__tests__/ExpenseDecision.test.tsx`

**Step 1: Write the failing test**
```typescript
// src/__tests__/ExpenseDecision.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExpenseDecision from '../components/magic/ExpenseDecision';

describe('ExpenseDecision', () => {
  it('renders expense amount', () => {
    render(<ExpenseDecision amount={30} category="交通" onConfirm={async () => {}} onCancel={async () => {}} />);
    expect(screen.getByText('30')).toBeTruthy();
    expect(screen.getByText('交通')).toBeTruthy();
  });

  it('shows worthy/unworthy buttons', () => {
    render(<ExpenseDecision amount={30} category="交通" onConfirm={async () => {}} onCancel={async () => {}} />);
    expect(screen.getByText('值得')).toBeTruthy();
    expect(screen.getByText('不值')).toBeTruthy();
  });
});
```

**Step 2: Run test — confirm it fails**
```bash
npm run test -- --run src/__tests__/ExpenseDecision.test.tsx
# Expected: FAIL
```

**Step 3: Write minimal implementation**

`ExpenseDecision.tsx`：
- Props: `amount`, `category`, `onConfirm(type: 'worthy'|'unworthy')`, `onCancel`
- 底部滑入动画（CSS translateY + transition）
- 两列按钮布局："值得"（绿色调）/ "不值"（红色调）
- 点击时按钮边框亮起 + 确认后调用 `onConfirm`
- "取消"文字按钮在右下

**Step 4: Run test — confirm it passes**
```bash
npm run test -- --run src/__tests__/ExpenseDecision.test.tsx
# Expected: PASS
```

**Step 5: Commit**
`git add -A && git commit -m "feat: add ExpenseDecision card with worthy/unworthy flow"`

---

## Task 10: 补充表单组件（Modal）

**Files:**
- Create: `src/components/magic/SupplementForm.tsx`
- Create: `src/__tests__/SupplementForm.test.tsx`

**Step 1: Write the failing test**
```typescript
// src/__tests__/SupplementForm.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SupplementForm from '../components/magic/SupplementForm';

describe('SupplementForm', () => {
  it('renders income form fields', () => {
    const incomplete = { type: 'income', amount: 150, complete: false, missingFields: ['platform'] };
    render(<SupplementForm initial={incomplete} onConfirm={async () => {}} onCancel={async () => {}} />);
    expect(screen.getByText('补充信息')).toBeTruthy();
  });
});
```

**Step 2: Run test — confirm it fails**
```bash
npm run test -- --run src/__tests__/SupplementForm.test.tsx
# Expected: FAIL
```

**Step 3: Write minimal implementation**

`SupplementForm.tsx`：
- Props: `initial: ParseResult`, `onConfirm(data: ParseResult)`, `onCancel`
- Modal 遮罩层（半透明黑色背景，点击遮罩不关闭）
- 根据 `missingFields` 显示对应表单项：
  - 收入：平台下拉（比心/微信/抖音/小红书/建行/招行）+ 老板名（可选）+ 金额（预填）
  - 支出：分类下拉（交通/餐饮/娱乐/购物/住房/医疗/通讯/其他）+ 金额（预填）+ 备注
- "确认" 按钮提交，"取消" 按钮关闭

**Step 4: Run test — confirm it passes**
```bash
npm run test -- --run src/__tests__/SupplementForm.test.tsx
# Expected: PASS
```

**Step 5: Commit**
`git add -A && git commit -m "feat: add SupplementForm modal for incomplete inputs"`

---

## Task 11: Dashboard 整合 — 数据流串联

**Files:**
- Modify: `src/pages/Dashboard.tsx`
- Modify: `src/App.tsx`

**Step 1: Write the failing test**
（整合阶段通过手动验收）

**Step 2: 验证当前状态**
```bash
npm run dev  # 确认能正常启动
```

**Step 3: 实现**

Dashboard.tsx：
- `const { transactions, totalAsset, addTransaction } = useLedger()`
- 总资产数字显示 `totalAsset`，保留现有数字滚动动画
- 快捷统计行：今日收入/支出（从 transactions 过滤今日计算）
- 最近3条记录：从 transactions 取最新3条，显示金额+类型+时间

MagicInput → 数据流：
1. MagicInput onSubmit → 调用 `parseInput`
2. 若 `result.complete === true` 且 `result.type === 'income'` → 直接 `addTransaction`
3. 若 `result.complete === true` 且 `result.type === 'expense'` → 弹出 `ExpenseDecision`
4. 若 `result.complete === false` → 弹出 `SupplementForm` → 用户确认后 `addTransaction`
5. `ExpenseDecision` 的 `onConfirm(type)` → 弹出 `SupplementForm`（支出模式）→ `addTransaction`

Toast 集成：在 App.tsx 外层包 `<ToastProvider>`，在 Dashboard 页面用 `useToast().showToast()` 显示成功反馈。

**Step 4: 验证**
```bash
npm run dev  # 启动后打开浏览器
# 输入 "比心150" → 回车 → toast 显示 "+150 元（比心收入）"
# 输入 "打车30" → 回车 → 出现支出决策卡片
# 点"值得" → 补充表单出现
# 点"不值" → toast 显示 "支出 30 元（交通，不值）"
```

**Step 5: Commit**
`git add -A && git commit -m "feat: integrate Dashboard with magic input flow and Toast"`

---

## 总体验证清单

```bash
npm run dev  # 正常启动
npm run test -- --run  # 所有测试通过
npm run build  # 无编译错误
```

---

*计划状态：待执行。执行模式：subagent-driven，串行（maxConcurrent=2）*
