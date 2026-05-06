import { useState, useMemo } from 'react';
import { useLedger } from '../store/useLedger';

export function Records() {
  const { transactions } = useLedger();
  const [search, setSearch] = useState('');

  const filteredTx = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => b.date - a.date);
    if (!search.trim()) return sorted;
    const q = search.trim().toLowerCase();
    return sorted.filter(tx => {
      const noteMatch = (tx.note || '').toLowerCase().includes(q);
      const catMatch = (tx.category || '').toLowerCase().includes(q);
      const platMatch = (tx.platform || '').toLowerCase().includes(q);
      const amountMatch = tx.amount.toString().includes(q);
      const bossMatch = (tx.bossName || '').toLowerCase().includes(q);
      return noteMatch || catMatch || platMatch || amountMatch || bossMatch;
    });
  }, [transactions, search]);

  const todayIncome = transactions
    .filter(t => t.type === 'income' && t.date >= new Date().setHours(0, 0, 0, 0))
    .reduce((s, t) => s + t.amount, 0);
  const todayExpense = transactions
    .filter(t => t.type === 'expense' && t.date >= new Date().setHours(0, 0, 0, 0))
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div style={{
      padding: '48px 24px 100px',
      maxWidth: '560px',
      margin: '0 auto',
      minHeight: '100dvh',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
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
          fontSize: '20px',
          fontWeight: 500,
          color: '#3d3427',
          letterSpacing: '-0.01em',
        }}>全部记录</h1>
      </div>

      {/* Search */}
      <div style={{
        marginBottom: '20px',
        padding: '12px 16px',
        background: '#f0ebe0',
        borderRadius: '16px',
        boxShadow: 'inset 4px 4px 8px #cdc5b8, inset -4px -4px 8px #fffbf5',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#a89f8e" strokeWidth="1.5">
          <circle cx="7" cy="7" r="5" />
          <line x1="11" y1="11" x2="15" y2="15" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜索记录..."
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '14px',
            color: '#3d3427',
            outline: 'none',
          }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#a89f8e',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            清除
          </button>
        )}
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '10px',
        marginBottom: '24px',
      }}>
        <div style={{
          background: '#f0ebe0',
          borderRadius: '14px',
          padding: '14px',
          textAlign: 'center',
          boxShadow: '4px 4px 10px #cdc5b8, -4px -4px 10px #fffbf5',
        }}>
          <div style={{ fontSize: '18px', color: '#6b9fcf', fontFamily: "'Noto Serif SC', serif" }}>+{todayIncome.toFixed(0)}</div>
          <div style={{ fontSize: '9px', color: '#b8af9e', marginTop: '4px', letterSpacing: '0.1em' }}>今日收入</div>
        </div>
        <div style={{
          background: '#f0ebe0',
          borderRadius: '14px',
          padding: '14px',
          textAlign: 'center',
          boxShadow: '4px 4px 10px #cdc5b8, -4px -4px 10px #fffbf5',
        }}>
          <div style={{ fontSize: '18px', color: '#c9923a', fontFamily: "'Noto Serif SC', serif" }}>-{todayExpense.toFixed(0)}</div>
          <div style={{ fontSize: '9px', color: '#b8af9e', marginTop: '4px', letterSpacing: '0.1em' }}>今日支出</div>
        </div>
        <div style={{
          background: '#f0ebe0',
          borderRadius: '14px',
          padding: '14px',
          textAlign: 'center',
          boxShadow: '4px 4px 10px #cdc5b8, -4px -4px 10px #fffbf5',
        }}>
          <div style={{ fontSize: '18px', color: '#3d3427', fontFamily: "'Noto Serif SC', serif" }}>{transactions.length}</div>
          <div style={{ fontSize: '9px', color: '#b8af9e', marginTop: '4px', letterSpacing: '0.1em' }}>总记录</div>
        </div>
      </div>

      {/* Results count */}
      <div style={{
        fontSize: '11px',
        color: '#a89f8e',
        marginBottom: '12px',
        letterSpacing: '0.08em',
      }}>
        {search ? `搜索「${search}」找到 ${filteredTx.length} 条` : `共 ${filteredTx.length} 条记录`}
      </div>

      {/* Transaction list — scrollable container */}
      <div style={{
        maxHeight: 'calc(100dvh - 340px)',
        overflowY: 'auto',
        padding: '4px 2px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        {filteredTx.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: '#c5bdb0',
            background: '#f0ebe0',
            borderRadius: '16px',
            boxShadow: 'inset 4px 4px 8px #cdc5b8, inset -4px -4px 8px #fffbf5',
          }}>
            {search ? '没有找到匹配的记录' : '暂无记录'}
          </div>
        ) : (
          filteredTx.map(tx => (
            <div key={tx.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 18px',
              background: '#f0ebe0',
              borderRadius: '14px',
              boxShadow: 'inset 3px 3px 6px #cdc5b8, inset -3px -3px 6px #fffbf5',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, overflow: 'hidden' }}>
                <span style={{
                  fontFamily: "'Noto Sans SC', sans-serif",
                  fontSize: '13px',
                  color: '#3d3427',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {tx.note || tx.platform || tx.category || '未分类'}
                </span>
                <span style={{ fontSize: '10px', color: '#a89f8e', display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span>{new Date(tx.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  {tx.category && <span style={{ padding: '1px 6px', background: '#e8e1d5', borderRadius: '4px', fontSize: '9px' }}>{tx.category}</span>}
                  {tx.platform && <span style={{ padding: '1px 6px', background: '#e8e1d5', borderRadius: '4px', fontSize: '9px' }}>{tx.platform}</span>}
                  {tx.judgment && (
                    <span style={{
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontSize: '9px',
                      color: tx.judgment === 'worthy' ? '#6b9fcf' : '#c9923a',
                      background: tx.judgment === 'worthy' ? 'rgba(107,159,207,0.15)' : 'rgba(201,146,58,0.15)',
                    }}>
                      {tx.judgment === 'worthy' ? '值得' : '不值'}
                    </span>
                  )}
                </span>
              </div>
              <div style={{
                fontFamily: "'Noto Serif SC', serif",
                fontSize: '16px',
                color: tx.type === 'income' ? '#6b9fcf' : '#c9923a',
                letterSpacing: '-0.01em',
                marginLeft: '12px',
              }}>
                {tx.type === 'income' ? '+' : '-'}{tx.amount}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
