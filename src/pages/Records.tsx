import { useState, useMemo, useRef, useEffect } from 'react';
import { useLedger } from '../store/useLedger';
import { useRecordsFilter } from '../hooks/useRecordsFilter';
import { useRecordsInfinite } from '../hooks/useRecordsInfinite';
import { useTags } from '../store/useTags';
import type { Transaction } from '../store/db';
import { RecordsFilterBar } from '../components/records/RecordsFilterBar';
import { MonthlyStats } from '../components/records/MonthlyStats';
import { TagPicker } from '../components/tags/TagPicker';

const PLATFORMS = ['比心', '微信', '抖音', '小红书', '建行', '招行'];
const EXPENSE_CATEGORIES = ['交通', '餐饮', '娱乐', '购物', '住房', '医疗', '通讯', '其他'];

function fmtDuration(min: number): string {
  if (!min) return '';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0 && m > 0) return `${h}小时${m}分钟`;
  if (h > 0) return `${h}小时`;
  return `${m}分钟`;
}

interface EditModalProps {
  tx: Transaction;
  onClose: () => void;
  onSave: (patch: Partial<Transaction>) => void;
}

function EditModal({ tx, onClose, onSave }: EditModalProps) {
  const [amount, setAmount] = useState(String(tx.amount));
  const [platform, setPlatform] = useState(tx.platform || '');
  const [category, setCategory] = useState(tx.category || '');
  const [bossName, setBossName] = useState(tx.bossName || '');
  const [timeSpent, setTimeSpent] = useState(tx.timeSpent || 0);
  const [note, setNote] = useState(tx.note || '');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(tx.tags || []);
  const isIncome = tx.type === 'income';

  function handleSave() {
    const patch: Partial<Transaction> = {
      amount: parseFloat(amount) || 0,
      note: note || undefined,
    };
    if (isIncome) {
      patch.platform = platform || undefined;
      patch.bossName = bossName || undefined;
      patch.timeSpent = timeSpent || undefined;
    } else {
      patch.category = category || undefined;
      patch.tags = selectedTagIds.length > 0 ? selectedTagIds : undefined;
    }
    onSave(patch);
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '480px',
      background: 'var(--bg-card)',
      borderRadius: '20px 20px 0 0',
      padding: '24px',
      borderTop: '1px solid var(--border-subtle)',
      animation: 'slideUpEdit 0.3s ease-out',
    }}>
      <style>{`
        @keyframes slideUpEdit {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>

      <h3 style={{
        fontFamily: 'var(--font-display)', color: 'var(--text-primary)',
        fontSize: '18px', fontWeight: 400, marginBottom: '20px', textAlign: 'center',
      }}>
        编辑记录
      </h3>

      {/* 金额 */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block', fontSize: '12px', color: 'var(--text-secondary)',
          marginBottom: '6px', letterSpacing: '0.1em',
        }}>金额</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            width: '100%', padding: '12px 16px', background: 'var(--glass-bg)',
            border: '1px solid var(--border-subtle)', borderRadius: '10px',
            color: 'var(--text-primary)', fontFamily: 'var(--font-display)',
            fontSize: '18px', textAlign: 'center', outline: 'none',
          }}
        />
      </div>

      {/* 平台 / 分类 */}
      {isIncome ? (
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block', fontSize: '12px', color: 'var(--text-secondary)',
            marginBottom: '6px', letterSpacing: '0.1em',
          }}>平台</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {PLATFORMS.map(p => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                style={{
                  padding: '8px 14px', borderRadius: '8px',
                  border: `1.5px solid ${platform === p ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                  background: platform === p ? 'rgba(107,159,207,0.15)' : 'transparent',
                  color: platform === p ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s ease',
                }}
              >{p}</button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block', fontSize: '12px', color: 'var(--text-secondary)',
            marginBottom: '6px', letterSpacing: '0.1em',
          }}>分类</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {EXPENSE_CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{
                  padding: '8px 14px', borderRadius: '8px',
                  border: `1.5px solid ${category === c ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                  background: category === c ? 'rgba(232,184,75,0.15)' : 'transparent',
                  color: category === c ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s ease',
                }}
              >{c}</button>
            ))}
          </div>
        </div>
      )}

      {/* 标签（仅支出） */}
      {!isIncome && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block', fontSize: '12px', color: 'var(--text-secondary)',
            marginBottom: '6px', letterSpacing: '0.1em',
          }}>标签 <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>（可选）</span></label>
          <TagPicker selectedIds={selectedTagIds} onChange={setSelectedTagIds} />
        </div>
      )}

      {/* 老板名 */}
      {isIncome && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block', fontSize: '12px', color: 'var(--text-secondary)',
            marginBottom: '6px', letterSpacing: '0.1em',
          }}>老板名 <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>（可选）</span></label>
          <input
            type="text"
            value={bossName}
            onChange={(e) => setBossName(e.target.value)}
            placeholder="不填也可以"
            style={{
              width: '100%', padding: '12px 16px', background: 'var(--glass-bg)',
              border: '1px solid var(--border-subtle)', borderRadius: '10px',
              color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
              fontSize: '14px', outline: 'none',
            }}
          />
        </div>
      )}

      {/* 花费时间 */}
      {isIncome && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block', fontSize: '12px', color: 'var(--text-secondary)',
            marginBottom: '6px', letterSpacing: '0.1em',
          }}>花费时间 <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>（可选，分钟）</span></label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="number"
              value={timeSpent || ''}
              onChange={(e) => setTimeSpent(parseInt(e.target.value) || 0)}
              placeholder="例如 60"
              min="0"
              style={{
                flex: 1, padding: '12px 16px', background: 'var(--glass-bg)',
                border: '1px solid var(--border-subtle)', borderRadius: '10px',
                color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
                fontSize: '14px', outline: 'none',
              }}
            />
            {timeSpent > 0 && (
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                {fmtDuration(timeSpent)}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
            {[30, 60, 90, 120].map(m => (
              <button
                key={m}
                onClick={() => setTimeSpent(m)}
                style={{
                  padding: '4px 10px', borderRadius: '6px',
                  border: `1.5px solid ${timeSpent === m ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                  background: timeSpent === m ? 'rgba(107,159,207,0.15)' : 'transparent',
                  color: timeSpent === m ? 'var(--accent-blue)' : 'var(--text-muted)',
                  fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >{m >= 60 ? `${m / 60}h` : `${m}分钟`}</button>
            ))}
            <button
              onClick={() => setTimeSpent(0)}
              style={{
                padding: '4px 10px', borderRadius: '6px',
                border: `1.5px solid ${timeSpent === 0 ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                background: timeSpent === 0 ? 'rgba(201,146,58,0.15)' : 'transparent',
                color: timeSpent === 0 ? 'var(--accent-gold)' : 'var(--text-muted)',
                fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}
            >不填</button>
          </div>
        </div>
      )}

      {/* 备注 */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block', fontSize: '12px', color: 'var(--text-secondary)',
          marginBottom: '6px', letterSpacing: '0.1em',
        }}>备注</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="输入备注"
          style={{
            width: '100%', padding: '12px 16px', background: 'var(--glass-bg)',
            border: '1px solid var(--border-subtle)', borderRadius: '10px',
            color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
            fontSize: '14px', outline: 'none',
          }}
        />
      </div>

      {/* 按钮 */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={onClose}
          style={{
            flex: 1, padding: '14px', borderRadius: '12px',
            border: '1px solid var(--border-subtle)', background: 'transparent',
            color: 'var(--text-muted)', fontFamily: 'var(--font-body)',
            fontSize: '14px', cursor: 'pointer',
          }}
        >取消</button>
        <button
          onClick={handleSave}
          style={{
            flex: 1, padding: '14px', borderRadius: '12px',
            border: 'none', background: 'var(--accent-blue)', color: '#0D0D10',
            fontFamily: 'var(--font-body)', fontSize: '14px',
            fontWeight: 500, cursor: 'pointer',
          }}
        >保存</button>
      </div>
    </div>
  );
}

export function Records() {
  const pageRef = useRef<HTMLDivElement>(null);
  const { transactions, updateTransaction, deleteTransaction } = useLedger();
  const { tags: allTags } = useTags();
  const [search, setSearch] = useState('');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const {
    filterState,
    setTimeRange,
    setCustomDateRange,
    setType,
    setCategory,
    setTagIds,
    setSort,
    filteredTransactions,
    monthlyStats,
  } = useRecordsFilter(transactions);

  const { visibleTransactions, loadMore, hasMore, reset } = useRecordsInfinite(filteredTransactions);

  // Reset pagination when filter changes
  useEffect(() => {
    reset();
  }, [filterState, reset]);

  // Search-filtered subset (applied on top of useRecordsFilter)
  const displayTransactions = useMemo(() => {
    if (!search.trim()) return visibleTransactions;
    const q = search.trim().toLowerCase();
    return visibleTransactions.filter(tx => {
      const noteMatch = (tx.note || '').toLowerCase().includes(q);
      const catMatch = (tx.category || '').toLowerCase().includes(q);
      const platMatch = (tx.platform || '').toLowerCase().includes(q);
      const amountMatch = tx.amount.toString().includes(q);
      const bossMatch = (tx.bossName || '').toLowerCase().includes(q);
      return noteMatch || catMatch || platMatch || amountMatch || bossMatch;
    });
  }, [visibleTransactions, search]);

  // RecordsFilterBar uses a slightly different state shape — adapt it
  const filterBarState = useMemo(() => ({
    timeRange: filterState.timeRange,
    customStart: filterState.customDateRange
      ? new Date(filterState.customDateRange.start).toISOString().split('T')[0]
      : undefined,
    customEnd: filterState.customDateRange
      ? new Date(filterState.customDateRange.end).toISOString().split('T')[0]
      : undefined,
    type: filterState.type as 'all' | 'income' | 'expense',
    category: filterState.category,
    tagIds: filterState.tagIds,
    sort: filterState.sort,
  }), [filterState]);

  function handleSetTimeRange(range: 'all' | 'today' | 'week' | 'month' | 'custom') {
    setTimeRange(range);
  }

  function handleSetCustomDateRange(start: string, end: string) {
    if (!start || !end) return;
    setCustomDateRange({
      start: new Date(start).getTime(),
      end: new Date(end).getTime() + 24 * 60 * 60 * 1000 - 1,
    });
  }

  function handleSetCategory(category: string) {
    setCategory(category === '全部' ? '' : category);
  }

  return (
    <>
      <div ref={pageRef} style={{
        padding: '48px 24px 100px',
        maxWidth: '560px',
        margin: '0 auto',
        minHeight: '100dvh',
      }}>
        {/* Header */}
        <div className="animate-in" style={{ marginBottom: '24px' }}>
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

        {/* Filter bar */}
        <div className="animate-in">
          <RecordsFilterBar
            filterState={filterBarState}
            setTimeRange={handleSetTimeRange}
            setCustomDateRange={handleSetCustomDateRange}
            setType={setType}
            setCategory={handleSetCategory}
            setTagIds={setTagIds}
            setSort={setSort}
            allTags={allTags}
          />
        </div>

        {/* Monthly stats */}
        <div className="animate-in" style={{ marginBottom: '16px' }}>
          <MonthlyStats stats={monthlyStats} />
        </div>

        {/* Search */}
        <div className="animate-in" style={{
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
            >清除</button>
          )}
        </div>

        {/* Results count */}
        <div className="animate-in" style={{
          fontSize: '11px',
          color: '#a89f8e',
          marginBottom: '12px',
          letterSpacing: '0.08em',
        }}>
          {search
            ? `搜索「${search}」找到 ${displayTransactions.length} 条`
            : `共 ${displayTransactions.length} 条${displayTransactions.length < filteredTransactions.length ? `（共 ${filteredTransactions.length} 条）` : ''}`}
        </div>

        {/* Transaction list */}
        <div className="animate-in" style={{
          maxHeight: 'calc(100dvh - 420px)',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '4px 2px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          {displayTransactions.length === 0 ? (
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
            displayTransactions.map(tx => (
              <div
                key={tx.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 18px',
                  background: '#f0ebe0',
                  borderRadius: '14px',
                  boxShadow: 'inset 3px 3px 6px #cdc5b8, inset -3px -3px 6px #fffbf5',
                }}
              >
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  flex: 1,
                  overflow: 'hidden',
                }}>
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
                  <span style={{
                    fontSize: '10px',
                    color: '#a89f8e',
                    display: 'flex',
                    gap: '6px',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}>
                    <span>{new Date(tx.date).toLocaleDateString('zh-CN', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}</span>
                    {tx.category && (
                      <span style={{
                        padding: '1px 6px', background: '#e8e1d5',
                        borderRadius: '4px', fontSize: '9px',
                      }}>{tx.category}</span>
                    )}
                    {tx.platform && (
                      <span style={{
                        padding: '1px 6px', background: '#e8e1d5',
                        borderRadius: '4px', fontSize: '9px',
                      }}>{tx.platform}</span>
                    )}
                    {tx.bossName && (
                      <span style={{
                        padding: '1px 6px', background: 'rgba(107,159,207,0.15)',
                        borderRadius: '4px', fontSize: '9px', color: '#6b9fcf',
                      }}>{tx.bossName}</span>
                    )}
                    {tx.timeSpent && (
                      <span style={{
                        padding: '1px 6px', background: 'rgba(201,146,58,0.12)',
                        borderRadius: '4px', fontSize: '9px', color: '#c9923a',
                      }}>{fmtDuration(tx.timeSpent)}</span>
                    )}
                    {tx.judgment && (
                      <span style={{
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontSize: '9px',
                        color: tx.judgment === 'worthy' ? '#6b9fcf' : '#c9923a',
                        background: tx.judgment === 'worthy'
                          ? 'rgba(107,159,207,0.15)'
                          : 'rgba(201,146,58,0.15)',
                      }}>
                        {tx.judgment === 'worthy' ? '值得' : '不值'}
                      </span>
                    )}
                    {(tx.tags || []).map(tagId => {
                      const tag = allTags.find(t => t.id === tagId);
                      if (!tag) return null;
                      return (
                        <span key={tagId} style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontSize: '9px',
                          color: tag.color,
                          background: `${tag.color}18`,
                          border: `1px solid ${tag.color}40`,
                        }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: tag.color, flexShrink: 0 }} />
                          {tag.name}
                        </span>
                      );
                    })}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginLeft: '12px',
                  flexShrink: 0,
                }}>
                  <button
                    onClick={() => setEditingTx(tx)}
                    title="编辑"
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#c5bdb0',
                      cursor: 'pointer',
                      fontSize: '13px',
                      padding: '4px',
                      borderRadius: '4px',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#a89f8e')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#c5bdb0')}
                  >✎</button>
                  <button
                    onClick={() => {
                      if (!window.confirm(`确定删除这条记录吗？\n${tx.note || tx.platform || '未分类'} ${tx.type === 'income' ? '+' : '-'}${tx.amount} 元`)) return;
                      deleteTransaction(tx.id);
                    }}
                    title="删除"
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#d4b0b0',
                      cursor: 'pointer',
                      fontSize: '14px',
                      padding: '4px',
                      borderRadius: '4px',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#c07070')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#d4b0b0')}
                  >✕</button>
                  <span style={{
                    fontFamily: "'Noto Serif SC', serif",
                    fontSize: '16px',
                    color: tx.type === 'income' ? '#6b9fcf' : '#c9923a',
                    letterSpacing: '-0.01em',
                  }}>
                    {tx.type === 'income' ? '+' : '-'}{tx.amount}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load more */}
        {hasMore && (
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <button
              onClick={loadMore}
              style={{
                padding: '10px 24px',
                borderRadius: '10px',
                border: '1.5px solid #d8d0c4',
                background: '#f0ebe0',
                color: '#7a7269',
                fontFamily: "'Noto Sans SC', sans-serif",
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              加载更多
            </button>
          </div>
        )}
      </div>

      {/* 编辑弹窗 */}
      {editingTx && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}>
          <EditModal
            tx={editingTx}
            onClose={() => setEditingTx(null)}
            onSave={(patch) => {
              updateTransaction(editingTx.id, patch);
              setEditingTx(null);
            }}
          />
        </div>
      )}
    </>
  );
}