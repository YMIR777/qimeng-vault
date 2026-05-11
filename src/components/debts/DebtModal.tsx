import { useState } from 'react';
import type { Debt } from '../../store/db';

interface DebtModalProps {
  onClose: () => void;
  onAdd: (payload: Omit<Debt, 'id' | 'createdAt' | 'status'>) => void;
}

export function DebtModal({ onClose, onAdd }: DebtModalProps) {
  const [debtType, setDebtType] = useState<'lent' | 'borrowed'>('lent');
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  function handleSubmit() {
    if (!personName.trim() || !amount || parseFloat(amount) <= 0) return;
    onAdd({
      type: debtType,
      personName: personName.trim(),
      amount: parseFloat(amount),
      reason: reason.trim() || undefined,
    });
    onClose();
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: '100%', maxWidth: '480px',
        background: '#f5f0e8',
        borderRadius: '20px 20px 0 0',
        padding: '28px 24px 40px',
        animation: 'slideUpDebt 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        <style>{`
          @keyframes slideUpDebt {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}</style>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: '18px', color: '#3d3427', fontWeight: 400, margin: 0,
          }}>记一笔人情</h2>
          <button onClick={onClose} style={{
            border: 'none', background: 'transparent', color: '#a89f8e',
            fontSize: '22px', cursor: 'pointer', lineHeight: 1, padding: '4px',
          }}>×</button>
        </div>

        {/* 类型切换 */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => setDebtType('lent')}
            style={{
              flex: 1, padding: '12px',
              borderRadius: '12px',
              border: debtType === 'lent' ? '1.5px solid #6b9fcf' : '1.5px solid #ddd6ca',
              background: debtType === 'lent' ? 'rgba(107,159,207,0.12)' : 'transparent',
              color: debtType === 'lent' ? '#6b9fcf' : '#a89f8e',
              fontSize: '14px', fontFamily: "'Noto Sans SC', sans-serif",
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="6"/>
              <path d="M8 5v4M8 11v.5"/>
            </svg>
            借出
          </button>
          <button
            onClick={() => setDebtType('borrowed')}
            style={{
              flex: 1, padding: '12px',
              borderRadius: '12px',
              border: debtType === 'borrowed' ? '1.5px solid #c9923a' : '1.5px solid #ddd6ca',
              background: debtType === 'borrowed' ? 'rgba(201,146,58,0.12)' : 'transparent',
              color: debtType === 'borrowed' ? '#c9923a' : '#a89f8e',
              fontSize: '14px', fontFamily: "'Noto Sans SC', sans-serif",
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="12" height="10" rx="2"/>
              <path d="M5 7h6M8 5v4"/>
            </svg>
            借入
          </button>
        </div>

        {/* 姓名 */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: '#a89f8e', marginBottom: '6px', letterSpacing: '0.1em' }}>
            对方姓名
          </label>
          <input
            type="text"
            value={personName}
            onChange={e => setPersonName(e.target.value)}
            placeholder="如：张三"
            style={{
              width: '100%', padding: '12px 14px',
              background: '#faf7f2', border: '1.5px solid #ddd6ca', borderRadius: '12px',
              color: '#3d3427', fontSize: '14px',
              fontFamily: "'Noto Sans SC', sans-serif", outline: 'none',
            }}
          />
        </div>

        {/* 金额 */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: '#a89f8e', marginBottom: '6px', letterSpacing: '0.1em' }}>
            金额
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
              color: '#a89f8e', fontSize: '16px',
            }}>¥</span>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              style={{
                width: '100%', padding: '12px 14px 12px 30px',
                background: '#faf7f2', border: '1.5px solid #ddd6ca', borderRadius: '12px',
                color: '#3d3427', fontSize: '16px', fontFamily: "'Noto Serif SC', serif",
                outline: 'none', textAlign: 'right',
              }}
            />
          </div>
        </div>

        {/* 原因 */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: '#a89f8e', marginBottom: '6px', letterSpacing: '0.1em' }}>
            原因 <span style={{ color: '#c5bdb0' }}>（可选）</span>
          </label>
          <input
            type="text"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="如：帮忙带饭"
            style={{
              width: '100%', padding: '12px 14px',
              background: '#faf7f2', border: '1.5px solid #ddd6ca', borderRadius: '12px',
              color: '#3d3427', fontSize: '14px',
              fontFamily: "'Noto Sans SC', sans-serif", outline: 'none',
            }}
          />
        </div>

        {/* 按钮 */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '14px',
              borderRadius: '12px', border: '1.5px solid #ddd6ca',
              background: 'transparent', color: '#a89f8e',
              fontSize: '14px', fontFamily: "'Noto Sans SC', sans-serif",
              cursor: 'pointer',
            }}
          >取消</button>
          <button
            onClick={handleSubmit}
            disabled={!personName.trim() || !amount || parseFloat(amount) <= 0}
            style={{
              flex: 1, padding: '14px',
              borderRadius: '12px', border: 'none',
              background: debtType === 'lent' ? '#6b9fcf' : '#c9923a',
              color: '#fff',
              fontSize: '14px', fontFamily: "'Noto Sans SC', sans-serif",
              fontWeight: 500, cursor: 'pointer',
              opacity: (!personName.trim() || !amount || parseFloat(amount) <= 0) ? 0.5 : 1,
            }}
          >确认</button>
        </div>
      </div>
    </div>
  );
}
