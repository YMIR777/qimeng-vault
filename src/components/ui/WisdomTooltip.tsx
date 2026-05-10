import { useState, type ReactNode } from 'react';

interface WisdomTooltipProps {
  wisdom: string;
  children: ReactNode;
  detail?: string;
}

export function WisdomTooltip({ wisdom, children, detail }: WisdomTooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '280px',
            borderRadius: '16px',
            padding: '16px',
            zIndex: 200,
            fontSize: '13px',
            lineHeight: '1.6',
            color: '#3d3427',
            pointerEvents: 'none',
            background: 'rgba(240, 235, 224, 0.92)',
            backdropFilter: 'blur(12px) saturate(140%)',
            WebkitBackdropFilter: 'blur(12px) saturate(140%)',
            border: '1px solid rgba(255, 251, 245, 0.5)',
            boxShadow: 'inset 0 1px 0 rgba(255, 251, 245, 0.4), 0 4px 16px rgba(163, 158, 148, 0.15)',
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
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#a89f8e' }}>
              {detail}
            </div>
          )}
          <div
            style={{
              position: 'absolute',
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '0',
              height: '0',
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid rgba(240, 235, 224, 0.65)',
            }}
          />
        </div>
      )}
    </span>
  );
}
