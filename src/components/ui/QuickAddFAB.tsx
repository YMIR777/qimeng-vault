import { requestMagicFocus } from '../../utils/focusChannel';

export function QuickAddFAB() {
  return (
    <button
      onClick={() => requestMagicFocus()}
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
        fontSize: '28px',
        lineHeight: 1,
        color: '#c9923a',
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
      +
    </button>
  );
}
