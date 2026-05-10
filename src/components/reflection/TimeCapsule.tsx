import { useState, useMemo } from 'react';
import type { Transaction } from '../../store/db';

interface TimeCapsuleProps {
  transactions: Transaction[];
  updateTransaction: (id: string, patch: Partial<Transaction>) => Promise<void>;
}

function getLastMonthRange() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastMonth = month === 0 ? 11 : month - 1;
  const lastYear = month === 0 ? year - 1 : year;
  const start = new Date(lastYear, lastMonth, 1).getTime();
  const end = new Date(year, month, 1).getTime();
  const label = `${lastYear}年${lastMonth + 1}月`;
  return { start, end, label };
}

function formatDate(ts: number) {
  const d = new Date(ts);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function TimeCapsule({ transactions, updateTransaction }: TimeCapsuleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [regrettedIds, setRegrettedIds] = useState<Set<string>>(new Set());
  const [demoMode, setDemoMode] = useState(false);

  const { start, end, label } = useMemo(() => {
    if (demoMode) {
      // Demo: 2026年4月
      return { start: new Date(2026, 3, 1).getTime(), end: new Date(2026, 4, 1).getTime(), label: '2026年4月' };
    }
    return getLastMonthRange();
  }, [demoMode]);

  const lastMonthWorthy = useMemo(() => {
    if (demoMode) {
      return [
        { id: 'demo1', type: 'expense' as const, amount: 299, date: new Date(2026, 3, 5).getTime(), category: '餐饮', note: '火锅', judgment: 'worthy' as const },
        { id: 'demo2', type: 'expense' as const, amount: 150, date: new Date(2026, 3, 8).getTime(), category: '交通', note: '打车', judgment: 'worthy' as const },
        { id: 'demo3', type: 'expense' as const, amount: 599, date: new Date(2026, 3, 12).getTime(), category: '购物', note: '游戏皮肤', judgment: 'worthy' as const },
        { id: 'demo4', type: 'expense' as const, amount: 89, date: new Date(2026, 3, 15).getTime(), category: '餐饮', note: '奶茶', judgment: 'worthy' as const },
        { id: 'demo5', type: 'expense' as const, amount: 1200, date: new Date(2026, 3, 20).getTime(), category: '设备', note: '耳机垫', judgment: 'worthy' as const },
      ];
    }
    return transactions
      .filter((t) => t.type === 'expense' && t.judgment === 'worthy' && t.date >= start && t.date < end)
      .sort((a, b) => b.date - a.date);
  }, [transactions, start, end, demoMode]);

  const total = lastMonthWorthy.length;
  const regretCount = regrettedIds.size;
  const regretRate = total > 0 ? Math.round((regretCount / total) * 100) : 0;

  const categoryStats = useMemo(() => {
    const map = new Map<string, { total: number; regret: number }>();
    for (const tx of lastMonthWorthy) {
      const cat = tx.category || '未分类';
      const stat = map.get(cat) || { total: 0, regret: 0 };
      stat.total++;
      if (regrettedIds.has(tx.id)) stat.regret++;
      map.set(cat, stat);
    }
    return Array.from(map.entries())
      .map(([category, stat]) => ({ category, ...stat, rate: stat.total > 0 ? Math.round((stat.regret / stat.total) * 100) : 0 }))
      .sort((a, b) => b.rate - a.rate);
  }, [lastMonthWorthy, regrettedIds]);

  const handleRegret = async (id: string) => {
    if (demoMode) {
      setRegrettedIds((prev) => new Set(prev).add(id));
      return;
    }
    setRegrettedIds((prev) => new Set(prev).add(id));
    await updateTransaction(id, { judgment: 'unworthy' });
  };

  const insight = useMemo(() => {
    if (total === 0) return '上个月没有标记「值得」的支出，试着多记录一些感受。';
    if (regretRate === 0) return '你的判断力很稳，所有选择仍然值得。';
    if (regretRate <= 30) return '大部分判断仍然正确，继续保持这份清醒。';
    if (regretRate <= 60) return '部分支出开始动摇，注意冲动消费的时刻。';
    return '超过一半后悔了，建议提高支出前的思考时间。';
  }, [total, regretRate]);

  if (!isOpen) {
    return (
      <div className="animate-in" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button
            onClick={() => { setDemoMode(true); setIsOpen(true); }}
            style={{
              flex: 1,
              padding: '12px',
              background: '#f0ebe0',
              borderRadius: '12px',
              border: 'none',
              boxShadow: '3px 3px 6px #cdc5b8, -3px -3px 6px #fffbf5',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '12px',
              color: '#a89f8e',
              transition: 'all 0.2s ease',
            }}
          >
            👁️ 预览演示
          </button>
          <button
            onClick={() => { setDemoMode(false); setIsOpen(true); }}
            style={{
              flex: 1,
              padding: '12px',
              background: '#f0ebe0',
              borderRadius: '12px',
              border: 'none',
              boxShadow: '3px 3px 6px #cdc5b8, -3px -3px 6px #fffbf5',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: '#a89f8e',
              transition: 'all 0.2s ease',
            }}
          >
            开启时间胶囊
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="animate-in"
      style={{
        marginBottom: '32px',
        background: '#f0ebe0',
        borderRadius: '18px',
        padding: '22px 18px',
        boxShadow: '5px 5px 12px #cdc5b8, -5px -5px 12px #fffbf5',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ fontFamily: "'Noto Sans SC', sans-serif", fontSize: '14px', fontWeight: 500, color: '#3d3427' }}>
            {demoMode && <span style={{ fontSize: '10px', background: 'rgba(201,146,58,0.12)', color: '#c9923a', padding: '2px 6px', borderRadius: '6px', marginRight: '6px' }}>演示</span>}
            时间胶囊 · {label}
          </div>
          <div style={{ fontSize: '11px', color: '#a89f8e', marginTop: '2px' }}>
            {total === 0 ? '无数据' : `${total} 笔支出 · 重新打分`}
          </div>
        </div>
        <button
          onClick={() => { setIsOpen(false); setRegrettedIds(new Set()); setDemoMode(false); }}
          style={{
            width: '28px', height: '28px', borderRadius: '50%', border: 'none',
            background: '#f0ebe0', boxShadow: '2px 2px 5px #cdc5b8, -2px -2px 5px #fffbf5',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', color: '#a89f8e',
          }}
        >
          ✕
        </button>
      </div>

      {total === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px', color: '#a89f8e', fontSize: '13px' }}>
          {demoMode ? '演示数据为空' : '上个月没有标记「值得」的支出'}
        </div>
      ) : (
        <>
          {/* Regret Rate */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '20px' }}>
            <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '36px', color: regretRate > 50 ? '#c9923a' : '#6b9fcf', lineHeight: 1 }}>
              <span style={{ fontFamily: "'Courier New', monospace", fontSize: '40px' }}>{regretRate}</span>
              <span style={{ fontSize: '20px' }}>%</span>
            </span>
            <span style={{ fontSize: '11px', color: '#a89f8e', letterSpacing: '0.12em' }}>后悔率</span>
          </div>

          {/* Progress bar */}
          <div style={{ height: '6px', borderRadius: '3px', background: '#e8e1d5', overflow: 'hidden', marginBottom: '20px' }}>
            <div style={{
              width: `${regretRate}%`, height: '100%',
              background: regretRate > 50 ? '#c9923a' : '#6b9fcf',
              borderRadius: '3px',
              transition: 'width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }} />
          </div>

          {/* Transaction list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {lastMonthWorthy.map((tx) => {
              const isRegretted = regrettedIds.has(tx.id);
              return (
                <div
                  key={tx.id}
                  style={{
                    padding: '12px 14px',
                    background: '#f0ebe0',
                    borderRadius: '14px',
                    boxShadow: 'inset 3px 3px 6px #cdc5b8, inset -3px -3px 6px #fffbf5',
                    opacity: isRegretted ? 0.6 : 1,
                    transition: 'opacity 0.25s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{
                      fontFamily: "'Noto Sans SC', sans-serif", fontSize: '13px',
                      color: isRegretted ? '#a89f8e' : '#3d3427',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                      textDecoration: isRegretted ? 'line-through' : 'none',
                    }}>
                      {tx.note || tx.category || '未分类'}
                    </span>
                    <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '14px', color: isRegretted ? '#a89f8e' : '#3d3427', marginLeft: '10px', flexShrink: 0 }}>
                      -{(tx as any).amount}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', color: '#a89f8e' }}>
                      {formatDate((tx as any).date)}{tx.category ? ` · ${tx.category}` : ''}
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {!isRegretted && (
                        <button
                          onClick={() => handleRegret(tx.id)}
                          style={{
                            fontSize: '10px', padding: '3px 10px', borderRadius: '6px', border: 'none',
                            background: '#f0ebe0', boxShadow: '2px 2px 4px #cdc5b8, -2px -2px 4px #fffbf5',
                            color: '#c9923a', cursor: 'pointer',
                          }}
                        >
                          后悔了
                        </button>
                      )}
                      {isRegretted && (
                        <span style={{ fontSize: '10px', padding: '3px 10px', borderRadius: '6px', color: '#c9923a', background: 'rgba(201,146,58,0.1)' }}>
                          已后悔
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Category analysis */}
          {categoryStats.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '10px', letterSpacing: '0.3em', color: '#a89f8e', textTransform: 'uppercase', marginBottom: '12px' }}>
                类别后悔分析
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {categoryStats.map((stat) => (
                  <div key={stat.category} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', color: '#3d3427', width: '60px', flexShrink: 0 }}>{stat.category}</span>
                    <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: '#e8e1d5', overflow: 'hidden' }}>
                      <div style={{ width: `${stat.rate}%`, height: '100%', background: stat.rate > 50 ? '#c9923a' : '#6b9fcf', borderRadius: '2px', transition: 'width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
                    </div>
                    <span style={{ fontFamily: "'Courier New', monospace", fontSize: '11px', color: stat.rate > 50 ? '#c9923a' : '#6b9fcf', width: '36px', textAlign: 'right', flexShrink: 0 }}>{stat.rate}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insight */}
          <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(107,159,207,0.06)', fontSize: '12px', color: '#3d3427', lineHeight: 1.6 }}>
            {insight}
          </div>
        </>
      )}
    </div>
  );
}