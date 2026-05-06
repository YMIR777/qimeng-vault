import { useState, useEffect } from 'react';

interface ExpenseDecisionProps {
  amount: number;
  category: string;
  onConfirm: (judgment: 'worthy' | 'unworthy') => void;
  onCancel: () => void;
}

// Spring physics for premium feel
const springTransition = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

export function ExpenseDecision({ amount, category, onConfirm, onCancel }: ExpenseDecisionProps) {
  const [selected, setSelected] = useState<'worthy' | 'unworthy' | null>(null);
  const [visible, setVisible] = useState(false);
  const [entering, setEntering] = useState(false);

  useEffect(() => {
    // Staggered entrance
    requestAnimationFrame(() => {
      setTimeout(() => setVisible(true), 20);
      setTimeout(() => setEntering(true), 60);
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
          background: 'rgba(13,13,16,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
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
          background: 'linear-gradient(180deg, #1c1b19 0%, #16150f 100%)',
          borderTop: '1px solid rgba(232,184,75,0.25)',
          borderRadius: '24px 24px 0 0',
          boxShadow: '0 -4px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(232,184,75,0.1)',
          transform: visible && entering ? 'translateY(0)' : 'translateY(100%)',
          transition: `transform 0.5s ${springTransition}, opacity 0.3s ease`,
          opacity: visible ? 1 : 0,
        }}
      >
        {/* Decorative top line */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '36px',
          height: '4px',
          background: 'rgba(232,184,75,0.3)',
          borderRadius: '2px',
        }} />

        {/* Header */}
        <div style={{ marginBottom: '28px', textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: '13px',
            letterSpacing: '0.3em',
            color: 'rgba(232,184,75,0.5)',
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
              fontSize: 'clamp(36px, 8vw, 48px)',
              fontWeight: 400,
              color: '#EEE8DC',
              letterSpacing: '-0.02em',
              lineHeight: 1,
              textShadow: '0 0 40px rgba(232,184,75,0.15)',
            }}>
              {amount}
            </span>
            <span style={{
              fontFamily: "'Noto Sans SC', sans-serif",
              fontSize: '14px',
              color: 'rgba(232,184,75,0.5)',
              letterSpacing: '0.1em',
            }}>
              元
            </span>
          </div>
          <div style={{
            marginTop: '8px',
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '12px',
            color: 'rgba(122,117,110,0.6)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}>
            {category}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          {/* Worthy */}
          <button
            onClick={() => setSelected('worthy')}
            style={{
              position: 'relative',
              padding: '18px 16px',
              borderRadius: '16px',
              border: selected === 'worthy' ? '1.5px solid #6DBF82' : '1.5px solid rgba(109,191,130,0.2)',
              background: selected === 'worthy'
                ? 'linear-gradient(135deg, rgba(109,191,130,0.12) 0%, rgba(109,191,130,0.06) 100%)'
                : 'rgba(255,255,255,0.02)',
              cursor: 'pointer',
              transition: `all 0.3s ${springTransition}`,
              boxShadow: selected === 'worthy'
                ? '0 0 24px rgba(109,191,130,0.15), inset 0 1px 0 rgba(109,191,130,0.2)'
                : 'none',
              overflow: 'hidden',
            }}
            onMouseEnter={e => {
              if (selected !== 'worthy') {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(109,191,130,0.4)';
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(109,191,130,0.04)';
              }
            }}
            onMouseLeave={e => {
              if (selected !== 'worthy') {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(109,191,130,0.2)';
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.02)';
              }
            }}
          >
            {/* Inner glow for liquid glass effect */}
            {selected === 'worthy' && (
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '14px',
                boxShadow: 'inset 0 1px 0 rgba(109,191,130,0.15)',
                pointerEvents: 'none',
              }} />
            )}
            <div style={{
              fontFamily: "'Noto Serif SC', serif",
              fontSize: '15px',
              color: selected === 'worthy' ? '#6DBF82' : 'rgba(109,191,130,0.5)',
              letterSpacing: '0.1em',
              transition: 'color 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}>
              {selected === 'worthy' && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7L5.5 10.5L12 3" stroke="#6DBF82" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
              borderRadius: '16px',
              border: selected === 'unworthy' ? '1.5px solid #D97373' : '1.5px solid rgba(217,115,115,0.2)',
              background: selected === 'unworthy'
                ? 'linear-gradient(135deg, rgba(217,115,115,0.12) 0%, rgba(217,115,115,0.06) 100%)'
                : 'rgba(255,255,255,0.02)',
              cursor: 'pointer',
              transition: `all 0.3s ${springTransition}`,
              boxShadow: selected === 'unworthy'
                ? '0 0 24px rgba(217,115,115,0.15), inset 0 1px 0 rgba(217,115,115,0.2)'
                : 'none',
            }}
            onMouseEnter={e => {
              if (selected !== 'unworthy') {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(217,115,115,0.4)';
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(217,115,115,0.04)';
              }
            }}
            onMouseLeave={e => {
              if (selected !== 'unworthy') {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(217,115,115,0.2)';
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.02)';
              }
            }}
          >
            {selected === 'unworthy' && (
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '14px',
                boxShadow: 'inset 0 1px 0 rgba(217,115,115,0.15)',
                pointerEvents: 'none',
              }} />
            )}
            <div style={{
              fontFamily: "'Noto Serif SC', serif",
              fontSize: '15px',
              color: selected === 'unworthy' ? '#D97373' : 'rgba(217,115,115,0.5)',
              letterSpacing: '0.1em',
              transition: 'color 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}>
              {selected === 'unworthy' && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 3L11 11M11 3L3 11" stroke="#D97373" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              )}
              不值
            </div>
          </button>
        </div>

        {/* Confirm + Cancel */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={onCancel}
            style={{
              flex: '0 0 auto',
              padding: '10px 20px',
              background: 'transparent',
              border: 'none',
              color: 'rgba(122,117,110,0.5)',
              fontFamily: "'Noto Sans SC', sans-serif",
              fontSize: '13px',
              letterSpacing: '0.08em',
              cursor: 'pointer',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(122,117,110,0.8)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(122,117,110,0.5)'; }}
          >
            取消
          </button>

          <button
            onClick={handleConfirm}
            disabled={!selected}
            style={{
              flex: 1,
              padding: '15px',
              borderRadius: '14px',
              border: 'none',
              background: selected
                ? 'linear-gradient(135deg, rgba(232,184,75,0.15) 0%, rgba(232,184,75,0.08) 100%)'
                : 'rgba(255,255,255,0.04)',
              color: selected ? '#E8B84B' : 'rgba(122,117,110,0.3)',
              fontFamily: "'Noto Serif SC', serif",
              fontSize: '15px',
              fontWeight: 400,
              letterSpacing: '0.15em',
              cursor: selected ? 'pointer' : 'not-allowed',
              boxShadow: selected
                ? '0 0 20px rgba(232,184,75,0.1), inset 0 1px 0 rgba(232,184,75,0.15)'
                : 'none',
              transition: `all 0.3s ${springTransition}`,
              transform: selected ? 'scale(1)' : 'scale(0.98)',
            }}
            onMouseEnter={e => {
              if (selected) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.01)';
            }}
            onMouseLeave={e => {
              if (selected) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            }}
            onMouseDown={e => {
              if (selected) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)';
            }}
            onMouseUp={e => {
              if (selected) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.01)';
            }}
          >
            确认
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </>
  );
}