import { useNavigate } from 'react-router-dom';
import { requestMagicFocus } from '../../utils/focusChannel';

export function QuickAddFAB() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/dashboard');
    setTimeout(() => requestMagicFocus(), 100);
  };

  return (
    <button
      onClick={handleClick}
      aria-label="快速记账"
      style={{
        position: 'fixed',
        bottom: '100px',
        right: '24px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: 'linear-gradient(145deg, #f5f0e8, #e8e1d5)',
        boxShadow: '6px 6px 14px #cdc5b8, -6px -6px 14px #fffbf5',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.12)';
        e.currentTarget.style.boxShadow = '8px 8px 18px #cdc5b8, -8px -8px 18px #fffbf5';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '6px 6px 14px #cdc5b8, -6px -6px 14px #fffbf5';
      }}
      onMouseDown={e => {
        e.currentTarget.style.transform = 'scale(0.95)';
      }}
      onMouseUp={e => {
        e.currentTarget.style.transform = 'scale(1.12)';
      }}
    >
      {/* 写实羽毛笔 SVG - 蘸水笔风格 */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        stroke="#c9923a"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* 羽梗主干 — 弧形曲线 */}
        <path d="M6 30 Q10 20 16 12 Q20 6 26 4" />
        {/* 羽毛左侧羽片 */}
        <path d="M6 30 Q8 24 10 20 Q14 14 16 12 Q12 16 8 22 Q6 26 6 30Z" fill="#f5f0e8" strokeWidth="0.8" />
        {/* 羽毛右侧羽片 */}
        <path d="M16 12 Q20 8 24 6 Q28 5 30 4 Q26 6 22 10 Q18 14 16 12Z" fill="#f5f0e8" strokeWidth="0.8" />
        {/* 羽片纹理 — 左侧 */}
        <path d="M7 28 Q10 24 12 20" strokeWidth="0.7" />
        <path d="M9 24 Q11 21 13 17" strokeWidth="0.7" />
        <path d="M11 20 Q13 17 14 14" strokeWidth="0.7" />
        {/* 羽片纹理 — 右侧 */}
        <path d="M25 6 Q22 9 18 13" strokeWidth="0.7" />
        <path d="M23 8 Q20 11 17 14" strokeWidth="0.7" />
        {/* 笔尖 — 羽梗末端分裂 */}
        <path d="M6 30 L5 31 L6 31.5 L7 31 Z" fill="#c9923a" strokeWidth="0.5" />
        <path d="M6 30 L6.5 31.5" strokeWidth="0.8" />
        <path d="M6 30 L5.5 31" strokeWidth="0.5" />
      </svg>
    </button>
  );
}