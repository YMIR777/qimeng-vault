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
      {/* 羽毛笔 SVG - 记录记账的隐喻，旋转45度模拟书写角度 */}
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#c9923a"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transform: 'rotate(-45deg)' }}
      >
        {/* 羽毛笔身 */}
        <path d="M20.24 3.76a1.5 1.5 0 0 1 0 2.12L9.5 16.62a1 1 0 0 1-.65.27H5.5a1.5 1.5 0 0 1 0-3h2.12l10.74-10.74a1.5 1.5 0 0 1 2.12 0z" />
        {/* 羽毛纹理 */}
        <path d="M12 12l8.5 8.5" />
        <path d="M17 7l-5 5" />
        <path d="M19.5 5.5l-4 4" />
      </svg>
    </button>
  );
}