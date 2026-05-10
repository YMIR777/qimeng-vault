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
            background: '#f0ebe0',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '6px 6px 14px #cdc5b8, -6px -6px 14px #fffbf5',
            zIndex: 100,
            fontSize: '13px',
            lineHeight: '1.6',
            color: '#3d3427',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontWeight: 500, marginBottom: '6px', color: '#c9923a' }}>
            💡 背后的智慧
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
              borderTop: '6px solid #f0ebe0',
            }}
          />
        </div>
      )}
    </span>
  );
}
