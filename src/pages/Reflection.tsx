import { useMemo, useRef, useEffect } from 'react';
import { useLedger } from '../store/useLedger';
import gsap from 'gsap';

export function Reflection() {
  const { transactions } = useLedger();
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pageRef.current) return;
    const sections = pageRef.current.querySelectorAll('.animate-in');
    gsap.fromTo(sections,
      { y: 36, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.65, stagger: 0.1, ease: 'power2.out', delay: 0.1 }
    );
    const items = pageRef.current.querySelectorAll('.tx-item');
    gsap.fromTo(items,
      { x: -20, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out', delay: 0.4 }
    );
  }, [transactions.length]);

  const { worthyTx, unworthyTx, worthyTotal, unworthyTotal, worthyCount, unworthyCount } = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const worthy = expenses.filter(t => t.judgment === 'worthy').sort((a, b) => b.date - a.date);
    const unworthy = expenses.filter(t => t.judgment === 'unworthy').sort((a, b) => b.date - a.date);
    return {
      worthyTx: worthy,
      unworthyTx: unworthy,
      worthyTotal: worthy.reduce((s, t) => s + t.amount, 0),
      unworthyTotal: unworthy.reduce((s, t) => s + t.amount, 0),
      worthyCount: worthy.length,
      unworthyCount: unworthy.length,
    };
  }, [transactions]);

  const totalExpense = worthyTotal + unworthyTotal;
  const worthyPct = totalExpense > 0 ? (worthyTotal / totalExpense) * 100 : 0;

  function formatDate(ts: number) {
    const d = new Date(ts);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  }

  return (
    <div ref={pageRef} style={{
      padding: '48px 24px 110px',
      maxWidth: '560px',
      margin: '0 auto',
      minHeight: '100dvh',
    }}>
      {/* Header */}
      <div className="animate-in" style={{ marginBottom: '28px' }}>
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
        }}>支出反思</h1>
      </div>

      {/* Asymmetric Bento Stats */}
      <div className="animate-in" style={{
        display: 'grid',
        gridTemplateColumns: '3fr 2fr',
        gap: '10px',
        marginBottom: '32px',
      }}>
        {/* 值得 */}
        <div style={{
          background: '#f0ebe0',
          borderRadius: '18px',
          padding: '22px 18px',
          boxShadow: '5px 5px 12px #cdc5b8, -5px -5px 12px #fffbf5',
        }}>
          <div style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: '32px',
            color: '#6b9fcf',
            lineHeight: 1.1,
          }}>
            ¥{worthyTotal.toLocaleString()}
          </div>
          <div style={{
            fontSize: '11px',
            color: '#6b9fcf',
            marginTop: '8px',
            letterSpacing: '0.12em',
          }}>
            值得 · {worthyCount} 笔
          </div>
          <div style={{
            marginTop: '10px',
            height: '4px',
            borderRadius: '2px',
            background: '#e8e1d5',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${worthyPct}%`,
              height: '100%',
              background: '#6b9fcf',
              borderRadius: '2px',
            }} />
          </div>
        </div>

        {/* 不值 */}
        <div style={{
          background: '#f0ebe0',
          borderRadius: '18px',
          padding: '22px 18px',
          boxShadow: '5px 5px 12px #cdc5b8, -5px -5px 12px #fffbf5',
        }}>
          <div style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: '24px',
            color: '#c9923a',
            lineHeight: 1.1,
          }}>
            ¥{unworthyTotal.toLocaleString()}
          </div>
          <div style={{
            fontSize: '11px',
            color: '#c9923a',
            marginTop: '8px',
            letterSpacing: '0.12em',
          }}>
            不值 · {unworthyCount} 笔
          </div>
        </div>
      </div>

      {/* 不值得的支出 */}
      <div className="animate-in" style={{ marginBottom: '28px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: '14px',
          paddingLeft: '4px',
        }}>
          <div style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '10px',
            letterSpacing: '0.3em',
            color: '#c9923a',
            textTransform: 'uppercase',
          }}>
            不值得的支出
          </div>
          <div style={{ fontSize: '10px', color: '#c5bdb0' }}>
            {unworthyCount === 0 ? '' : `下次可以避免 ¥${unworthyTotal}`}
          </div>
        </div>

        {unworthyCount === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '32px 20px',
            background: '#f0ebe0',
            borderRadius: '16px',
            boxShadow: 'inset 4px 4px 8px #cdc5b8, inset -4px -4px 8px #fffbf5',
            color: '#c5bdb0',
            fontSize: '13px',
          }}>
            暂无不值的支出，继续保持 💡
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {unworthyTx.slice(0, 5).map(tx => (
              <div key={tx.id} className="tx-item" style={{
                padding: '14px 18px',
                background: '#f0ebe0',
                borderRadius: '14px',
                boxShadow: 'inset 3px 3px 6px #cdc5b8, inset -3px -3px 6px #fffbf5',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
                }}>
                  <div style={{
                    fontFamily: "'Noto Sans SC', sans-serif",
                    fontSize: '13px',
                    color: '#3d3427',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                  }}>
                    {tx.note || tx.category || '未分类'}
                  </div>
                  <div style={{
                    fontFamily: "'Noto Serif SC', serif",
                    fontSize: '15px',
                    color: '#c9923a',
                    marginLeft: '10px',
                    flexShrink: 0,
                  }}>
                    -{tx.amount}
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: '10px', color: '#a89f8e' }}>
                    {formatDate(tx.date)}
                    {tx.category ? ` · ${tx.category}` : ''}
                  </span>
                  <span style={{
                    fontSize: '10px',
                    color: '#c9923a',
                    background: 'rgba(201,146,58,0.1)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}>
                    不值
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 值得的支出 */}
      <div className="animate-in">
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: '14px',
          paddingLeft: '4px',
        }}>
          <div style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '10px',
            letterSpacing: '0.3em',
            color: '#6b9fcf',
            textTransform: 'uppercase',
          }}>
            值得的支出
          </div>
        </div>

        {worthyCount === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '32px 20px',
            background: '#f0ebe0',
            borderRadius: '16px',
            boxShadow: 'inset 4px 4px 8px #cdc5b8, inset -4px -4px 8px #fffbf5',
            color: '#c5bdb0',
            fontSize: '13px',
          }}>
            暂无值得标记的支出
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {worthyTx.slice(0, 5).map(tx => (
              <div key={tx.id} className="tx-item" style={{
                padding: '14px 18px',
                background: '#f0ebe0',
                borderRadius: '14px',
                boxShadow: 'inset 3px 3px 6px #cdc5b8, inset -3px -3px 6px #fffbf5',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
                }}>
                  <div style={{
                    fontFamily: "'Noto Sans SC', sans-serif",
                    fontSize: '13px',
                    color: '#3d3427',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                  }}>
                    {tx.note || tx.category || '未分类'}
                  </div>
                  <div style={{
                    fontFamily: "'Noto Serif SC', serif",
                    fontSize: '15px',
                    color: '#6b9fcf',
                    marginLeft: '10px',
                    flexShrink: 0,
                  }}>
                    -{tx.amount}
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: '10px', color: '#a89f8e' }}>
                    {formatDate(tx.date)}
                    {tx.category ? ` · ${tx.category}` : ''}
                  </span>
                  <span style={{
                    fontSize: '10px',
                    color: '#6b9fcf',
                    background: 'rgba(107,159,207,0.1)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}>
                    值得
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
