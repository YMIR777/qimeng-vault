# 绮梦账间 — 四大功能升级设计文档

> 日期：2026-05-11
> 状态：设计已确认，待实现

---

## 设计原则（taste-skill）

- 配色：米白 neumorphism（#f5f0e8）+ 金色点缀（#c9923a）
- 字体：Noto Sans SC / Noto Serif SC（中文）
- 动画：spring cubic-bezier(0.34, 1.56, 0.64, 1)，stagger 进入
- 禁止：纯黑 #000000、霓虹外发光、Tailwind
- 样式：inline styles only
- 触屏：粒子/悬停交互在 touch device 上降级

---

## 功能一：周期性记账（Recurring Transactions）

### 需求场景
每月固定支出（房租、iCloud、VIP订阅）自动入账，减少重复操作。

### 数据模型

```typescript
interface RecurringRule {
  id: string;
  name: string;           // "饿了么会员"
  amount: number;          // 金额（正数）
  type: 'expense' | 'income';
  category?: string;       // 支出时必须
  accountId: string;       // 扣款账户
  period: 'monthly' | 'weekly' | 'yearly';
  dayOfMonth?: number;     // 每月几号（1-31）
  dayOfWeek?: number;      // 每周周几（0=周日）
  nextDue: number;         // 下次触发时间戳
  active: boolean;
  lastTriggered: number;   // 上次触发时间戳（防重复）
  autoRecord: boolean;     // true=直接入账，false=弹窗确认
  note?: string;
  createdAt: number;
}
```

**触发逻辑：**
- App 启动时检查 `nextDue <= now && active === true`
- 执行后更新 `lastTriggered = now`
- 计算下一次 `nextDue`：
  - `monthly` → `nextDue = 每月dayOfMonth 0:00`
  - `weekly` → `nextDue = 下周 dayOfWeek 0:00`
  - `yearly` → `nextDue = 明年同日 0:00`

### UI 设计

**Settings 页面 →「自动记账」Tab：**

```
┌──────────────────────────────────────┐
│  ⚙️ 设置         [自动记账]           │
├──────────────────────────────────────┤
│                                      │
│  总资产 ¥100.00                       │
│                                      │
│  [自动记账]                          │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ ● 饿了么会员   ¥25/月  [暂停] │  │
│  │   每月1号 自动入账  微信       │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ ○ iCloud    ¥6/月  [启用]     │  │
│  │   每月5号  需确认    支付宝    │  │
│  └────────────────────────────────┘  │
│                                      │
│  [+ 新增自动记账]                    │
└──────────────────────────────────────┘
```

- 点击条目 → 展开编辑（名称/金额/日期/账户/自动or确认/分类）
- 暂停按钮：toggle active，暂停时显示为灰色"已暂停"
- 底部 "+ 新增自动记账" 按钮

**触发通知：**
- `autoRecord=true`：自动入账，Toast 提示"+25元（饿了么会员·自动记账）"
- `autoRecord=false`：弹窗确认，用户点"确认入账"或"跳过"

### 组件清单

| 组件 | 说明 |
|------|------|
| `src/store/useRecurring.ts` | 周期规则 hook（CRUD + 触发逻辑） |
| `src/store/db.ts` 新增 | `recurringRules` table（version 5） |
| `src/pages/Settings.tsx` | 新增"自动记账" Tab |
| `src/components/recurring/RecurringRuleCard.tsx` | 单条规则卡片 |
| `src/components/recurring/RecurringRuleModal.tsx` | 新增/编辑弹窗 |

---

## 功能二：标签系统（Tags）

### 数据模型

```typescript
interface Tag {
  id: string;
  name: string;           // "出差"
  color: string;          // "#c9923a"（金色）
  count: number;          // 使用次数（排序用）
  createdAt: number;
}

// Transaction 新增字段
interface Transaction {
  // ...现有字段...
  tags: string[];         // tag id 数组
}
```

### 功能

1. **标签管理**：在 Settings 新增"标签管理"页面
   - 显示所有标签，按 count 降序
   - 点击颜色块 → 色盘选择（预设8个颜色）
   - 增/删/改名
   - 颜色预设：`#c9923a` `#6b9fcf` `#7a9e7e` `#d4a0a0` `#9b8fcf` `#cf9b6b` `#6bcfbc` `#cf6b9b`

2. **记账时打标签**：
   - 在 SupplementForm（支出补充表单）增加标签选择
   - 已创建的标签以小色块 button 显示，可多选
   - 新建标签：输入名字直接创建

3. **Records 筛选**：
   - 顶部标签栏：显示所有标签（色块），点击筛选
   - 多选时为 OR 逻辑（满足任一标签即显示）
   - 再次点击取消筛选

### UI 设计

**Records 页面顶部标签栏：**
```
[出差][春节][项目X][+新建]
```

每个标签是一个小色块按钮，选中时 border 变深。点击 "+新建" 出现内联输入框。

**补充表单标签选择：**
```
标签： [出差] [春节] [项目X]
      [输入新标签名字...]
```

---

## 功能三：Records 数据连通性增强

### 现有问题
- Records 页面有搜索但没有时间筛选
- 没有分类/标签组合筛选
- 没有分页或滚动加载

### 增强内容

**1. 顶部筛选栏（TimelineFilter）**

```
[全部] [今日] [本周] [本月] [自定义📅]
[全部类型▼] [全部分类▼] [全部标签▼]
```

- 时间按钮组：单选（今日/本周/本月/自定义）
- 自定义：两个日期选择器（开始/结束）
- 类型下拉：全部 / 收入 / 支出
- 分类下拉：全部 / 餐饮 / 交通 / ...
- 标签下拉：全部 / [各标签]

**2. 排序选项**

```
排序：[最新在前▼]
```

选项：最新 / 最旧 / 金额高 / 金额低

**3. 月度统计条**

在筛选结果上方显示：
```
收入 ¥1,230  支出 ¥456  结余 +¥774
```

**4. 无限滚动（分页加载）**

- 初始加载 20 条
- 滚动到底部时加载更多 20 条
- 使用 IntersectionObserver 监测底部

### 组件清单

| 组件 | 说明 |
|------|------|
| `src/components/records/RecordsFilterBar.tsx` | 时间/类型/分类/标签筛选栏 |
| `src/components/records/MonthlyStats.tsx` | 月度统计摘要条 |
| `src/hooks/useRecordsInfinite.ts` | 分页加载 hook |
| `src/pages/Records.tsx` | 重构接入筛选逻辑 |

---

## 功能四：债务追踪（Debt Tracking）

### 数据模型

```typescript
interface Debt {
  id: string;
  type: 'lent' | 'borrowed';      // 借出 | 借入
  personName: string;              // 对方名字
  amount: number;                  // 金额
  reason?: string;                 // 原因（如"帮忙带东西"）
  status: 'active' | 'settled';   // 未还 | 已清
  createdAt: number;
  settledAt?: number;              // 清账时间
}
```

### UI 设计

**Workbench 页面底部 →「人情账本」区块：**

```
┌────────────────────────────────────┐
│  人情账本                          │
│                                    │
│  借出 💰                           │
│  ┌──────────────────────────────┐ │
│  │ 张三    ¥500    "帮我带饭"   [结算]│ │
│  └──────────────────────────────┘ │
│                                    │
│  借入 📋                           │
│  ┌──────────────────────────────┐ │
│  │ 李四    ¥200    "电费"      [结算]│ │
│  └──────────────────────────────┘ │
│                                    │
│  [+ 记一笔]  借出 / 借入           │
└────────────────────────────────────┘
```

- 借出/借入分两个区（用图标区分）
- 每人名字 + 金额 + 原因 + 结算按钮
- 结算后：显示"已结清 ¥500（2026-05-11）"，点击可查看历史

**新增债务弹窗：**
```
记一笔人情
类型：[借出] [借入]
对方姓名：___________
金额：___________
原因：___________（可选）
[取消] [确认]
```

### 组件清单

| 组件 | 说明 |
|------|------|
| `src/store/useDebts.ts` | 债务 hook（CRUD + 结算） |
| `src/store/db.ts` | `debts` table（version 5） |
| `src/components/debts/DebtCard.tsx` | 单条债务卡片 |
| `src/components/debts/DebtSection.tsx` | 借出/借入分区 |
| `src/components/debts/DebtModal.tsx` | 新增债务弹窗 |
| `src/pages/Workbench.tsx` | 底部嵌入人情账本区块 |

---

## 实施顺序

1. `db.ts` — 升级 version，添加 `recurringRules` / `debts` / `tags` 表；Transaction 新增 `tags` 字段
2. 各 store hook（useRecurring / useDebts）
3. 债务追踪（最独立）
4. 标签系统（其他功能都依赖）
5. Records 增强（依赖标签系统）
6. 周期性记账（最复杂，依赖账户系统）

---

*设计完成，等待实现。*