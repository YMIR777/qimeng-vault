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

const springTransition = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

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

  function handleDeposit() {
    const amount = Number(depositAmount);
    if (!amount || amount <= 0) return;
    onDeposit(amount);
    setDepositAmount('');
  }

  function handleWithdraw() {
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) return;
    onWithdraw(amount);
    setWithdrawAmount('');
  }

  function formatDate(ts: number) {
    const d = new Date(ts);
    return `${d.getMonth() + 1}-${String(d.getDate()).padStart(2, '0')}`;
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
          pointerEvents: 'auto',
        }}
      />

      {/* Bottom Sheet */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 95,
          padding: '24px',
          paddingBottom: '48px',
          background: '#f0ebe0',
          borderRadius: '24px 24px 0 0',
          boxShadow: '0 -8px 32px rgba(163, 158, 148, 0.5)',
          transition: `transform 0.5s ${springTransition}`,
          maxHeight: '85vh',
          overflowY: 'auto',
        }}
      >
        {/* Top pill handle */}
        <div style={{
          position: 'absolute',
          top: '14px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '40px',
          height: '5px',
          background: '#e8e1d5',
          borderRadius: '3px',
          boxShadow: 'inset 2px 2px 4px #cdc5b8, inset -2px -2px 4px #fffbf5',
        }} />

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '16px',
            width: '32px',
            height: '32px',
            background: '#f0ebe0',
            border: 'none',
            borderRadius: '50%',
            boxShadow: '3px 3px 6px #cdc5b8, -3px -3px 6px #fffbf5',
            color: '#a89f8e',
            fontSize: '18px',
            lineHeight: 1,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: `all 0.2s ${springTransition}`,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#7a6d5a';
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.92)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#a89f8e';
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
          }}
        >
          ×
        </button>

        {/* Wish header */}
        <div style={{ textAlign: 'center', marginBottom: '20px', marginTop: '8px' }}>
          <div style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: '22px',
            color: '#3d3427',
            marginBottom: '6px',
          }}>
            {wish.name}
          </div>
          <div style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: '16px',
            color: '#6b9fcf',
          }}>
            ¥{wish.currentBalance.toLocaleString()}
            <span style={{ color: '#a89f8e', fontSize: '13px' }}>
              {' '}/ ¥{wish.targetPrice.toLocaleString()}
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ marginTop: '12px', height: '6px', borderRadius: '3px', background: '#e8e1d5', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min((wish.currentBalance / wish.targetPrice) * 100, 100)}%`,
              height: '100%',
              background: wish.status === 'achieved' ? '#c9923a' : '#6b9fcf',
              borderRadius: '3px',
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* Transaction list */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '10px',
            letterSpacing: '0.3em',
            color: '#a89f8e',
            textTransform: 'uppercase',
            marginBottom: '12px',
            paddingLeft: '4px',
          }}>
            存入记录
          </div>

          {transactions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '24px 16px',
              background: '#f0ebe0',
              borderRadius: '14px',
              boxShadow: 'inset 3px 3px 6px #cdc5b8, inset -3px -3px 6px #fffbf5',
              color: '#c5bdb0',
              fontSize: '13px',
            }}>
              暂无存入记录
            </div>
          ) : (
            <>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                {transactions.map(tx => (
                  <div
                    key={tx.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: '#f0ebe0',
                      borderRadius: '12px',
                      boxShadow: 'inset 2px 2px 4px #cdc5b8, inset -2px -2px 4px #fffbf5',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '11px', color: '#a89f8e' }}>
                        {formatDate(tx.date)}
                      </span>
                      <span style={{
                        fontSize: '13px',
                        color: '#3d3427',
                        fontFamily: "'Noto Sans SC', sans-serif",
                      }}>
                        {tx.platform || tx.category}
                      </span>
                    </div>
                    <div style={{
                      fontFamily: "'Noto Serif SC', serif",
                      fontSize: '15px',
                      color: '#6b9fcf',
                    }}>
                      +{tx.amount}
                    </div>
                  </div>
                ))}
              </div>
              {/* Summary */}
              <div style={{
                marginTop: '10px',
                padding: '10px 16px',
                textAlign: 'right',
                fontSize: '11px',
                color: '#a89f8e',
                fontFamily: "'Noto Sans SC', sans-serif",
              }}>
                共 {transactions.length} 笔，合计 ¥{totalContributed.toLocaleString()}
              </div>
            </>
          )}
        </div>

        {/* Deposit input */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '10px',
            letterSpacing: '0.25em',
            color: '#a89f8e',
            marginBottom: '6px',
            paddingLeft: '4px',
          }}>
            存入
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              background: '#f0ebe0',
              borderRadius: '12px',
              boxShadow: 'inset 3px 3px 6px #cdc5b8, inset -3px -3px 6px #fffbf5',
              padding: '0 14px',
            }}>
              <span style={{ color: '#a89f8e', fontSize: '13px', marginRight: '6px' }}>¥</span>
              <input
                type="number"
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value)}
                placeholder="输入金额"
                style={{
                  flex: 1,
                  padding: '12px 0',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#3d3427',
                  fontSize: '14px',
                  fontFamily: "'Noto Serif SC', serif",
                }}
              />
            </div>
            <button
              onClick={handleDeposit}
              disabled={!depositAmount || Number(depositAmount) <= 0}
              style={{
                padding: '12px 20px',
                background: '#e8c97a',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '3px 3px 6px #cdc5b8, -2px -2px 4px #fffbf5',
                color: '#3d3427',
                fontSize: '13px',
                fontFamily: "'Noto Sans SC', sans-serif",
                cursor: Number(depositAmount) > 0 ? 'pointer' : 'not-allowed',
                opacity: Number(depositAmount) > 0 ? 1 : 0.5,
                transition: `all 0.2s ${springTransition}`,
              }}
              onMouseEnter={e => { if (Number(depositAmount) > 0) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
            >
              存入
            </button>
          </div>
        </div>

        {/* Withdraw input */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '10px',
            letterSpacing: '0.25em',
            color: '#a89f8e',
            marginBottom: '6px',
            paddingLeft: '4px',
          }}>
            取出
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              background: '#f0ebe0',
              borderRadius: '12px',
              boxShadow: 'inset 3px 3px 6px #cdc5b8, inset -3px -3px 6px #fffbf5',
              padding: '0 14px',
            }}>
              <span style={{ color: '#a89f8e', fontSize: '13px', marginRight: '6px' }}>¥</span>
              <input
                type="number"
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
                placeholder="输入金额"
                style={{
                  flex: 1,
                  padding: '12px 0',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#3d3427',
                  fontSize: '14px',
                  fontFamily: "'Noto Serif SC', serif",
                }}
              />
            </div>
            <button
              onClick={handleWithdraw}
              disabled={!withdrawAmount || Number(withdrawAmount) <= 0}
              style={{
                padding: '12px 20px',
                background: '#f0ebe0',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '3px 3px 6px #cdc5b8, -2px -2px 4px #fffbf5',
                color: '#c9923a',
                fontSize: '13px',
                fontFamily: "'Noto Sans SC', sans-serif",
                cursor: Number(withdrawAmount) > 0 ? 'pointer' : 'not-allowed',
                opacity: Number(withdrawAmount) > 0 ? 1 : 0.5,
                transition: `all 0.2s ${springTransition}`,
              }}
              onMouseEnter={e => { if (Number(withdrawAmount) > 0) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
            >
              取出
            </button>
          </div>
        </div>

        {/* Delete wish button */}
        <button
          onClick={onDelete}
          style={{
            width: '100%',
            padding: '12px',
            background: '#f0ebe0',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '4px 4px 8px #cdc5b8, -4px -4px 8px #fffbf5',
            color: '#c9923a',
            fontSize: '13px',
            fontFamily: "'Noto Sans SC', sans-serif",
            letterSpacing: '0.1em',
            cursor: 'pointer',
            transition: `all 0.2s ${springTransition}`,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#d4a35a';
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#c9923a';
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
          }}
        >
          删除此星体
        </button>
      </div>
    </>
  );
};
