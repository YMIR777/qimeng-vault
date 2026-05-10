import React, { useState } from 'react';
import type { Wish } from '../../store/db';
import { WishBottle } from './WishBottle';

interface WishPickerProps {
  amount: number;
  wishes: Wish[];
  onDeposit: (wishId: string, amount: number) => void;
  onClose: () => void;
}

const springTransition = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

export const WishPicker: React.FC<WishPickerProps> = ({
  amount,
  wishes,
  onDeposit,
  onClose,
}) => {
  const [celebrated, setCelebrated] = useState<string | null>(null);

  function handleDeposit(wish: Wish) {
    const newBalance = wish.currentBalance + amount;
    const wasAchieved = wish.status === 'achieved';
    onDeposit(wish.id, amount);

    if (!wasAchieved && newBalance >= wish.targetPrice) {
      setCelebrated(wish.id);
      setTimeout(() => setCelebrated(null), 1800);
    }
  }

  const achieved = (wish: Wish) => {
    const newBalance = wish.currentBalance + amount;
    return newBalance >= wish.targetPrice;
  };

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
          opacity: 1,
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
          transform: 'translateY(0)',
          transition: `transform 0.5s ${springTransition}`,
          opacity: 1,
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

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px', marginTop: '8px' }}>
          <div style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '10px',
            letterSpacing: '0.35em',
            color: '#a89f8e',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}>
            存入星体
          </div>
          <div style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: '13px',
            color: '#7a6d5a',
          }}>
            ¥{amount.toLocaleString()} · 选择一个星体存入
          </div>
        </div>

        {/* Wishes Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '16px',
          marginBottom: '20px',
          maxHeight: '360px',
          overflowY: 'auto',
          padding: '8px 4px',
        }}>
          {wishes.map(wish => (
            <div
              key={wish.id}
              onClick={() => handleDeposit(wish)}
              style={{
                position: 'relative',
                background: '#f0ebe0',
                borderRadius: '16px',
                padding: '16px 12px',
                boxShadow: '5px 5px 10px #cdc5b8, -5px -5px 10px #fffbf5',
                cursor: 'pointer',
                transition: `all 0.25s ${springTransition}`,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.03)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '7px 7px 14px #cdc5b8, -7px -7px 14px #fffbf5';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '5px 5px 10px #cdc5b8, -5px -5px 10px #fffbf5';
              }}
              onMouseDown={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'scale(0.97)';
              }}
              onMouseUp={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.03)';
              }}
            >
              {/* Gold shimmer celebrate effect */}
              {celebrated === wish.id && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, transparent 30%, rgba(201,146,58,0.5) 50%, transparent 70%)',
                  backgroundSize: '200% 200%',
                  animation: 'shimmer 0.8s ease-out forwards',
                  borderRadius: '16px',
                  pointerEvents: 'none',
                }} />
              )}

              {/* 粒子许愿瓶 */}
              <div style={{ marginBottom: '8px', transform: 'scale(0.85)', transformOrigin: 'center' }}>
                <WishBottle
                  name=""
                  currentBalance={wish.currentBalance}
                  targetPrice={wish.targetPrice}
                  status={wish.status}
                  onClick={() => {}}
                />
              </div>

              {/* Wish info */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: "'Noto Sans SC', sans-serif",
                  fontSize: '12px',
                  color: '#3d3427',
                  fontWeight: 500,
                  marginBottom: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '120px',
                }}>
                  {wish.name}
                </div>
                <div style={{
                  fontFamily: "'Noto Sans SC', sans-serif",
                  fontSize: '10px',
                  color: '#a89f8e',
                }}>
                  ¥{wish.currentBalance.toLocaleString()} / ¥{wish.targetPrice.toLocaleString()}
                </div>
                {achieved(wish) && (
                  <div style={{
                    marginTop: '6px',
                    fontFamily: "'Noto Sans SC', sans-serif",
                    fontSize: '10px',
                    color: '#c9923a',
                    letterSpacing: '0.08em',
                  }}>
                    达成！
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Skip button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '14px',
            background: '#f0ebe0',
            border: 'none',
            borderRadius: '16px',
            color: '#a89f8e',
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '13px',
            letterSpacing: '0.1em',
            cursor: 'pointer',
            boxShadow: '4px 4px 8px #cdc5b8, -4px -4px 8px #fffbf5',
            transition: `all 0.2s ${springTransition}`,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#7a6d5a'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#a89f8e'; }}
        >
          不存入
        </button>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
};
