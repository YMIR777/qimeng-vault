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
      {/* 羽毛笔 SVG — 简洁线条，笔尖朝下，清晰可辨 */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#c9923a"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* 笔身 — 简洁的斜线 */}
        <path d="M17 3L7 13l-2 6 6-2 10-10-4-4z" />
        {/* 笔尖 */}
        <path d="M5 21l2-6" />
        {/* 墨迹点 — 强调"记录"动作 */}
        <circle cx="8.5" cy="15.5" r="1" fill="#c9923a" stroke="none" />
      </svg>
    </button>
  );
}