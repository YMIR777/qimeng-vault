# 四功能实现计划 — Superpowers TDD

> 日期：2026-05-11
> 设计文档：`docs/plans/2026-05-11-four-features-design.md`

---

## 实施顺序

| 顺序 | 功能 | 依赖 |
|------|------|------|
| 1 | 数据库升级（db.ts） | 所有功能基础 |
| 2 | 债务追踪（Debts） | 独立，最先做 |
| 3 | 标签系统（Tags） | 被 Records 依赖 |
| 4 | Records 数据连通性 | 依赖 Tags |
| 5 | 周期性记账（Recurring） | 最复杂，最后做 |

---

## Step 0：数据库升级

### 任务 T0-1：升级 db.ts 版本

**文件：** `src/store/db.ts`

**修改：**
1. 新增 `Tag` interface（name, color, count, createdAt）
2. 新增 `Debt` interface（type, personName, amount, reason, status, createdAt, settledAt）
3. 新增 `RecurringRule` interface（name, amount, type, category, accountId, period, dayOfMonth, dayOfWeek, nextDue, active, lastTriggered, autoRecord, note, createdAt）
4. `Transaction` interface 新增 `tags: string[]`
5. `VaultDatabase` version 4 → version 5，新增：
   - `tags: '++id, name'` 表
   - `debts: '++id, type, status'` 表
   - `recurringRules: '++id, active, nextDue'` 表
6. `transactions` 表 stores 字符串更新为：`'++id, type, date, wishId, accountId, *tags'`（使 tags 可索引）

**测试：** `npm run build` 通过即为通过。

---

## Step 1：债务追踪（Debts）

### 任务 T1-1：创建 useDebts hook

**文件：** `src/store/useDebts.ts`

**TDD 循环：**
1. 先写测试 `src/__tests__/useDebts.test.tsx`（describe useDebts，测试 addDebt / deleteDebt / settleDebt）
2. 运行测试，确认失败
3. 实现 hook（useState + db.debts CRUD）
4. 测试通过后 commit

**功能：**
- `debts` — 所有债务列表
- `activeDebts` — `status === 'active'` 的债务
- `lentDebts` / `borrowedDebts` — 按 type 过滤
- `addDebt(payload)` — 新增借出/借入
- `settleDebt(id)` — 将 status 改为 'settled'，设 settledAt
- `deleteDebt(id)` — 删除债务

### 任务 T1-2：创建 DebtModal 组件

**文件：** `src/components/debts/DebtModal.tsx`

**功能：** 新增债务弹窗
- 类型切换（借出/借入）
- 姓名输入
- 金额输入
- 原因输入（可选）
- 提交时调用 `addDebt`

**样式：** 底部滑出弹窗，背景 blur，使用 taste-skill spring 动画

### 任务 T1-3：创建 DebtCard 组件

**文件：** `src/components/debts/DebtCard.tsx`

**功能：** 单条债务展示
- 左侧：图标（💰借出/📋借入）+ 姓名 + 金额
- 右侧：原因（如果有）+ 结算按钮
- 已结算：显示"已结清 ¥XXX（日期）"，灰色

### 任务 T1-4：创建 DebtSection 组件

**文件：** `src/components/debts/DebtSection.tsx`

**功能：** 借出/借入分区
- 标题（借出 💰 / 借入 📋）+ 小计
- 列出对应 DebtCard
- 空状态："还没有人情债，记账也记温度"

### 任务 T1-5：嵌入 Workbench 页面

**文件：** `src/pages/Workbench.tsx`

**修改：**
- 页面底部引入 DebtSection
- DebtSection 下方引入"记一笔"按钮（触发 DebtModal）
- DebtModal 作为条件渲染弹窗

---

## Step 2：标签系统（Tags）

### 任务 T2-1：创建 useTags hook

**文件：** `src/store/useTags.ts`

**TDD：**
1. 写测试 `src/__tests__/useTags.test.tsx`
2. 实现：tags / addTag / updateTag / deleteTag / incrementCount
3. commit

**功能：**
- `tags` — 所有标签（按 count 降序）
- `addTag({ name, color })` — 新建标签，count=0
- `updateTag(id, patch)` — 更新名字或颜色
- `deleteTag(id)` — 删除标签
- `incrementCount(tagIds)` — 批量给标签 count+1（记账时调用）

**颜色预设：** `['#c9923a', '#6b9fcf', '#7a9e7e', '#d4a0a0', '#9b8fcf', '#cf9b6b', '#6bcfbc', '#cf6b9b']`

### 任务 T2-2：创建 TagBadge 组件

**文件：** `src/components/tags/TagBadge.tsx`

**功能：** 单个标签色块
- 颜色圆点 + 标签名
- 可选：选中态（border + 背景色加深）
- 可选：显示 count

### 任务 T2-3：创建 TagPicker 组件

**文件：** `src/components/tags/TagPicker.tsx`

**功能：** 标签选择器
- 显示所有已创建标签（TagBadge 排列）
- 已选标签显示选中态
- 点击切换选中状态
- 底部"新建标签"输入框（输入回车创建）

### 任务 T2-4：在 SupplementForm 集成 TagPicker

**文件：** `src/components/magic/SupplementForm.tsx`

**修改：**
- 引入 TagPicker
- 在表单底部（备注字段下方）增加"标签"区域
- 记账提交时同步 `tags` 字段到 Transaction
- 调用 `incrementCount` 更新标签使用次数

### 任务 T2-5：标签管理页面

**文件：** `src/pages/Settings.tsx`

**修改：**
- Settings 新增"标签管理" Tab
- 显示所有标签（TagBadge + 删除按钮）
- 点击颜色可修改
- 顶部搜索过滤
- 底部 "+ 新建标签"

---

## Step 3：Records 数据连通性增强

### 任务 T3-1：创建 useRecordsFilter hook

**文件：** `src/hooks/useRecordsFilter.ts`

**功能：**
- `filterState` — { timeRange, type, category, tagIds, sort }
- `filteredTransactions` — 根据筛选条件过滤后的 transactions
- 月度统计（收入合计/支出合计/结余）

### 任务 T3-2：创建 RecordsFilterBar 组件

**文件：** `src/components/records/RecordsFilterBar.tsx`

**功能：**
- 时间按钮组：全部/今日/本周/本月/自定义
- 自定义日期选择（两个 date input）
- 类型下拉：全部/收入/支出
- 分类下拉：全部/各分类（从现有 EXPENSE_CATEGORIES 读取）
- 标签下拉：全部/各标签（从 useTags 读取）
- 排序下拉：最新/最旧/金额高/金额低

### 任务 T3-3：创建 MonthlyStats 组件

**文件：** `src/components/records/MonthlyStats.tsx`

**功能：** 收入 ¥X  支出 ¥X  结余 +¥X
- 三个数字横向排列
- 收入绿色/支出金色/结余根据正负变色

### 任务 T3-4：创建 useRecordsInfinite hook

**文件：** `src/hooks/useRecordsInfinite.ts`

**功能：**
- `visibleTransactions` — 当前已加载的 transactions（初始20条）
- `loadMore()` — 加载更多20条
- `hasMore` — 是否还有更多
- 使用 IntersectionObserver 监测底部

### 任务 T3-5：重构 Records 页面

**文件：** `src/pages/Records.tsx`

**修改：**
- 引入 RecordsFilterBar / MonthlyStats
- 重构 transactions 列表接入筛选逻辑
- 接入无限滚动
- 搜索功能保留

---

## Step 4：周期性记账（Recurring）

### 任务 T4-1：创建 useRecurring hook

**文件：** `src/store/useRecurring.ts`

**TDD：**
1. 写测试 `src/__tests__/useRecurring.test.tsx`
2. 实现 hook
3. commit

**功能：**
- `rules` — 所有周期规则（按 nextDue 升序）
- `activeRules` — active === true 的规则
- `addRule` / `updateRule` / `deleteRule` / `toggleActive`
- `checkAndTrigger()` — 检查并触发到期规则，调用 addTransaction，更新 nextDue
- 计算下次 nextDue 的内部方法

### 任务 T4-2：创建 RecurringRuleCard 组件

**文件：** `src/components/recurring/RecurringRuleCard.tsx`

**功能：**
- 规则名称 + 金额 + 周期文字
- 账户图标/名称
- 暂停/启用 toggle
- 点击展开编辑

### 任务 T4-3：创建 RecurringRuleModal 组件

**文件：** `src/components/recurring/RecurringRuleModal.tsx`

**功能：**
- 新增/编辑表单
- 字段：名称、金额、类型（支出/收入）、分类、账户、周期类型、日期、自动or确认、备注
- 日期选择：根据周期类型显示不同（每月选日期 / 每周选星期 / 每年选月日）

### 任务 T4-4：在 Settings 新增自动记账 Tab

**文件：** `src/pages/Settings.tsx`

**修改：**
- 新增 Tab 页面"自动记账"
- 顶部显示所有规则（RecurringRuleCard 列表）
- 底部 "+ 新增自动记账" 按钮（触发 RecurringRuleModal）
- 应用启动时调用 `checkAndTrigger()`（在 Settings 组件 mount 时调用）

### 任务 T4-5：触发确认弹窗

**文件：** `src/components/recurring/RecurringConfirmModal.tsx`

**功能：**
- `autoRecord=false` 时触发
- 显示规则名 + 金额 + 账户
- "确认入账" / "跳过本次" 两个按钮
- 确认后调用 addTransaction

---

## 执行模式

**请选择：**

**A. 我来执行（subagent 驱动）** — 我通过 `sessions_spawn` 为每个任务派发子 agent，严格 TDD，每完成一个任务 commit 一次。4 个功能并行展开。

**B. 你来执行** — 我把计划发给你，你按任务编号自己跑测试→实现→commit 的循环。

选哪个？