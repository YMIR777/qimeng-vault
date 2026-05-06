import { useMemo, useState } from 'react';
import { useLedger } from '../store/useLedger';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const spring = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const COLORS = ['#6b9fcf', '#c9923a', '#7a9e7e', '#b8af9e', '#d4a843'];

export function Workbench() {
  const { transactions } = useLedger();
  const [activePeriod, setActivePeriod] = useState<'all' | 'month' | 'week'>('all');

  const filteredTx = useMemo(() => {
    if (activePeriod === 'all') return transactions;
    const now = Date.now();
    const ms = activePeriod === 'month' ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    return transactions.filter(t => t.date >= now - ms);
  }, [transactions, activePeriod]);

  // 1. 时薪趋势
  const rateData = useMemo(() => {
    const incomeTx = filteredTx.filter(t => t.type === 'income' && t.timeSpent && t.timeSpent > 0);
    if (incomeTx.length === 0) return [];

    const byWeek: Record<string, { income: number; minutes: number }> = {};
    for (const tx of incomeTx) {
      const d = new Date(tx.date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      const key = `${weekStart.getMonth() + 1}/${weekStart.getDate()}-${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;
      if (!byWeek[key]) byWeek[key] = { income: 0, minutes: 0 };
      byWeek[key].income += tx.amount;
      byWeek[key].minutes += tx.timeSpent ?? 0;
    }

    return Object.entries(byWeek)
      .map(([week, data]) => ({
        week,
        rate: Math.round(data.income / (data.minutes / 60)),
        income: data.income,
        hours: +(data.minutes / 60).toFixed(1),
      }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-8);
  }, [filteredTx]);

  // 2. 来源分布
  const pieData = useMemo(() => {
    const incomeTx = filteredTx.filter(t => t.type === 'income');
    const byPlatform: Record<string, number> = {};
    for (const tx of incomeTx) {
      const p = tx.platform || '其他';
      byPlatform[p] = (byPlatform[p] || 0) + tx.amount;
    }
    return Object.entries(byPlatform)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTx]);

  // 3. 周对比
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

    const thisIncome = thisWeekTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const thisExpense = thisWeekTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const lastIncome = lastWeekTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const lastExpense = lastWeekTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const incomeChange = lastIncome > 0 ? ((thisIncome - lastIncome) / lastIncome) * 100 : 0;
    const expenseChange = lastExpense > 0 ? ((thisExpense - lastExpense) / lastExpense) * 100 : 0;

    return {
      thisWeek: { income: thisIncome, expense: thisExpense, net: thisIncome - thisExpense },
      lastWeek: { income: lastIncome, expense: lastExpense, net: lastIncome - lastExpense },
      incomeChange,
      expenseChange,
    };
  }, [transactions]);

  // 4. 统计
  const stats = useMemo(() => {
    const incomeTx = filteredTx.filter(t => t.type === 'income');
    const expenseTx = filteredTx.filter(t => t.type === 'expense');
    const totalIncome = incomeTx.reduce((s, t) => s + t.amount, 0);
    const totalExpense = expenseTx.reduce((s, t) => s + t.amount, 0);
    const avgIncome = incomeTx.length > 0 ? Math.round(totalIncome / incomeTx.length) : 0;
    const avgExpense = expenseTx.length > 0 ? Math.round(totalExpense / expenseTx.length) : 0;

    // Boss回头次数
    const bossCount: Record<string, number> = {};
    for (const tx of incomeTx) {
      if (tx.bossName) {
        bossCount[tx.bossName] = (bossCount[tx.bossName] || 0) + 1;
      }
    }
    const loyalBosses = Object.entries(bossCount).filter(([, count]) => count >= 2);

    return { totalIncome, totalExpense, net: totalIncome - totalExpense, avgIncome, avgExpense, loyalBosses };
  }, [filteredTx]);

  const hasTimeData = rateData.length > 0;
  const hasIncome = pieData.length > 0;

  return (
    <div style={{
      padding: '48px 24px 110px',
      maxWidth: '560px',
      margin: '0 auto',
      minHeight: '100dvh',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <div style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: '11px',
            letterSpacing: '0.5em',
            color: '#b8af9e',
            textTransform: 'uppercase',
            marginBottom: '2px',
          }}>绮梦账间</div>
          <h1 style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '22px',
            fontWeight: 500,
            color: '#3d3427',
            letterSpacing: '-0.01em',
            margin: 0,
          }}>工作台</h1>
        </div>
        {/* Period selector */}
        <div style={{
          display: 'flex',
          gap: '4px',
          background: '#f0ebe0',
          borderRadius: '10px',
          padding: '3px',
          boxShadow: 'inset 2px 2px 4px #cdc5b8, inset -2px -2px 4px #fffbf5',
        }}>
          {(['all', 'month', 'week'] as const).map(p => (
            <button
              key={p}
              onClick={() => setActivePeriod(p)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activePeriod === p ? '#f0ebe0' : 'transparent',
                boxShadow: activePeriod === p ? '2px 2px 4px #cdc5b8, -2px -2px 4px #fffbf5' : 'none',
                color: activePeriod === p ? '#3d3427' : '#a89f8e',
                fontSize: '11px',
                fontFamily: "'Noto Sans SC', sans-serif",
                cursor: 'pointer',
                transition: `all 0.2s ${spring}`,
              }}
            >
              {p === 'all' ? '全部' : p === 'month' ? '本月' : '本周'}
            </button>
          ))}
        </div>
      </div>

      {/* Week Comparison — asymmetric 3fr 2fr */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '3fr 2fr',
        gap: '10px',
        marginBottom: '28px',
      }}>
        {/* This week — larger */}
        <div style={{
          background: '#f0ebe0',
          borderRadius: '18px',
          padding: '20px 18px',
          boxShadow: '5px 5px 12px #cdc5b8, -5px -5px 12px #fffbf5',
        }}>
          <div style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '10px',
            letterSpacing: '0.2em',
            color: '#a89f8e',
            textTransform: 'uppercase',
            marginBottom: '10px',
          }}>本周</div>
          <div style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: '28px',
            color: '#6b9fcf',
            lineHeight: 1.1,
          }}>
            +{weekComparison.thisWeek.income.toLocaleString()}
          </div>
          <div style={{
            fontSize: '11px',
            color: '#a89f8e',
            marginTop: '6px',
            display: 'flex',
            gap: '12px',
          }}>
            <span>净增 ¥{weekComparison.thisWeek.net}</span>
            <span style={{ color: weekComparison.incomeChange >= 0 ? '#6b9fcf' : '#c9923a' }}>
              {weekComparison.incomeChange >= 0 ? '▲' : '▼'} {Math.abs(weekComparison.incomeChange).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Last week — smaller */}
        <div style={{
          background: '#f0ebe0',
          borderRadius: '18px',
          padding: '20px 14px',
          boxShadow: '5px 5px 12px #cdc5b8, -5px -5px 12px #fffbf5',
        }}>
          <div style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '10px',
            letterSpacing: '0.2em',
            color: '#a89f8e',
            textTransform: 'uppercase',
            marginBottom: '10px',
          }}>上周</div>
          <div style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: '22px',
            color: '#a89f8e',
            lineHeight: 1.1,
          }}>
            +{weekComparison.lastWeek.income.toLocaleString()}
          </div>
          <div style={{
            fontSize: '10px',
            color: '#b8af9e',
            marginTop: '6px',
          }}>
            净增 ¥{weekComparison.lastWeek.net}
          </div>
        </div>
      </div>

      {/* Hourly Rate Trend */}
      <div style={{
        background: '#f0ebe0',
        borderRadius: '20px',
        padding: '24px 20px',
        boxShadow: '5px 5px 12px #cdc5b8, -5px -5px 12px #fffbf5',
        marginBottom: '24px',
      }}>
        <div style={{
          fontFamily: "'Noto Sans SC', sans-serif",
          fontSize: '10px',
          letterSpacing: '0.3em',
          color: '#a89f8e',
          textTransform: 'uppercase',
          marginBottom: '16px',
        }}>
          时薪趋势
        </div>
        {!hasTimeData ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#c5bdb0',
            fontSize: '13px',
          }}>
            暂无工时记录
            <div style={{ fontSize: '11px', marginTop: '6px', color: '#b8af9e' }}>
              记录收入时加上时间（如：比心200 2小时）
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rateData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e1d5" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 10, fill: '#a89f8e' }}
                  axisLine={{ stroke: '#e8e1d5' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#a89f8e' }}
                  axisLine={false}
                  tickLine={false}
                  unit="/h"
                />
                <Tooltip
                  contentStyle={{
                    background: '#f0ebe0',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '4px 4px 12px #cdc5b8',
                    fontSize: '12px',
                    color: '#3d3427',
                  }}
                  formatter={(value: any) => [`¥${value}/h`, '时薪']}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#6b9fcf"
                  strokeWidth={2.5}
                  dot={{ fill: '#6b9fcf', strokeWidth: 0, r: 4 }}
                  activeDot={{ fill: '#c9923a', r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Bottom row: Pie + Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '10px',
      }}>
        {/* Source Distribution Pie */}
        <div style={{
          background: '#f0ebe0',
          borderRadius: '20px',
          padding: '24px 16px',
          boxShadow: '5px 5px 12px #cdc5b8, -5px -5px 12px #fffbf5',
        }}>
          <div style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '10px',
            letterSpacing: '0.3em',
            color: '#a89f8e',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}>
            来源分布
          </div>
          {!hasIncome ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#c5bdb0', fontSize: '13px' }}>
              暂无收入记录
            </div>
          ) : (
            <div style={{ width: '100%', height: '180px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#f0ebe0',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '4px 4px 12px #cdc5b8',
                      fontSize: '12px',
                      color: '#3d3427',
                    }}
                    formatter={(value: any, name: any) => [`¥${Number(value).toLocaleString()}`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                display: 'flex',
                justifyContent: 'center',
                gap: '10px',
                flexWrap: 'wrap',
              }}>
                {pieData.slice(0, 3).map((entry, index) => (
                  <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: COLORS[index % COLORS.length],
                    }} />
                    <span style={{ fontSize: '10px', color: '#a89f8e' }}>{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats column */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          <div style={{
            background: '#f0ebe0',
            borderRadius: '14px',
            padding: '16px 12px',
            boxShadow: '5px 5px 12px #cdc5b8, -5px -5px 12px #fffbf5',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: "'Noto Serif SC', serif",
              fontSize: '18px',
              color: '#6b9fcf',
            }}>¥{stats.avgIncome}</div>
            <div style={{ fontSize: '9px', color: '#a89f8e', marginTop: '4px', letterSpacing: '0.08em' }}>
              平均单笔
            </div>
          </div>
          <div style={{
            background: '#f0ebe0',
            borderRadius: '14px',
            padding: '16px 12px',
            boxShadow: '5px 5px 12px #cdc5b8, -5px -5px 12px #fffbf5',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: "'Noto Serif SC', serif",
              fontSize: '18px',
              color: stats.loyalBosses.length > 0 ? '#6b9fcf' : '#a89f8e',
            }}>{stats.loyalBosses.length}</div>
            <div style={{ fontSize: '9px', color: '#a89f8e', marginTop: '4px', letterSpacing: '0.08em' }}>
              回头老板
            </div>
          </div>
          <div style={{
            background: '#f0ebe0',
            borderRadius: '14px',
            padding: '16px 12px',
            boxShadow: '5px 5px 12px #cdc5b8, -5px -5px 12px #fffbf5',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: "'Noto Serif SC', serif",
              fontSize: '18px',
              color: stats.net >= 0 ? '#6b9fcf' : '#c9923a',
            }}>¥{Math.abs(stats.net)}</div>
            <div style={{ fontSize: '9px', color: '#a89f8e', marginTop: '4px', letterSpacing: '0.08em' }}>
              {stats.net >= 0 ? '净盈余' : '净亏损'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
