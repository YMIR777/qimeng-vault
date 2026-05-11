import { useMemo, useState, useEffect, useRef } from 'react';
import { useLedger } from '../store/useLedger';
import { useWishes } from '../store/useWishes';
import { useDebts } from '../store/useDebts';
import { DebtModal } from '../components/debts/DebtModal';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import gsap from 'gsap';

const spring = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const COLORS = ['#6b9fcf', '#c9923a', '#7a9e7e', '#b8af9e', '#d4a843'];

function fmtDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function AnimatedNumber({ value, prefix = '', suffix = '', duration = 1.2, delay = 0 }: {
  value: number; prefix?: string; suffix?: string; duration?: number; delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obj = { val: 0 };
    gsap.to(obj, { val: value, duration, delay, ease: 'power2.out', onUpdate: () => setDisplay(Math.round(obj.val)) });
  }, [value, duration, delay]);
  return <span ref={ref} className="font-mono">{prefix}{display.toLocaleString()}{suffix}</span>;
}

export function Workbench() {
  const { transactions } = useLedger();
  const { wishes } = useWishes();
  const { activeDebts, settleDebt, addDebt } = useDebts();
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [activePeriod, setActivePeriod] = useState<'all' | 'month' | 'week'>('all');
  const pageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const filteredTx = useMemo(() => {
    if (activePeriod === 'all') return transactions;
    const now = Date.now();
    const ms = activePeriod === 'month' ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    return transactions.filter(t => t.date >= now - ms);
  }, [transactions, activePeriod]);

  const incomeTx = filteredTx.filter(t => t.type === 'income');

  // 卡片入场动画 - spring physics
  useEffect(() => {
    const els = cardRefs.current.filter(Boolean);
    if (els.length === 0) return;
    gsap.fromTo(els,
      { y: 32, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.65, stagger: 0.08, ease: 'power3.out', delay: 0.12 }
    );
  }, []);

  // ── 工作概览 ───────────────────────────────────────
  const workOverview = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const monthIncomeTx = transactions.filter(t => t.type === 'income' && t.date >= monthStart);
    const workDays = new Set(monthIncomeTx.map(t => {
      const d = new Date(t.date);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })).size;
    const maxIncome = incomeTx.length > 0 ? Math.max(...incomeTx.map(t => t.amount)) : 0;
    const bossCounts: Record<string, number> = {};
    for (const tx of incomeTx) {
      if (tx.bossName) bossCounts[tx.bossName] = (bossCounts[tx.bossName] || 0) + 1;
    }
    const returningCustomers = Object.values(bossCounts).filter(c => c >= 2).length;
    const avgOrder = incomeTx.length > 0 ? Math.round(incomeTx.reduce((s, t) => s + t.amount, 0) / incomeTx.length) : 0;
    return { workDays, maxIncome, returningCustomers, avgOrder, totalCustomers: Object.keys(bossCounts).length };
  }, [transactions, incomeTx]);

  // ── 时段分析：近7天收入热力图 ───────────────────────
  const incomeHeatmap = useMemo(() => {
    const days: { date: string; income: number; isToday: boolean }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const start = d.getTime();
      const end = start + 24 * 60 * 60 * 1000;
      const dayIncome = transactions
        .filter(t => t.date >= start && t.date < end && t.type === 'income')
        .reduce((s, t) => s + t.amount, 0);
      days.push({ date: `${d.getMonth() + 1}/${d.getDate()}`, income: dayIncome, isToday: i === 0 });
    }
    return days;
  }, [transactions]);

  // ── 时段分析：工作时长趋势 ──────────────────────────
  const timeTrend = useMemo(() => {
    const days: { date: string; minutes: number }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const start = d.getTime();
      const end = start + 24 * 60 * 60 * 1000;
      const minutes = transactions
        .filter(t => t.date >= start && t.date < end && t.type === 'income')
        .reduce((s, t) => s + (t.timeSpent ?? 0), 0);
      days.push({ date: `${d.getMonth() + 1}/${d.getDate()}`, minutes });
    }
    return days;
  }, [transactions]);

  // ── 客户价值：回头客 vs 新客户 ──────────────────────
  const customerTypeData = useMemo(() => {
    const bossCounts: Record<string, number> = {};
    for (const tx of incomeTx) {
      if (tx.bossName) bossCounts[tx.bossName] = (bossCounts[tx.bossName] || 0) + 1;
    }
    const returning = Object.values(bossCounts).filter(c => c >= 2).length;
    const newCustomers = Object.values(bossCounts).filter(c => c === 1).length;
    if (returning === 0 && newCustomers === 0) return [];
    return [
      { name: '回头客', value: returning },
      { name: '新客户', value: newCustomers },
    ];
  }, [incomeTx]);

  // ── 客户价值：高价值客户 ────────────────────────────
  const highValueCustomers = useMemo(() => {
    const bosses: Record<string, { income: number; count: number }> = {};
    for (const tx of incomeTx) {
      if (!tx.bossName) continue;
      if (!bosses[tx.bossName]) bosses[tx.bossName] = { income: 0, count: 0 };
      bosses[tx.bossName].income += tx.amount;
      bosses[tx.bossName].count += 1;
    }
    return Object.entries(bosses)
      .map(([name, data]) => ({ name, ...data }))
      .filter(b => b.income > 500)
      .sort((a, b) => b.income - a.income);
  }, [incomeTx]);

  const weekComparison = useMemo(() => {
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
    const sum = (txs: typeof transactions) => ({
      income: txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      minutes: txs.filter(t => t.type === 'income' && t.timeSpent).reduce((s, t) => s + (t.timeSpent ?? 0), 0),
    });
    const thisS = sum(thisWeekTx);
    const lastS = sum(lastWeekTx);
    return {
      thisWeek: { ...thisS, net: thisS.income - thisS.expense },
      lastWeek: { ...lastS, net: lastS.income - lastS.expense },
      incomeChange: lastS.income > 0 ? ((thisS.income - lastS.income) / lastS.income) * 100 : 0,
    };
  }, [transactions]);

  const timeStats = useMemo(() => {
    const txWithTime = incomeTx.filter(t => t.timeSpent && t.timeSpent > 0);
    const totalMin = txWithTime.reduce((s, t) => s + (t.timeSpent ?? 0), 0);
    const totalIncome = txWithTime.reduce((s, t) => s + t.amount, 0);
    const avgMin = txWithTime.length > 0 ? Math.round(totalMin / txWithTime.length) : 0;
    const hourlyRate = totalMin > 0 ? Math.round(totalIncome / (totalMin / 60)) : 0;
    let bestRate = 0, bestTx: typeof txWithTime[0] | null = null;
    for (const tx of txWithTime) {
      const rate = tx.amount / ((tx.timeSpent ?? 1) / 60);
      if (rate > bestRate) { bestRate = rate; bestTx = tx; }
    }
    return { totalMin, avgMin, hourlyRate, bestRate: Math.round(bestRate), bestTx };
  }, [incomeTx]);

  const rateData = useMemo(() => {
    const txWithTime = filteredTx.filter(t => t.type === 'income' && t.timeSpent && t.timeSpent > 0);
    if (txWithTime.length === 0) return [];
    const byWeek: Record<string, { income: number; minutes: number }> = {};
    for (const tx of txWithTime) {
      const d = new Date(tx.date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = fmtDate(weekStart.getTime());
      if (!byWeek[key]) byWeek[key] = { income: 0, minutes: 0 };
      byWeek[key].income += tx.amount;
      byWeek[key].minutes += tx.timeSpent ?? 0;
    }
    return Object.entries(byWeek).map(([week, data]) => ({
      week, rate: Math.round(data.income / (data.minutes / 60)), income: data.income, hours: +(data.minutes / 60).toFixed(1),
    })).sort((a, b) => a.week.localeCompare(b.week)).slice(-8);
  }, [filteredTx]);

  const pieData = useMemo(() => {
    const byPlatform: Record<string, number> = {};
    for (const tx of incomeTx) {
      const p = tx.platform || '其他';
      byPlatform[p] = (byPlatform[p] || 0) + tx.amount;
    }
    return Object.entries(byPlatform).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [incomeTx]);

  const bossAnalysis = useMemo(() => {
    const bosses: Record<string, { income: number; count: number; minutes: number }> = {};
    for (const tx of incomeTx) {
      if (!tx.bossName) continue;
      if (!bosses[tx.bossName]) bosses[tx.bossName] = { income: 0, count: 0, minutes: 0 };
      bosses[tx.bossName].income += tx.amount;
      bosses[tx.bossName].count += 1;
      bosses[tx.bossName].minutes += tx.timeSpent ?? 0;
    }
    return Object.entries(bosses).map(([name, data]) => ({
      name, ...data, avg: Math.round(data.income / data.count),
      rate: data.minutes > 0 ? Math.round(data.income / (data.minutes / 60)) : 0,
    })).sort((a, b) => b.income - a.income);
  }, [incomeTx]);

  const bossRowRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const els = bossRowRefs.current.filter(Boolean);
    if (els.length === 0) return;
    gsap.fromTo(els, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, stagger: 0.07, ease: 'power2.out', delay: 0.4 });
  }, [bossAnalysis]);

  const progressRef = useRef<HTMLDivElement>(null);
  const activeWishes = wishes.filter(w => w.status === 'building');
  const closestWish = activeWishes.length > 0
    ? activeWishes.sort((a, b) => (a.currentBalance / a.targetPrice) - (b.currentBalance / b.targetPrice)).pop()
    : null;

  useEffect(() => {
    if (!progressRef.current || !closestWish) return;
    const pct = Math.min((closestWish.currentBalance / closestWish.targetPrice) * 100, 100);
    gsap.fromTo(progressRef.current, { width: '0%' }, { width: `${pct}%`, duration: 1.4, ease: 'elastic.out(1, 0.6)', delay: 0.6 });
  }, [closestWish]);

  const todayIncome = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = today.getTime() + 24 * 60 * 60 * 1000;
    const todayTx = transactions.filter(t => t.date >= today.getTime() && t.date < tomorrow);
    return {
      income: todayTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: todayTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    };
  }, [transactions]);

  const reg = (i: number) => (el: HTMLDivElement | null) => { cardRefs.current[i] = el; };
  const regBoss = (i: number) => (el: HTMLDivElement | null) => { bossRowRefs.current[i] = el; };

  return (
    <div ref={pageRef} style={{ minHeight: '100dvh', background: '#f5f0e8', padding: '40px 48px 100px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
          <div>
            <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '11px', letterSpacing: '0.5em', color: '#b8af9e', marginBottom: '4px' }}>绮梦账间</div>
            <h1 style={{ fontFamily: "'Noto Sans SC', sans-serif", fontSize: '28px', fontWeight: 400, color: '#3d3427', margin: 0, letterSpacing: '-0.02em' }}>工作台</h1>
          </div>
          <div style={{ display: 'flex', gap: '6px', background: '#ece7dc', borderRadius: '12px', padding: '4px' }}>
            {(['all', 'month', 'week'] as const).map(p => (
              <button key={p} onClick={() => setActivePeriod(p)} style={{
                padding: '8px 18px', borderRadius: '10px', border: 'none',
                background: activePeriod === p ? '#f5f0e8' : 'transparent',
                color: activePeriod === p ? '#3d3427' : '#a89f8e',
                fontSize: '12px', fontFamily: "'Noto Sans SC', sans-serif", cursor: 'pointer',
                boxShadow: activePeriod === p ? '2px 2px 6px #cdc5b8, -2px -2px 4px #fffbf5' : 'none',
                transition: `all 0.25s ${spring}`,
              }}>{p === 'all' ? '全部' : p === 'month' ? '本月' : '本周'}</button>
            ))}
          </div>
        </div>

        {/* ── Row 0: 工作概览（新增）──────────────────────── */}
        <div ref={reg(0)} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          {/* 工作天数 */}
          <div style={{ background: '#f5f0e8', borderRadius: '24px', padding: '28px 32px', boxShadow: '6px 6px 14px #cdc5b8, -6px -6px 14px #fffbf5' }}>
            <div style={{ fontFamily: "'Noto Sans SC', sans-serif", fontSize: '11px', letterSpacing: '0.25em', color: '#a89f8e', textTransform: 'uppercase', marginBottom: '16px' }}>工作天数</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '42px', color: '#6b9fcf', lineHeight: 1, fontWeight: 400 }}>
                <AnimatedNumber value={workOverview.workDays} />
              </span>
              <span style={{ fontSize: '13px', color: '#a89f8e' }}>天</span>
            </div>
            <div style={{ fontSize: '11px', color: '#a89f8e', marginTop: '8px' }}>本月有收入记录</div>
          </div>
          {/* 最高单笔 */}
          <div style={{ background: '#f5f0e8', borderRadius: '24px', padding: '28px 24px', boxShadow: '6px 6px 14px #cdc5b8, -6px -6px 14px #fffbf5' }}>
            <div style={{ fontFamily: "'Noto Sans SC', sans-serif", fontSize: '11px', letterSpacing: '0.25em', color: '#a89f8e', textTransform: 'uppercase', marginBottom: '16px' }}>最高单笔</div>
            <div className="font-mono" style={{ fontFamily: "var(--cream-mono)", fontSize: '28px', color: '#3d3427' }}>
              <AnimatedNumber value={workOverview.maxIncome} prefix="¥" />
            </div>
          </div>
          {/* 回头客 */}
          <div style={{ background: '#f5f0e8', borderRadius: '24px', padding: '28px 24px', boxShadow: '6px 6px 14px #cdc5b8, -6px -6px 14px #fffbf5' }}>
            <div style={{ fontFamily: "'Noto Sans SC', sans-serif", fontSize: '11px', letterSpacing: '0.25em', color: '#a89f8e', textTransform: 'uppercase', marginBottom: '16px' }}>回头客</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span className="font-mono" style={{ fontFamily: "var(--cream-mono)", fontSize: '28px', color: '#7a9e7e' }}>
                <AnimatedNumber value={workOverview.returningCustomers} />
              </span>
              <span style={{ fontSize: '12px', color: '#a89f8e' }}>/ {workOverview.totalCustomers}位</span>
            </div>
          </div>
          {/* 平均订单 */}
          <div style={{ background: '#f5f0e8', borderRadius: '24px', padding: '28px 24px', boxShadow: '6px 6px 14px #cdc5b8, -6px -6px 14px #fffbf5' }}>
            <div style={{ fontFamily: "'Noto Sans SC', sans-serif", fontSize: '11px', letterSpacing: '0.25em', color: '#a89f8e', textTransform: 'uppercase', marginBottom: '16px' }}>平均订单</div>
            <div className="font-mono" style={{ fontFamily: "var(--cream-mono)", fontSize: '28px', color: '#c9923a' }}>
              <AnimatedNumber value={workOverview.avgOrder} prefix="¥" />
            </div>
          </div>
        </div>

        {/* ── Row 1: 三大指标（现有）──────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '24px', marginBottom: '24px' }}>

          {/* 本周收入 Hero */}
          <div ref={reg(1)} style={{ background: '#f5f0e8', borderRadius: '24px', padding: '32px', boxShadow: '6px 6px 14px #cdc5b8, -6px -6px 14px #fffbf5' }}>
            <div style={{ fontFamily: "'Noto Sans SC', sans-serif", fontSize: '11px', letterSpacing: '0.25em', color: '#a89f8e', textTransform: 'uppercase', marginBottom: '20px' }}>本周收入</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '52px', color: '#6b9fcf', lineHeight: 1, fontWeight: 400 }}>
                +<AnimatedNumber value={weekComparison.thisWeek.income} />
              </span>
            </div>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#a89f8e', marginBottom: '2px' }}>净增</div>
                <div className="font-mono" style={{ fontFamily: "var(--cream-mono)", fontSize: '18px', color: '#3d3427' }}>
                  ¥{weekComparison.thisWeek.net.toLocaleString()}
                </div>
              </div>
              <div style={{ width: '1px', height: '32px', background: '#e0dbd3' }} />
              <div>
                <div style={{ fontSize: '12px', color: '#a89f8e', marginBottom: '2px' }}>上周</div>
                <div className="font-mono" style={{ fontFamily: "var(--cream-mono)", fontSize: '18px', color: '#c5bdb0' }}>
                  +¥{weekComparison.lastWeek.income.toLocaleString()}
                </div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '20px', background: weekComparison.incomeChange >= 0 ? 'rgba(107,159,207,0.1)' : 'rgba(201,146,58,0.1)' }}>
                <span style={{ fontSize: '14px', color: weekComparison.incomeChange >= 0 ? '#6b9fcf' : '#c9923a' }}>{weekComparison.incomeChange >= 0 ? '\u25B2' : '\u25BC'}</span>
                <span className="font-mono" style={{ fontSize: '14px', color: weekComparison.incomeChange >= 0 ? '#6b9fcf' : '#c9923a', fontFamily: "var(--cream-mono)" }}>{Math.abs(weekComparison.incomeChange).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* 工作时长 */}
          <div ref={reg(2)} style={{ background: '#f5f0e8', borderRadius: '24px', padding: '28px 24px', boxShadow: '6px 6px 14px #cdc5b8, -6px -6px 14px #fffbf5' }}>
            <div style={{ fontFamily: "'Noto Sans SC', sans-serif", fontSize: '11px', letterSpacing: '0.25em', color: '#a89f8e', textTransform: 'uppercase', marginBottom: '20px' }}>工作时长</div>
            {timeStats.totalMin === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div className="empty-state-title">暂无工时记录</div>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '14px' }}>
                  <div>
                    <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '24px', color: '#3d3427' }}><AnimatedNumber value={timeStats.totalMin} /></div>
                    <div style={{ fontSize: '10px', color: '#a89f8e', marginTop: '4px' }}>总时长(分)</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '24px', color: '#3d3427' }}><AnimatedNumber value={timeStats.avgMin} delay={0.1} /></div>
                    <div style={{ fontSize: '10px', color: '#a89f8e', marginTop: '4px' }}>平均(分)</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '24px', color: '#6b9fcf' }}><AnimatedNumber value={timeStats.hourlyRate} delay={0.2} /></div>
                    <div style={{ fontSize: '10px', color: '#a89f8e', marginTop: '4px' }}>时薪</div>
                  </div>
                </div>
                {timeStats.bestTx && (
                  <div style={{ fontSize: '11px', color: '#6b9fcf', padding: '8px 12px', background: 'rgba(107,159,207,0.08)', borderRadius: '10px' }}>
                    最高 ¥{timeStats.bestRate}/h · {timeStats.bestTx.platform}
                  </div>
                )}
              </>
            )}
          </div>

          {/* 今日收支 */}
          <div ref={reg(3)} style={{ background: '#f5f0e8', borderRadius: '24px', padding: '28px 24px', boxShadow: '6px 6px 14px #cdc5b8, -6px -6px 14px #fffbf5' }}>
            <div style={{ fontFamily: "'Noto Sans SC', sans-serif", fontSize: '11px', letterSpacing: '0.25em', color: '#a89f8e', textTransform: 'uppercase', marginBottom: '20px' }}>今日</div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: '#a89f8e', marginBottom: '4px' }}>收入</div>
              <div className="font-mono" style={{ fontFamily: "var(--cream-mono)", fontSize: '26px', color: '#6b9fcf' }}>
                +<AnimatedNumber value={todayIncome.income} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#a89f8e', marginBottom: '4px' }}>支出</div>
              <div className="font-mono" style={{ fontFamily: "var(--cream-mono)", fontSize: '26px', color: '#c9923a' }}>
                -<AnimatedNumber value={todayIncome.expense} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 2: 时段分析（改进+新增）────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* 近7天收入热力图 */}
          <div ref={reg(4)} style={{ background: '#f5f0e8', borderRadius: '24px', padding: '28px 32px', boxShadow: '6px 6px 14px #cdc5b8, -6px -6px 14px #fffbf5' }}>
            <div style={{ fontFamily: "'Noto Sans SC', sans-serif", fontSize: '11px', letterSpacing: '0.25em', color: '#a89f8e', textTransform: 'uppercase', marginBottom: '20px' }}>近7天收入热力</div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {incomeHeatmap.map((day, i) => {
                const maxIncome = Math.max(...incomeHeatmap.map(d => d.income)) || 1;
                const intensity = Math.min(day.income / maxIncome, 1);
                return (
                  <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{
                      aspectRatio: '1', maxWidth: '80px', margin: '0 auto', borderRadius: '16px',
                      background: day.income === 0 ? '#e8e1d5' : `rgba(107,159,207,${0.15 + intensity * 0.65})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Noto Serif SC', serif", fontSize: '13px',
                      color: day.income === 0 ? '#c5bdb0' : '#4a7aad',
                      transition: `transform 0.3s ${spring}`,
                    }}>
                      {day.income !== 0 ? '+' + day.income : '\u00B7'}
                    </div>
                    <div style={{ fontSize: '11px', color: day.isToday ? '#c9923a' : '#a89f8e', marginTop: '8px', fontWeight: day.isToday ? 500 : 400 }}>{day.date}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 工作时长趋势 */}
          <div ref={reg(5)} style={{ background: '#f5f0e8', borderRadius: '24px', padding: '28px 24px', boxShadow: '6px 6px 14px #cdc5b8, -6px -6px 14px #fffbf5' }}>
            <div style={{ fontFamily: "'Noto Sans SC', sans-serif", fontSize: '11px', letterSpacing: '0.25em', color: '#a89f8e', textTransform: 'uppercase', marginBottom: '20px' }}>工作时长趋势</div>
            {timeTrend.every(d => d.minutes === 0) ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div className="empty-state-title">暂无工时记录</div>
              </div>
            ) : (
              <div style={{ height: '160px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0dbd3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#a89f8e' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#a89f8e' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#f5f0e8', border: 'none', borderRadius: '12px', boxShadow: '4px 4px 12px #cdc5b8', fontSize: '12px', color: '#3d3427' }} formatter={(value: any) => [`${value}分`, '时长']} />
                    <Line type="monotone" dataKey="minutes" stroke="#7a9e7e" strokeWidth={2.5} dot={{ fill: '#7a9e7e', r: 4 }} activeDot={{ fill: '#c9923a', r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* ── Row 3: 时薪趋势 + 来源分布（现有）────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '24px', marginBottom: '24px' }}>

          {/* 时薪趋势 */}
          <div ref={reg(6)} style={{ background: '#f5f0e8', borderRadius: '24px', padding: '28px 32px', boxShadow: '6px 6px 14px #cdc5b8, -6px -6px 14px #fffbf5' }}>
            <div style={{ fontFamily: "'Noto Sans SC', sans-serif", fontSize: '11px', letterSpacing: '0.25em', color: '#a89f8e', textTransform: 'uppercase', marginBottom: '20px' }}>时薪趋势</div>
            {rateData.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18"/>
                    <path d="M18 17V9"/>
                    <path d="M13 17V5"/>
                    <path d="M8 17v-3"/>
                  </svg>
                </div>
                <div className="empty-state-title">暂无工时记录</div>
              </div>
            ) : (
              <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rateData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0dbd3" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#a89f8e' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#a89f8e' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#f5f0e8', border: 'none', borderRadius: '12px', boxShadow: '4px 4px 12px #cdc5b8', fontSize: '12px', color: '#3d3427' }} formatter={(value: any) => [`¥${value}/h`, '时薪']} />
                    <Line type="monotone" dataKey="rate" stroke="#6b9fcf" strokeWidth={2.5} dot={{ fill: '#6b9fcf', r: 4 }} activeDot={{ fill: '#c9923a', r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* 来源分布 */}
          <div ref={reg(7)} style={{ background: '#f5f0e8', borderRadius: '24px', padding: '28px 24px', boxShadow: '6px 6px 14px #cdc5b8, -6px -6px 14px #fffbf5' }}>
            <div style={{ fontFamily: "'Noto Sans SC', sans-serif", fontSize: '11px', letterSpacing: '0.25em', color: '#a89f8e', textTransform: 'uppercase', marginBottom: '20px' }}>来源分布</div>
            {pieData.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                </div>
                <div className="empty-state-title">暂无收入记录</div>
              </div>
            ) : (
              <>
                <div style={{ height: '160px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">
                        {pieData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#f5f0e8', border: 'none', borderRadius: '12px', boxShadow: '4px 4px 12px #cdc5b8', fontSize: '12px', color: '#3d3427' }} formatter={(value: any, name: any) => [`¥${Number(value).toLocaleString()}`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
                  {pieData.slice(0, 4).map((entry, index) => (
                    <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[index % COLORS.length] }} />
                      <span style={{ fontSize: '11px', color: '#a89f8e' }}>{entry.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Row 4: 客户价值分析（新增）+ 老板分析（现有）── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px', marginBottom: '24px' }}>

          {/* 老板分析 & 高价值客户 */}
          <div ref={reg(8)} style={{ background: '#f5f0e8', borderRadius: '24px', padding: '28px 32px', boxShadow: '6px 6px 14px #cdc5b8, -6px -6px 14px #fffbf5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontFamily: "'Noto Sans SC', sans-serif", fontSize: '11px', letterSpacing: '0.25em', color: '#a89f8e', textTransform: 'uppercase' }}>
                老板分析 <span style={{ fontSize: '11px', color: '#6b9fcf', fontFamily: "'Noto Serif SC', serif" }}>{bossAnalysis.length}</span>
              </div>
              {highValueCustomers.length > 0 && (
                <div style={{ fontSize: '10px', color: '#c9923a', padding: '4px 10px', background: 'rgba(201,146,58,0.08)', borderRadius: '8px' }}>
                  {highValueCustomers.length} 位高价值客户
                </div>
              )}
            </div>
            {bossAnalysis.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div className="empty-state-title">暂无回头老板</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {bossAnalysis.slice(0, 4).map((boss, i) => (
                  <div key={boss.name} ref={regBoss(i)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 18px', background: '#ece7dc', borderRadius: '14px',
                    boxShadow: 'inset 2px 2px 4px #cdc5b8, inset -2px -2px 4px #fffbf5',
                    transition: `transform 0.2s ${spring}`,
                    border: highValueCustomers.find(h => h.name === boss.name) ? '1px solid rgba(201,146,58,0.3)' : '1px solid transparent',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.015)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%', background: highValueCustomers.find(h => h.name === boss.name) ? 'rgba(201,146,58,0.12)' : 'rgba(107,159,207,0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '13px', color: highValueCustomers.find(h => h.name === boss.name) ? '#c9923a' : '#6b9fcf', fontFamily: "'Noto Serif SC', serif",
                      }}>{boss.name.charAt(0)}</div>
                      <div>
                        <div style={{ fontSize: '14px', color: '#3d3427', fontWeight: 500 }}>{boss.name}</div>
                        <div style={{ fontSize: '11px', color: '#a89f8e', marginTop: '2px' }}>{boss.count}次 · 均¥{boss.avg.toLocaleString()}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '15px', color: highValueCustomers.find(h => h.name === boss.name) ? '#c9923a' : '#6b9fcf', fontFamily: "'Noto Serif SC', serif" }}>¥{boss.income.toLocaleString()}</div>
                      {boss.rate > 0 && <div style={{ fontSize: '10px', color: '#b8af9e', marginTop: '2px' }}>¥{boss.rate}/h</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 回头客vs新客户 + 星体进度 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* 回头客vs新客户 */}
            <div ref={reg(9)} style={{ background: '#f5f0e8', borderRadius: '24px', padding: '28px 24px', boxShadow: '6px 6px 14px #cdc5b8, -6px -6px 14px #fffbf5', flex: 1 }}>
              <div style={{ fontFamily: "'Noto Sans SC', sans-serif", fontSize: '11px', letterSpacing: '0.25em', color: '#a89f8e', textTransform: 'uppercase', marginBottom: '20px' }}>客户构成</div>
              {customerTypeData.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <div className="empty-state-title">暂无客户数据</div>
                </div>
              ) : (
                <>
                  <div style={{ height: '140px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={customerTypeData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value" stroke="none">
                          {customerTypeData.map((entry, index) => <Cell key={entry.name} fill={index === 0 ? '#6b9fcf' : '#b8af9e'} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#f5f0e8', border: 'none', borderRadius: '12px', boxShadow: '4px 4px 12px #cdc5b8', fontSize: '12px', color: '#3d3427' }} formatter={(value: any, name: any) => [`${value}位`, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '8px' }}>
                    {customerTypeData.map((entry, index) => (
                      <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: index === 0 ? '#6b9fcf' : '#b8af9e' }} />
                        <span style={{ fontSize: '11px', color: '#a89f8e' }}>{entry.name} {entry.value}位</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* 星体进度 */}
            <div ref={reg(10)} style={{ background: '#f5f0e8', borderRadius: '24px', padding: '28px 28px', boxShadow: '6px 6px 14px #cdc5b8, -6px -6px 14px #fffbf5' }}>
              <div style={{ fontFamily: "'Noto Sans SC', sans-serif", fontSize: '11px', letterSpacing: '0.25em', color: '#a89f8e', textTransform: 'uppercase', marginBottom: '20px' }}>正在攒的星体</div>
              {closestWish ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(201,146,58,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                    }}>{'\u2605'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '16px', color: '#3d3427', fontWeight: 500 }}>{closestWish.name}</div>
                      <div style={{ fontSize: '12px', color: '#a89f8e', marginTop: '4px' }}>
                        ¥{closestWish.currentBalance.toLocaleString()} / ¥{closestWish.targetPrice.toLocaleString()}
                      </div>
                    </div>
                    <div className="font-mono" style={{ fontFamily: "var(--cream-mono)", fontSize: '24px', color: '#c9923a' }}>
                      <AnimatedNumber value={Math.round((closestWish.currentBalance / closestWish.targetPrice) * 100)} suffix="%" />
                    </div>
                  </div>
                  <div style={{ height: '8px', borderRadius: '4px', background: '#e0dbd3', overflow: 'hidden' }}>
                    <div ref={progressRef} style={{
                      height: '100%', borderRadius: '4px',
                      background: `linear-gradient(90deg, #c9923a, #d4a843)`,
                      width: '0%',
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                    <span style={{ fontSize: '10px', color: '#a89f8e' }}>{closestWish.currentBalance.toLocaleString()}</span>
                    <span style={{ fontSize: '10px', color: '#a89f8e' }}>{closestWish.targetPrice.toLocaleString()}</span>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </div>
                  <div className="empty-state-title">暂无进行中的星体</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── 人情账本 ──────────────────────────────────── */}
        <div style={{
          background: '#f5f0e8',
          borderRadius: '24px',
          padding: '28px 32px',
          boxShadow: '6px 6px 14px #cdc5b8, -6px -6px 14px #fffbf5',
          marginBottom: '24px',
        }}>
          <div style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '11px', letterSpacing: '0.25em', color: '#a89f8e',
            textTransform: 'uppercase', marginBottom: '20px',
          }}>
            人情账本
          </div>

          {activeDebts.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '32px 0',
              color: '#b8af9e', fontSize: '14px',
              fontFamily: "'Noto Serif SC', serif",
            }}>
              还没有人情债，记账也记温度
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* 借出 */}
              {activeDebts.filter(d => d.type === 'lent').length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', color: '#6b9fcf', marginBottom: '8px', fontWeight: 500 }}>
                    借出 ¥{activeDebts.filter(d => d.type === 'lent').reduce((s, d) => s + d.amount, 0).toLocaleString()}
                  </div>
                  {activeDebts.filter(d => d.type === 'lent').map(debt => (
                    <div key={debt.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px', background: '#ece7dc', borderRadius: '12px',
                      marginBottom: '8px', boxShadow: 'inset 2px 2px 4px #cdc5b8, inset -2px -2px 4px #fffbf5',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(107,159,207,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#6b9fcf" strokeWidth="1.5">
                            <circle cx="8" cy="8" r="6"/>
                            <path d="M8 5v4M8 11v.5"/>
                          </svg>
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', color: '#3d3427' }}>{debt.personName}</div>
                          {debt.reason && <div style={{ fontSize: '11px', color: '#a89f8e' }}>{debt.reason}</div>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '15px', color: '#6b9fcf', fontFamily: "'Noto Serif SC', serif" }}>¥{debt.amount}</span>
                        <button
                          onClick={() => settleDebt(debt.id)}
                          style={{ padding: '4px 12px', borderRadius: '8px', border: 'none', background: '#6b9fcf', color: '#fff', fontSize: '12px', cursor: 'pointer' }}
                        >结算</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 借入 */}
              {activeDebts.filter(d => d.type === 'borrowed').length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#c9923a', marginBottom: '8px', fontWeight: 500 }}>
                    借入 ¥{activeDebts.filter(d => d.type === 'borrowed').reduce((s, d) => s + d.amount, 0).toLocaleString()}
                  </div>
                  {activeDebts.filter(d => d.type === 'borrowed').map(debt => (
                    <div key={debt.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px', background: '#ece7dc', borderRadius: '12px',
                      marginBottom: '8px', boxShadow: 'inset 2px 2px 4px #cdc5b8, inset -2px -2px 4px #fffbf5',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(201,146,58,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#c9923a" strokeWidth="1.5">
                            <rect x="2" y="3" width="12" height="10" rx="2"/>
                            <path d="M5 7h6M8 5v4"/>
                          </svg>
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', color: '#3d3427' }}>{debt.personName}</div>
                          {debt.reason && <div style={{ fontSize: '11px', color: '#a89f8e' }}>{debt.reason}</div>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '15px', color: '#c9923a', fontFamily: "'Noto Serif SC', serif" }}>¥{debt.amount}</span>
                        <button
                          onClick={() => settleDebt(debt.id)}
                          style={{ padding: '4px 12px', borderRadius: '8px', border: 'none', background: '#c9923a', color: '#fff', fontSize: '12px', cursor: 'pointer' }}
                        >结算</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 新增债务按钮 */}
          <button
            onClick={() => setShowDebtModal(true)}
            style={{
              width: '100%', marginTop: '12px', padding: '10px',
              borderRadius: '12px', border: '1.5px dashed #c9923a',
              background: 'transparent', color: '#c9923a',
              fontSize: '13px', fontFamily: "'Noto Sans SC', sans-serif",
              cursor: 'pointer',
            }}
          >+ 记一笔</button>
        </div>

      </div>

      {/* DebtModal */}
      {showDebtModal && (
        <DebtModal
          onClose={() => setShowDebtModal(false)}
          onAdd={async (payload) => {
            await addDebt(payload);
            setShowDebtModal(false);
          }}
        />
      )}
    </div>
  );
}
