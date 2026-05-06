import React from 'react';

type WishStatus = 'building' | 'achieved' | 'withdrawn';

interface WishBottleProps {
  name: string;
  currentBalance: number;
  targetPrice: number;
  status: WishStatus;
}

const STATUS_COLORS = {
  building: '#6b9fcf',
  achieved: '#c9923a',
  withdrawn: '#c5bdb0',
};

export const WishBottle: React.FC<WishBottleProps> = ({
  name,
  currentBalance,
  targetPrice,
  status,
}) => {
  const fillColor = STATUS_COLORS[status];
  const percentage = Math.min((currentBalance / targetPrice) * 100, 100);

  // SVG dimensions
  const svgWidth = 120;
  const svgHeight = 180;
  // Bottle body area: y=50 to y=170, height=120
  const bodyTop = 50;
  const bodyBottom = 170;
  const bodyHeight = bodyBottom - bodyTop;
  // Neck: y=20 to y=50
  const neckTop = 20;

  // Liquid fill: starts from bodyBottom and goes up
  const fillHeight = (percentage / 100) * bodyHeight;
  const fillY = bodyBottom - fillHeight;

  const isAchieved = status === 'achieved';

  return (
    <div
      style={{
        background: '#f0ebe0',
        borderRadius: '18px',
        padding: '20px',
        boxShadow: '5px 5px 10px #cdc5b8, -5px -5px 10px #fffbf5',
        display: 'inline-block',
        cursor: 'pointer',
        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.02)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
      }}
      onMouseDown={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(0.97)';
      }}
      onMouseUp={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.02)';
      }}
    >
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ display: 'block', margin: '0 auto' }}
      >
        <defs>
          {isAchieved && (
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>

        {/* Bottle body outline */}
        <path
          d="M 35 50
             Q 35 40 45 40
             L 75 40
             Q 85 40 85 50
             L 85 55
             Q 110 70 110 100
             Q 110 140 85 155
             Q 70 165 50 165
             Q 30 165 15 155
             Q 10 140 10 100
             Q 10 70 35 55
             Z"
          fill="#f0ebe0"
          stroke="#c5bdb0"
          strokeWidth="1.5"
        />

        {/* Neck */}
        <rect
          x="45"
          y={neckTop}
          width="30"
          height="25"
          rx="3"
          fill="#f0ebe0"
          stroke="#c5bdb0"
          strokeWidth="1.5"
        />

        {/* Cork */}
        <rect
          x="48"
          y="12"
          width="24"
          height="12"
          rx="3"
          fill="#d4c4a8"
          stroke="#c5bdb0"
          strokeWidth="1"
        />

        {/* Liquid fill */}
        {fillHeight > 0 && (
          <path
            d={`M 35 ${Math.max(fillY, 55)}
                Q 35 ${Math.max(fillY - 15, 40) + (fillY < 55 ? 0 : 0)} 45 ${Math.max(fillY, 40) + 5}
                L 75 ${Math.max(fillY, 40) + 5}
                Q 85 ${Math.max(fillY - 15, 40)} 85 55
                L 85 ${Math.min(fillY, bodyBottom)}
                Q 110 ${Math.min(fillY + 40, bodyBottom - 5)} 110 100
                Q 110 ${bodyBottom - 10} 85 ${bodyBottom - 5}
                Q 70 ${bodyBottom + 5} 50 ${bodyBottom}
                Q 30 ${bodyBottom + 5} 15 ${bodyBottom - 5}
                Q 10 ${bodyBottom - 10} 10 100
                Q 10 ${Math.min(fillY + 40, bodyBottom - 5)} 35 ${Math.min(fillY, bodyBottom)}
                Z`}
            fill={fillColor}
            filter={isAchieved ? 'url(#glow)' : undefined}
          />
        )}

        {/* Progress bar */}
        <rect
          x="10"
          y={bodyBottom + 6}
          width={`${percentage}%`}
          height="4"
          rx="2"
          fill={fillColor}
          style={{ transition: 'width 0.3s ease' }}
        />
        <rect
          x="10"
          y={bodyBottom + 6}
          width="100%"
          height="4"
          rx="2"
          fill="#e0dbd3"
        />
      </svg>

      {/* Labels */}
      <div style={{ textAlign: 'center', marginTop: '8px' }}>
        <div style={{ fontSize: '13px', color: '#3d3427', fontWeight: 500 }}>
          {name}
        </div>
        <div style={{ fontSize: '11px', color: '#a89f8e', marginTop: '2px' }}>
          ¥{currentBalance.toLocaleString()} / ¥{targetPrice.toLocaleString()}
        </div>
      </div>
    </div>
  );
};
