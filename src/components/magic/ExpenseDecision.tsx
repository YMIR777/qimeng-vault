import { useState } from 'react';

interface ExpenseDecisionProps {
  amount: number;
  category: string;
  onConfirm: (judgment: 'worthy' | 'unworthy') => void;
  onCancel: () => void;
}

export function ExpenseDecision({ amount, category, onConfirm, onCancel }: ExpenseDecisionProps) {
  const [selected, setSelected] = useState<'worthy' | 'unworthy' | null>(null);

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 80,
      padding: '20px 24px',
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderTop: '1px solid var(--border-subtle)',
      borderRadius: '20px 20px 0 0',
      animation: 'slideUp 0.3s var(--ease-out)',
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }
      `}</style>
      
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--text-primary)' }}>
          {category} {amount}元
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', letterSpacing: '0.1em' }}>
          这笔支出值得吗？
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <button
          onClick={() => setSelected('worthy')}
          style={{
            flex: 1,
            padding: '14px',
            borderRadius: '12px',
            border: `2px solid ${selected === 'worthy' ? 'var(--success)' : 'var(--border-subtle)'}`,
            background: selected === 'worthy' ? 'rgba(109,191,130,0.1)' : 'transparent',
            color: selected === 'worthy' ? 'var(--success)' : 'var(--text-secondary)',
            fontFamily: 'var(--font-body)',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: selected === 'worthy' ? '0 0 16px rgba(109,191,130,0.3)' : 'none',
          }}
        >
          ✓ 值得
        </button>
        <button
          onClick={() => setSelected('unworthy')}
          style={{
            flex: 1,
            padding: '14px',
            borderRadius: '12px',
            border: `2px solid ${selected === 'unworthy' ? 'var(--danger)' : 'var(--border-subtle)'}`,
            background: selected === 'unworthy' ? 'rgba(217,115,115,0.1)' : 'transparent',
            color: selected === 'unworthy' ? 'var(--danger)' : 'var(--text-secondary)',
            fontFamily: 'var(--font-body)',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            animation: selected === 'unworthy' ? 'shake 0.4s ease' : 'none',
          }}
        >
          ✗ 不值
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={onCancel}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            cursor: 'pointer',
            padding: '8px 12px',
          }}
        >
          取消
        </button>
        <button
          onClick={() => selected && onConfirm(selected)}
          disabled={!selected}
          style={{
            padding: '10px 24px',
            borderRadius: '10px',
            border: 'none',
            background: selected ? 'var(--accent-blue)' : 'var(--border-subtle)',
            color: selected ? '#0D0D10' : 'var(--text-muted)',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: selected ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
          }}
        >
          确认
        </button>
      </div>
    </div>
  );
}