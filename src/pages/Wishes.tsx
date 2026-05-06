import React, { useState } from 'react';
import { useWishes } from '../store/useWishes';
import { WishBottle } from '../components/wishes/WishBottle';

// ── Design Tokens (Cream Neumorphism) ──────────────────────────────
const css = {
  bg: '#f5f0e8',
  card: '#f0ebe0',
  cardInset: '#e8e3d9',
  text: '#3d3427',
  textMuted: '#a89f8e',
  shadowRaised: '5px 5px 10px #cdc5b8, -5px -5px 10px #fffbf5',
  shadowInset: 'inset 4px 4px 8px #cdc5b8, inset -4px -4px 8px #fffbf5',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

// ── AddWishModal ──────────────────────────────────────────────────
interface AddWishModalProps {
  onConfirm: (data: { name: string; targetPrice: number }) => void;
  onCancel: () => void;
}

const AddWishModal: React.FC<AddWishModalProps> = ({ onConfirm, onCancel }) => {
  const [name, setName] = useState('');
  const [targetPrice, setTargetPrice] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !targetPrice) return;
    onConfirm({ name: name.trim(), targetPrice: Number(targetPrice) });
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(245,240,232,0.7)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        style={{
          background: css.card,
          borderRadius: '20px',
          padding: '32px 28px',
          width: '320px',
          boxShadow: css.shadowRaised,
        }}
      >
        <h3 style={{ margin: '0 0 24px', color: css.text, fontSize: '17px', fontWeight: 500 }}>
          添加星体
        </h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: css.textMuted, fontSize: '12px', marginBottom: '6px' }}>
              星体名称
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="比如：新手机"
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '10px 14px',
                background: css.bg, border: 'none', borderRadius: '10px',
                boxShadow: css.shadowInset,
                color: css.text, fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: css.textMuted, fontSize: '12px', marginBottom: '6px' }}>
              目标金额
            </label>
            <input
              type="number"
              value={targetPrice}
              onChange={e => setTargetPrice(e.target.value)}
              placeholder="比如：5000"
              min="1"
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '10px 14px',
                background: css.bg, border: 'none', borderRadius: '10px',
                boxShadow: css.shadowInset,
                color: css.text, fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1, padding: '10px',
                background: css.bg, border: 'none', borderRadius: '10px',
                boxShadow: css.shadowRaised,
                color: css.textMuted, fontSize: '14px',
                cursor: 'pointer',
                transition: `transform 0.2s ${css.spring}`,
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(0.97)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !targetPrice}
              style={{
                flex: 1, padding: '10px',
                background: '#e8c97a', border: 'none', borderRadius: '10px',
                boxShadow: '3px 3px 7px #cdc5b8, -2px -2px 5px #fffbf5',
                color: css.text, fontSize: '14px', fontWeight: 500,
                cursor: name.trim() && targetPrice ? 'pointer' : 'not-allowed',
                opacity: name.trim() && targetPrice ? 1 : 0.5,
                transition: `transform 0.2s ${css.spring}`,
              }}
              onMouseEnter={e => { if (name.trim() && targetPrice) e.currentTarget.style.transform = 'scale(0.97)'; }}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              确定
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── EmptyState ─────────────────────────────────────────────────────
const EmptyState: React.FC = () => (
  <div
    style={{
      background: css.card,
      borderRadius: '20px',
      padding: '48px 32px',
      boxShadow: css.shadowInset,
      textAlign: 'center',
      margin: '24px 0',
    }}
  >
    <div style={{ fontSize: '40px', marginBottom: '16px' }}>✨</div>
    <p style={{ margin: '0 0 8px', color: css.text, fontSize: '15px' }}>
      暂无星体
    </p>
    <p style={{ margin: 0, color: css.textMuted, fontSize: '13px' }}>
      开始设定你的第一个星体吧
    </p>
  </div>
);

// ── AddButton ─────────────────────────────────────────────────────
const AddButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: '44px', height: '44px',
      background: css.card, border: 'none', borderRadius: '50%',
      boxShadow: css.shadowRaised,
      color: css.text, fontSize: '22px', lineHeight: 1,
      cursor: 'pointer',
      transition: `transform 0.2s ${css.spring}`,
    }}
    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.93)')}
    onMouseUp={e => (e.currentTarget.style.transform = 'scale(1.1)')}
  >
    +
  </button>
);

// ── Wishes Page ───────────────────────────────────────────────────
export function Wishes() {
  const { wishes, addWish } = useWishes();
  const [showModal, setShowModal] = useState(false);

  const handleAddWish = async (data: { name: string; targetPrice: number }) => {
    await addWish(data);
    setShowModal(false);
  };

  return (
    <div style={{ padding: '40px 24px 100px', background: css.bg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            color: css.text,
            fontSize: '24px',
            fontWeight: 400,
          }}
        >
          欲望星体
        </h1>
        <AddButton onClick={() => setShowModal(true)} />
      </div>

      {/* Content */}
      {wishes.length === 0 ? (
        <EmptyState />
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '16px',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: '12px',
            alignItems: 'flex-start',
          }}
        >
          {wishes.map((wish, index) => {
            // Asymmetric sizes: first card is "large" (2x), others are "small" (1x)
            const isLarge = index === 0;
            return (
              <div
                key={wish.id}
                style={{
                  scrollSnapAlign: 'start',
                  flexShrink: 0,
                  width: isLarge ? '200px' : '150px',
                  transition: `transform 0.3s ${css.spring}`,
                }}
              >
                <WishBottle
                  name={wish.name}
                  currentBalance={wish.currentBalance}
                  targetPrice={wish.targetPrice}
                  status={wish.status}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <AddWishModal
          onConfirm={handleAddWish}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
