import { useState, useEffect } from 'react';

interface ExpenseDecisionProps {
  amount: number;
  category: string;
  onConfirm: (judgment: 'worthy' | 'unworthy') => void;
  onCancel: () => void;
}

const springTransition = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

export function ExpenseDecision({ amount, category, onConfirm, onCancel }: ExpenseDecisionProps) {
  const [selected, setSelected] = useState<'worthy' | 'unworthy' | null>(null);
  const [visible, setVisible] = useState(false);
  const [entering, setEntering] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setTimeout(() => setVisible(true), 20);
      setTimeout(() => setEntering(true), 80);
    });
  }, []);

  function handleConfirm() {
    if (!selected) return;
    onConfirm(selected);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 75,
          background: 'rgba(180,185,195,0.45)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.35s ease',
          pointerEvents: visible ? 'auto' : 'none',
        }}
      />

      {/* Card */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 80,
          padding: '32px 28px 40px',
          background: '#e8edf2',
          borderRadius: '28px 28px 0 0',
          boxShadow: '0 -8px 32px rgba(163,170,182,0.35)',
          transform: visible && entering ? 'translateY(0)' : 'translateY(100%)',
          transition: `transform 0.5s ${springTransition}, opacity 0.3s ease`,
          opacity: visible ? 1 : 0,
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
          background: '#d1d8e2',
          borderRadius: '3px',
          boxShadow: 'inset 2px 2px 4px #b8c0cc, inset -2px -2px 4px #ffffff',
        }} />

        {/* Header */}
        <div style={{ marginBottom: '28px', marginTop: '8px', textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '11px',
            letterSpacing: '0.35em',
            color: '#a0aec0',
            textTransform: 'uppercase',
            marginBottom: '10px',
          }}>
            支出决策
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: '6px',
          }}>
            <span style={{
              fontFamily: "'Noto Serif SC', serif",
              fontSize: 'clamp(40px, 10vw, 52px)',
              fontWeight: 400,
              color: '#2d3748',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}>
              {amount}
            </span>
            <span style={{
              fontFamily: "'Noto Sans SC', sans-serif",
              fontSize: '14px',
              color: '#718096',
              letterSpacing: '0.1em',
            }}>
              元
            </span>
          </div>
          <div style={{
            marginTop: '8px',
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '12px',
            color: '#a0aec0',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}>
            {category}
          </div>
        </div>

        {/* Buttons — Neumorphic raised style */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
          {/* Worthy */}
          <button
            onClick={() => setSelected('worthy')}
            style={{
              position: 'relative',
              padding: '18px 16px',
              borderRadius: '18px',
              border: 'none',
              background: '#e8edf2',
              boxShadow: selected === 'worthy'
                ? 'inset 6px 6px 12px #b8c0cc, inset -6px -6px 12px #ffffff'
                : '6px 6px 12px #b8c0cc, -6px -6px 12px #ffffff',
              cursor: 'pointer',
              transition: `all 0.25s ${springTransition}`,
            }}
            onMouseEnter={e => {
              if (selected !== 'worthy') {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '8px 8px 16px #b8c0cc, -8px -8px 16px #ffffff';
              }
            }}
            onMouseLeave={e => {
              if (selected !== 'worthy') {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '6px 6px 12px #b8c0cc, -6px -6px 12px #ffffff';
              }
            }}
          >
            <div style={{
              fontFamily: "'Noto Serif SC', serif",
              fontSize: '16px',
              color: selected === 'worthy' ? '#4a9c6d' : '#68c493',
              letterSpacing: '0.1em',
              transition: 'color 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}>
              {selected === 'worthy' && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7L5.5 10.5L12 3" stroke="#4a9c6d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              值得
            </div>
          </button>

          {/* Unworthy */}
          <button
            onClick={() => setSelected('unworthy')}
            style={{
              position: 'relative',
              padding: '18px 16px',
              borderRadius: '18px',
              border: 'none',
              background: '#e8edf2',
              boxShadow: selected === 'unworthy'
                ? 'inset 6px 6px 12px #b8c0cc, inset -6px -6px 12px #ffffff'
                : '6px 6px 12px #b8c0cc, -6px -6px 12px #ffffff',
              cursor: 'pointer',
              transition: `all 0.25s ${springTransition}`,
            }}
            onMouseEnter={e => {
              if (selected !== 'unworthy') {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '8px 8px 16px #b8c0cc, -8px -8px 16px #ffffff';
              }
            }}
            onMouseLeave={e => {
              if (selected !== 'unworthy') {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '6px 6px 12px #b8c0cc, -6px -6px 12px #ffffff';
              }
            }}
          >
            <div style={{
              fontFamily: "'Noto Serif SC', serif",
              fontSize: '16px',
              color: selected === 'unworthy' ? '#c25050' : '#e07070',
              letterSpacing: '0.1em',
              transition: 'color 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}>
              {selected === 'unworthy' && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 3L11 11M11 3L3 11" stroke="#c25050" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              )}
              不值
            </div>
          </button>
        </div>

        {/* Confirm + Cancel */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={onCancel}
            style={{
              flex: '0 0 auto',
              padding: '12px 20px',
              background: 'transparent',
              border: 'none',
              color: '#a0aec0',
              fontFamily: "'Noto Sans SC', sans-serif",
              fontSize: '13px',
              letterSpacing: '0.08em',
              cursor: 'pointer',
              boxShadow: '3px 3px 6px #b8c0cc, -3px -3px 6px #ffffff',
              borderRadius: '14px',
              transition: `all 0.2s ${springTransition}`,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#718096'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#a0aec0'; }}
          >
            取消
          </button>

          <button
            onClick={handleConfirm}
            disabled={!selected}
            style={{
              flex: 1,
              padding: '16px',
              borderRadius: '18px',
              border: 'none',
              background: selected
                ? 'linear-gradient(145deg, #f0f5fc, #dde4ec)'
                : '#e8edf2',
              color: selected ? '#d4a843' : '#c0c8d4',
              fontFamily: "'Noto Serif SC', serif",
              fontSize: '15px',
              fontWeight: 400,
              letterSpacing: '0.15em',
              cursor: selected ? 'pointer' : 'not-allowed',
              boxShadow: selected
                ? '6px 6px 12px #b8c0cc, -6px -6px 12px #ffffff'
                : '4px 4px 8px #b8c0cc, -4px -4px 8px #ffffff',
              transition: `all 0.25s ${springTransition}`,
              transform: selected ? 'scale(1)' : 'scale(0.98)',
            }}
            onMouseEnter={e => { if (selected) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)'; }}
            onMouseLeave={e => { if (selected) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
            onMouseDown={e => { if (selected) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)'; }}
            onMouseUp={e => { if (selected) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)'; }}
          >
            确认
          </button>
        </div>
      </div>
    </>
  );
}