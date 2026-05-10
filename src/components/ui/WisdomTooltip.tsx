import { useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface WisdomTooltipProps {
  wisdom: string;
  children: ReactNode;
  detail?: string;
}

export function WisdomTooltip({ wisdom, children, detail }: WisdomTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // Place tooltip above the trigger, centered
    setPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
    setVisible(true);
  };

  return (
    <>
      <span
        style={{ display: 'inline-block', cursor: 'help' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
      </span>
      {visible && createPortal(
        <div
          style={{
            position: 'fixed',
            top: `${pos.y}px`,
            left: `${pos.x}px`,
            transform: 'translate(-50%, -100%)',
            width: '280px',
            borderRadius: '16px',
            padding: '16px',
            zIndex: 99999,
            fontSize: '13px',
            lineHeight: '1.6',
            color: '#3d3427',
            pointerEvents: 'none',
            background: 'rgba(245, 240, 232, 0.98)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 251, 245, 0.8)',
            boxShadow: '0 12px 40px rgba(163, 158, 148, 0.35), inset 0 1px 0 rgba(255, 251, 245, 0.6)',
          }}
        >
          <div style={{ fontWeight: 500, marginBottom: '6px', color: '#c9923a', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9923a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/>
              <path d="M9 21h6"/>
            </svg>
            背后的智慧
          </div>
          <div>{wisdom}</div>
          {detail && (
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#a89f8e', borderTop: '1px solid rgba(163,158,148,0.2)', paddingTop: '8px' }}>
              {detail}
            </div>
          )}
          <div
            style={{
              position: 'absolute',
              bottom: '-9px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '0',
              height: '0',
              borderLeft: '9px solid transparent',
              borderRight: '9px solid transparent',
              borderTop: '9px solid rgba(245, 240, 232, 0.98)',
            }}
          />
        </div>,
        document.body
      )}
    </>
  );
}