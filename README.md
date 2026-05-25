# 绮梦帐间

> 记账是记录存在，不是批判消费。财务软件应该是镜子，不是鞭子。

一个温暖的个人记账 PWA，支持跨设备云同步。为小黒秋而建。

## 功能

- 📝 **魔法输入** — 像写日记一样记账，自然语言解析
- ⭐ **欲望星体** — 把储蓄目标变成可视化的星星，攒满一颗亮一颗
- 📊 **工作台** — 陪玩时薪趋势、来源分布、老板分析
- 📈 **报表中心** — 日报/周报、月度趋势、支出分类、财务健康度
- 🔄 **周期性记账** — 房租/订阅自动入账，不用每次手动记
- 🏷️ **标签系统** — 多维度分类，跨类别标记
- 💸 **债务追踪** — 借出/借入管理，人情账也不落下
- ☁️ **跨设备同步** — 手机和电脑数据实时互通（Supabase）
- 📱 **PWA 安装** — 添加到主屏幕，像原生 App 一样用

## 技术栈

| 层 | 技术 |
|----|------|
| 框架 | React 19 + TypeScript + Vite 8 |
| 路由 | React Router v7 |
| 本地存储 | Dexie.js (IndexedDB) |
| 云同步 | Supabase (PostgreSQL) |
| 图表 | Recharts |
| 动画 | GSAP + CSS keyframes |
| PWA | vite-plugin-pwa |
| 部署 | Vercel |
| 设计 | 暖米色新拟物 (Neumorphism) |

## 部署

```
https://qimengzhangjian.vercel.app
```

## 本地开发

```bash
npm install
npm run dev        # http://localhost:5173
npm run dev -- --host  # 局域网手机测试
npm run build      # 生产构建
```

## 项目结构

```
src/
├── pages/           # 7 个页面（Dashboard, Wishes, Workbench, Reports, Records, Reflection, Settings）
├── components/      # UI 组件（magic, reports, ui, wishes, debts, tags, goals, recurring, records, reflection, intro）
├── store/           # Dexie 数据库 + React hooks（useLedger, useWishes, useAccounts, useBudgets, useTags, useDebts, useRecurring, useGoals, useReports）
├── supabase/        # Supabase 客户端 + 同步服务
├── hooks/           # 通用 hooks
├── utils/           # 工具函数
└── styles/          # 全局样式
```
