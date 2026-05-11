import { useState, useEffect } from 'react';
import type { RecurringRule } from '../../store/db';

interface RecurringConfirmModalProps {
  rule: RecurringRule;
  accountName?: string;
  onConfirm: () => void;
  onSkip: () => void;
}

export function RecurringConfirmModal({
  rule,
  accountName,
  onConfirm,
  onSkip,
}: RecurringConfirmModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation on mount
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleConfirm = () => {
    setVisible(false);
    setTimeout(onConfirm, 200);
  };

  const handleSkip = () => {
    setVisible(false);
    setTimeout(onSkip, 200);
  };

  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(245, 240, 232, 0.75)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: '0 0 40px',
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.25s ease',
  };

  const sheetStyle: React.CSSProperties = {
    background: '#f0ebe0',
    borderRadius: '28px 28px 24px 24px',
    padding: '32px 28px 36px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '8px 8px 24px #cdc5b8, -4px -4px 12px #fffbf5',
    transform: visible ? 'translateY(0) scale(1)' : 'translateY(60px) scale(0.94)',
    transition: 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease',
    opacity: visible ? 1 : 0,
  };

  const ruleNameStyle: React.CSSProperties = {
    fontFamily: "'Noto Serif SC', serif",
    fontSize: '1.05rem',
    fontWeight: 600,
    color: '#3d3427',
    marginBottom: '4px',
    textAlign: 'center',
  };

  const amountStyle: React.CSSProperties = {
    fontSize: '2rem',
    fontWeight: 700,
    color: rule.type === 'expense' ? '#c07060' : '#6a9e6a',
    textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-0.03em',
    marginBottom: '4px',
  };

  const accountStyle: React.CSSProperties = {
    fontSize: '0.8rem',
    color: '#a89f8e',
    textAlign: 'center',
    marginBottom: '28px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.72rem',
    color: '#a89f8e',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: '16px',
  };

  const btnRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
  };

  const skipBtnStyle: React.CSSProperties = {
    flex: 1,
    background: '#e8e3d9',
    color: '#8a7f6e',
    border: 'none',
    borderRadius: '16px',
    padding: '14px 0',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: 'inset 2px 2px 5px #d0cbc0, inset -2px -2px 5px #fffbf5',
    transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.15s ease',
  };

  const confirmBtnStyle: React.CSSProperties = {
    flex: 2,
    background: 'linear-gradient(145deg, #d4a43a, #c9923a)',
    color: '#fff',
    border: 'none',
    borderRadius: '16px',
    padding: '14px 0',
    fontSize: '0.9rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '4px 4px 10px #b8a070, -2px -2px 6px #f0d88a',
    transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.15s ease',
    letterSpacing: '0.03em',
  };

  return (
    <div style={backdropStyle} onClick={handleSkip}>
      <div style={sheetStyle} onClick={e => e.stopPropagation()}>
        <div style={labelStyle}>周期账单待确认</div>

        <div style={ruleNameStyle}>{rule.name}</div>
        <div style={amountStyle}>
          {rule.type === 'expense' ? '-' : '+'}
          {rule.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
        </div>
        <div style={accountStyle}>
          {accountName ?? rule.accountId}
        </div>

        <div style={btnRowStyle}>
          <button
            style={skipBtnStyle}
            onClick={handleSkip}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            跳过本次
          </button>
          <button
            style={confirmBtnStyle}
            onClick={handleConfirm}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            确认入账
          </button>
        </div>
      </div>
    </div>
  );
}