# V1.0 — 星体页 + 多账户管理 — 实现计划

> **For implementer:** Use TDD throughout. Write failing test first. Watch it fail. Then implement.
> **Taste Params:** DESIGN_VARIANCE: 8 | MOTION_INTENSITY: 6 | VISUAL_DENSITY: 4
> **Style:** 暖米色新拟物 (Cream Neumorphism) | No Tailwind | CSS Variables + Inline Styles

**Goal:** 完成欲望星体页（SVG许愿瓶 + 存入/取出/达成）+ 多账户管理基础

---

## Task 1: 星体数据库 + Hook 扩展

**Files:**
- Modify: `src/store/db.ts`
- Modify: `src/store/useLedger.ts`

**Step 1: Write failing test**
```typescript
// src/__tests__/useWishes.test.ts
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWishes } from '../store/useWishes';

describe('useWishes', () => {
  it('initializes with empty wishes', async () => {
    const { result } = renderHook(() => useWishes());
    await act(async () => {});
    expect(Array.isArray(result.current.wishes)).toBe(true);
  });

  it('adds a wish', async () => {
    const { result } = renderHook(() => useWishes());
    await act(async () => {
      await result.current.addWish({ name: '新手机', targetPrice: 5000 });
    });
    expect(result.current.wishes.length).toBe(1);
  });
});
```

**Step 2: Run test — confirm it fails**

**Step 3: Create `src/store/useWishes.ts`**
```typescript
import { useState, useEffect } from 'react';
import { db, Wish } from './db';

export function useWishes() {
  const [wishes, setWishes] = useState<Wish[]>([]);

  useEffect(() => {
    db.wishes.toArray().then(setWishes);
  }, []);

  const addWish = async (data: { name: string; targetPrice: number }) => {
    const wish: Omit<Wish, 'id' | 'createdAt' | 'currentBalance' | 'status'> = {
      name: data.name,
      targetPrice: data.targetPrice,
    };
    await db.wishes.add({
      ...wish,
      id: crypto.randomUUID(),
      currentBalance: 0,
      status: 'building',
      createdAt: Date.now(),
    });
    const all = await db.wishes.toArray();
    setWishes(all);
  };

  const depositToWish = async (wishId: string, amount: number) => {
    const wish = await db.wishes.get(wishId);
    if (!wish) return;
    const newBalance = wish.currentBalance + amount;
    const newStatus = newBalance >= wish.targetPrice ? 'achieved' : 'building';
    await db.wishes.update(wishId, {
      currentBalance: newBalance,
      status: newStatus,
      achievedAt: newStatus === 'achieved' ? Date.now() : undefined,
    });
    const all = await db.wishes.toArray();
    setWishes(all);
  };

  const withdrawFromWish = async (wishId: string, amount: number) => {
    const wish = await db.wishes.get(wishId);
    if (!wish) return;
    await db.wishes.update(wishId, {
      currentBalance: Math.max(0, wish.currentBalance - amount),
      status: 'withdrawn',
    });
    const all = await db.wishes.toArray();
    setWishes(all);
  };

  const deleteWish = async (wishId: string) => {
    await db.wishes.delete(wishId);
    const all = await db.wishes.toArray();
    setWishes(all);
  };

  return { wishes, addWish, depositToWish, withdrawFromWish, deleteWish };
}
```

**Step 4: Run test — confirm it passes**

**Step 5: Commit** `git add -A && git commit -m "feat: add useWishes hook with deposit/withdraw"`

---

## Task 2: SVG 许愿瓶组件

**Files:**
- Create: `src/components/wishes/WishBottle.tsx`
- Create: `src/__tests__/WishBottle.test.tsx`

**Step 1: Write failing test**
```typescript
// src/__tests__/WishBottle.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { WishBottle } from '../components/wishes/WishBottle';

describe('WishBottle', () => {
  it('renders bottle SVG', () => {
    const { container } = render(
      <WishBottle name="新手机" currentBalance={3000} targetPrice={5000} status="building" />
    );
    expect(container.querySelector('svg')).toBeTruthy();
  });
});
```

**Step 2: Run test — confirm it fails**

**Step 3: Create `src/components/wishes/WishBottle.tsx`**

SVG bottle design (neumorphism style, cream tones):
- Bottle shape: rounded flask silhouette
- Fill level: liquid fill from bottom, height = (currentBalance/targetPrice) * 100%
- Status colors:
  - building: fill #6b9fcf (柔蓝) with subtle glow
  - achieved: fill #c9923a (琥珀金) with burst glow effect
  - withdrawn: fill #c5bdb0 (灰褐) no glow
- Label below: wish name + "¥currentBalance / ¥targetPrice"
- No emoji — pure SVG

**Design specs per taste skill:**
- Anti-center bias: layout offset, not centered hero
- SVG paths for bottle (no emoji, no icon library)
- Spring physics for hover: scale(1.02) on hover, scale(0.97) on active
- Liquid glass refraction: inner glow effect on bottle

**Step 4: Run test — confirm it passes**

**Step 5: Commit** `git add -A && git commit -m "feat: add SVG WishBottle component"`

---

## Task 3: 星体页 (Wishes Page)

**Files:**
- Modify: `src/pages/Wishes.tsx`

**Step 1: Write failing test**
```typescript
// src/__tests__/WishesPage.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Wishes } from '../pages/Wishes';

describe('Wishes page', () => {
  it('renders empty state', () => {
    render(<Wishes />);
    expect(screen.getByText(/暂无星体/i)).toBeTruthy();
  });
});
```

**Step 2: Run test — confirm it fails**

**Step 3: Write `src/pages/Wishes.tsx`**

Layout: Asymmetric bento, horizontal scroll for wish cards
- Title: "欲望星体" (top left, not centered)
- Add button: "+" or "添加新星体" (neumorphic raised button)
- Wish list: horizontal scroll container, each wish is WishBottle component
- Cards: different widths (2fr 1fr 1fr pattern per taste Rule NO 3-column equal)
- Empty state: inset card with "开始设定你的第一个星体吧"
- Mobile: single column stack

**Interaction:**
- Tap wish bottle → expand to detail modal
- Detail modal: deposit / withdraw / delete / history

**Step 4: Run test — confirm it passes**

**Step 5: Commit** `git add -A && git commit -m "feat: add Wishes page with horizontal scroll"`

---

## Task 4: 支出决策后关联星体

**Files:**
- Modify: `src/pages/Dashboard.tsx`
- Create: `src/components/wishes/WishPicker.tsx`

**Step 1: Write failing test**
```typescript
// Test that after "worth" decision, if user has wishes, a WishPicker appears
```

**Step 2: Run test — confirm it fails**

**Step 3: Create `src/components/wishes/WishPicker.tsx`**

Bottom sheet modal:
- List all building wishes (as small WishBottle previews)
- "不存入" button to skip
- Select wish → call depositToWish(wishId, amount)
- If wish reaches target → celebrate animation (gold shimmer)

**Step 4: Run test — confirm it passes**

**Step 5: Commit** `git add -A && git commit -m "feat: integrate wish deposit from expense flow"`

---

## Task 5: 星体详情 Modal

**Files:**
- Create: `src/components/wishes/WishDetail.tsx`

**Step 1: Write failing test**

**Step 2: Create `src/components/wishes/WishDetail.tsx`**

Modal content:
- Wish name + large progress bar (liquid fill SVG)
- Deposit input: amount field + confirm button
- Withdraw button (only if balance > 0)
- Delete wish (with confirmation)
- Close button

**Step 3: Run test — confirm it passes**

**Step 4: Commit** `git add -A && git commit -m "feat: add WishDetail modal with deposit/withdraw"`

---

## Task 6: 多账户管理基础 (Accounts)

**Files:**
- Modify: `src/store/db.ts`
- Create: `src/store/useAccounts.ts`
- Modify: `src/pages/Settings.tsx` (simple accounts page)

**Step 1: Add Account interface to db.ts**
```typescript
export interface Account {
  id: string;
  name: string;
  type: 'bank' | 'wechat' | 'alipay' | 'cash';
  balance: number;
  createdAt: number;
}
```

**Step 2: Create useAccounts hook**

**Step 3: Create simple accounts list in pages/Settings.tsx**

Simple version:
- List 4 default accounts: 招行卡 / 微信钱包 / 支付宝 / 现金
- Show name + balance
- No complex editing for now

**Step 4: Commit** `git add -A && git commit -m "feat: add accounts management foundation"`

---

## 总体验证清单

```bash
npm run build  # 无错误
npx vitest run  # 全部测试通过
```

---

*计划状态：待执行。执行模式：subagent-driven，串行（maxConcurrent=2）*
*Style: design-taste-frontend (DESIGN_VARIANCE: 8, MOTION_INTENSITY: 6, VISUAL_DENSITY: 4)*