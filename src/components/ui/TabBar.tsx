import { useLocation, Link } from 'react-router-dom';

const tabs = [
  {
    path: '/dashboard',
    label: '首页',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="6" height="6" rx="2" fill="currentColor" opacity="0.9"/>
        <rect x="12" y="2" width="6" height="6" rx="2" fill="currentColor" opacity="0.5"/>
        <rect x="2" y="12" width="6" height="6" rx="2" fill="currentColor" opacity="0.5"/>
        <rect x="12" y="12" width="6" height="6" rx="2" fill="currentColor" opacity="0.3"/>
      </svg>
    ),
  },
  {
    path: '/wishes',
    label: '星体',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L12.5 7.5L18 8.5L14 12.5L15 18L10 15.5L5 18L6 12.5L2 8.5L7.5 7.5L10 2Z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    path: '/workbench',
    label: '工作台',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="13" width="4" height="5" rx="1.5" fill="currentColor" opacity="0.9"/>
        <rect x="8" y="9" width="4" height="9" rx="1.5" fill="currentColor" opacity="0.7"/>
        <rect x="14" y="5" width="4" height="13" rx="1.5" fill="currentColor" opacity="0.5"/>
      </svg>
    ),
  },
  {
    path: '/reflection',
    label: '反思',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M10 6v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    path: '/reports',
    label: '报表',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="14" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <line x1="7" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="7" y1="11" x2="11" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export function TabBar() {
  const location = useLocation();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '10px 16px 12px',
        paddingBottom: 'max(14px, env(safe-area-inset-bottom))',
        background: '#f5f0e8',
        boxShadow: '0 -6px 24px rgba(163, 158, 148, 0.35), inset 0 1px 0 rgba(255,251,245,0.8)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        gap: '2px',
      }}
    >
      {tabs.map((tab) => {
        const active = location.pathname === tab.path;
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className="btn-tactile"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '10px 4px 6px',
              textDecoration: 'none',
              borderRadius: '14px',
              background: active ? '#ece7dc' : 'transparent',
              boxShadow: active
                ? 'inset 4px 4px 8px #c8c0b2, inset -4px -4px 8px #fffbf5'
                : 'none',
              color: active ? '#c9923a' : '#b8af9e',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: active ? 'scale(1.02)' : 'scale(1)',
            }}
            onMouseEnter={e => {
              if (!active) {
                (e.currentTarget as unknown as HTMLElement).style.color = '#a89f8e';
                (e.currentTarget as unknown as HTMLElement).style.background = 'rgba(240,235,224,0.5)';
              }
            }}
            onMouseLeave={e => {
              if (!active) {
                (e.currentTarget as unknown as HTMLElement).style.color = '#b8af9e';
                (e.currentTarget as unknown as HTMLElement).style.background = 'transparent';
              }
            }}
          >
            {tab.icon}
            <span style={{
              fontFamily: "'Noto Sans SC', sans-serif",
              fontSize: '9px',
              letterSpacing: '0.06em',
              fontWeight: active ? 500 : 400,
            }}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
