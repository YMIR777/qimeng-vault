import React, { useState } from 'react';
import type { Wish, Transaction } from '../../store/db';

interface WishDetailProps {
  wish: Wish;
  transactions: Transaction[];
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
  onDelete: () => void;
  onClose: () => void;
}

const spring = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

export const WishDetail: React.FC<WishDetailProps> = ({
  wish,
  transactions,
  onDeposit,
  onWithdraw,
  onDelete,
  onClose,
}) => {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [mode, setMode] = useState<'none' | 'deposit' | 'withdraw'>('none');

  const progress = Math.min((wish.currentBalance / wish.targetPrice) * 100, 100);
  const isAchieved = wish.status === 'achieved';

  function handleDeposit() {
    const amount = Number(depositAmount);
    if (!amount || amount <= 0) return;
    onDeposit(amount);
    setDepositAmount('');
    setMode('none');
  }

  function handleWithdraw() {
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) return;
    onWithdraw(amount);
    setWithdrawAmount('');
    setMode('none');
  }

  function formatDate(ts: number) {
    const d = new Date(ts);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  }

  const totalContributed = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 90,
          background: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 95,
          background: '#f0ebe0',
          borderRadius: '24px 24px 0 0',
          boxShadow: '0 -8px 32px rgba(163, 158, 148, 0.5)',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Handle */}
        <div style={{ padding: '14px 0 4px', textAlign: 'center' }}>
          <div style={{
            width: '40px', height: '5px', background: '#e8e1d5',
            borderRadius: '3px', margin: '0 auto',
            boxShadow: 'inset 2px 2px 4px #cdc5b8, inset -2px -2px 4px #fffbf5',
          }} />
        </div>

        {/* Header */}
        <div style={{ padding: '16px 24px 20px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '22px', color: '#3d3427' }}>
            {wish.name}
          </div>
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '6px' }}>
            <span style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '28px', color: isAchieved ? '#c9923a' : '#6b9fcf' }}>
              ¥{wish.currentBalance.toLocaleString()}
            </span>
            <span style={{ fontSize: '14px', color: '#a89f8e' }}>
              / ¥{wish.targetPrice.toLocaleString()}
            </span>
          </div>
          {/* Progress */}
          <div style={{ marginTop: '14px', height: '8px', borderRadius: '4px', background: '#e8e1d5', overflow: 'hidden', boxShadow: 'inset 2px 2px 4px #cdc5b8' }}>
            <div style={{
              width: `${progress}%`, height: '100%',
              background: isAchieved
                ? 'linear-gradient(90deg, #c9923a, #e8c97a)'
                : 'linear-gradient(90deg, #6b9fcf, #8fb8d9)',
              borderRadius: '4px', transition: 'width 0.5s ease',
            }} />
          </div>
          <div style={{ marginTop: '6px', fontSize: '10px', color: '#a89f8e', letterSpacing: '0.08em' }}>
            {isAchieved ? '已达成 🎉' : `已完成 ${progress.toFixed(1)}%`}
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 20px' }}>

          {/* Transaction list */}
          <div style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '10px', letterSpacing: '0.3em',
            color: '#a89f8e', textTransform: 'uppercase',
            marginBottom: '12px', paddingLeft: '4px',
          }}>
            存入记录
          </div>

          {transactions.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '32px 20px',
              background: '#f0ebe0', borderRadius: '14px',
              boxShadow: 'inset 3px 3px 6px #cdc5b8, inset -3px -3px 6px #fffbf5',
              color: '#c5bdb0', fontSize: '13px',
            }}>
              暂无存入记录
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {transactions.map(tx => (
                  <div key={tx.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 16px', background: '#f0ebe0', borderRadius: '12px',
                    boxShadow: 'inset 2px 2px 4px #cdc5b8, inset -2px -2px 4px #fffbf5',
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, minWidth: 0 }}>
                      <span style={{
                        fontSize: '13px', color: '#3d3427',
                        fontFamily: "'Noto Sans SC', sans-serif",
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {tx.note || tx.platform || tx.category || '未分类'}
                      </span>
                      <span style={{ fontSize: '10px', color: '#a89f8e' }}>
                        {formatDate(tx.date)} · {tx.platform || tx.category || '收入'}
                      </span>
                    </div>
                    <span style={{
                      fontFamily: "'Noto Serif SC', serif", fontSize: '15px', color: '#6b9fcf',
                      marginLeft: '12px', flexShrink: 0,
                    }}>
                      +{tx.amount}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: '10px', padding: '10px 16px', textAlign: 'right',
                fontSize: '11px', color: '#a89f8e', fontFamily: "'Noto Sans SC', sans-serif",
              }}>
                共 {transactions.length} 笔，合计 ¥{totalContributed.toLocaleString()}
              </div>
            </>
          )}

          {/* Action Buttons */}
          {mode === 'none' && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                onClick={() => setMode('deposit')}
                style={{
                  flex: 1, padding: '14px', borderRadius: '14px', border: 'none',
                  background: '#f0ebe0', color: '#6b9fcf', fontSize: '14px',
                  fontFamily: "'Noto Sans SC', sans-serif", cursor: 'pointer',
                  boxShadow: '4px 4px 8px #cdc5b8, -4px -4px 8px #fffbf5',
                  transition: `all 0.2s ${spring}`,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(0.98)'; e.currentTarget.style.color = '#4a7fb5'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.color = '#6b9fcf'; }}
              >
                存入
              </button>
              <button
                onClick={() => setMode('withdraw')}
                style={{
                  flex: 1, padding: '14px', borderRadius: '14px', border: 'none',
                  background: '#f0ebe0', color: '#c9923a', fontSize: '14px',
                  fontFamily: "'Noto Sans SC', sans-serif", cursor: 'pointer',
                  boxShadow: '4px 4px 8px #cdc5b8, -4px -4px 8px #fffbf5',
                  transition: `all 0.2s ${spring}`,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(0.98)'; e.currentTarget.style.color = '#a87a2e'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.color = '#c9923a'; }}
              >
                取出
              </button>
            </div>
          )}

          {/* Deposit Form */}
          {mode === 'deposit' && (
            <div style={{
              marginTop: '20px', padding: '20px',
              background: '#f0ebe0', borderRadius: '16px',
              boxShadow: 'inset 3px 3px 6px #cdc5b8, inset -3px -3px 6px #fffbf5',
            }}>
              <div style={{
                fontSize: '11px', color: '#a89f8e', letterSpacing: '0.2em',
                marginBottom: '12px', textTransform: 'uppercase',
              }}>
                存入金额
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{
                  flex: 1, display: 'flex', alignItems: 'center',
                  background: '#f5f0e8', borderRadius: '12px',
                  padding: '0 14px', height: '48px',
                  boxShadow: 'inset 2px 2px 4px #cdc5b8, inset -2px -2px 4px #fffbf5',
                }}>
                  <span style={{ color: '#a89f8e', fontSize: '16px', marginRight: '8px' }}>¥</span>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                    placeholder="0"
                    autoFocus
                    style={{
                      flex: 1, border: 'none', background: 'transparent',
                      outline: 'none', color: '#3d3427', fontSize: '18px',
                      fontFamily: "'Noto Serif SC', serif",
                    }}
                  />
                </div>
                <button
                  onClick={handleDeposit}
                  disabled={!depositAmount || Number(depositAmount) <= 0}
                  style={{
                    width: '72px', height: '48px', borderRadius: '12px', border: 'none',
                    background: '#6b9fcf', color: '#fff', fontSize: '14px',
                    fontFamily: "'Noto Sans SC', sans-serif", cursor: 'pointer',
                    opacity: Number(depositAmount) > 0 ? 1 : 0.4,
                    transition: `all 0.2s ${spring}`,
                  }}
                >
                  确认
                </button>
              </div>
              <button
                onClick={() => { setMode('none'); setDepositAmount(''); }}
                style={{
                  marginTop: '10px', width: '100%', padding: '10px',
                  background: 'transparent', border: 'none', color: '#a89f8e',
                  fontSize: '12px', cursor: 'pointer',
                }}
              >
                取消
              </button>
            </div>
          )}

          {/* Withdraw Form */}
          {mode === 'withdraw' && (
            <div style={{
              marginTop: '20px', padding: '20px',
              background: '#f0ebe0', borderRadius: '16px',
              boxShadow: 'inset 3px 3px 6px #cdc5b8, inset -3px -3px 6px #fffbf5',
            }}>
              <div style={{
                fontSize: '11px', color: '#a89f8e', letterSpacing: '0.2em',
                marginBottom: '12px', textTransform: 'uppercase',
              }}>
                取出金额
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{
                  flex: 1, display: 'flex', alignItems: 'center',
                  background: '#f5f0e8', borderRadius: '12px',
                  padding: '0 14px', height: '48px',
                  boxShadow: 'inset 2px 2px 4px #cdc5b8, inset -2px -2px 4px #fffbf5',
                }}>
                  <span style={{ color: '#a89f8e', fontSize: '16px', marginRight: '8px' }}>¥</span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    placeholder="0"
                    autoFocus
                    style={{
                      flex: 1, border: 'none', background: 'transparent',
                      outline: 'none', color: '#3d3427', fontSize: '18px',
                      fontFamily: "'Noto Serif SC', serif",
                    }}
                  />
                </div>
                <button
                  onClick={handleWithdraw}
                  disabled={!withdrawAmount || Number(withdrawAmount) <= 0}
                  style={{
                    width: '72px', height: '48px', borderRadius: '12px', border: 'none',
                    background: '#c9923a', color: '#fff', fontSize: '14px',
                    fontFamily: "'Noto Sans SC', sans-serif", cursor: 'pointer',
                    opacity: Number(withdrawAmount) > 0 ? 1 : 0.4,
                    transition: `all 0.2s ${spring}`,
                  }}
                >
                  确认
                </button>
              </div>
              <button
                onClick={() => { setMode('none'); setWithdrawAmount(''); }}
                style={{
                  marginTop: '10px', width: '100%', padding: '10px',
                  background: 'transparent', border: 'none', color: '#a89f8e',
                  fontSize: '12px', cursor: 'pointer',
                }}
              >
                取消
              </button>
            </div>
          )}

          {/* Delete */}
          <button
            onClick={onDelete}
            style={{
              width: '100%', marginTop: '20px', padding: '12px',
              background: '#f0ebe0', border: 'none', borderRadius: '12px',
              boxShadow: '4px 4px 8px #cdc5b8, -4px -4px 8px #fffbf5',
              color: '#c5bdb0', fontSize: '13px',
              fontFamily: "'Noto Sans SC', sans-serif", cursor: 'pointer',
              transition: `all 0.2s ${spring}`,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#c9923a'; e.currentTarget.style.transform = 'scale(0.98)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#c5bdb0'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            删除此星体
          </button>
        </div>

        {/* Bottom safe area */}
        <div style={{ height: 'max(14px, env(safe-area-inset-bottom))' }} />
      </div>
    </>
  );
};
