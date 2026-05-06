import { useLocation, Link } from 'react-router-dom';

const tabs = [
  {
    path: '/',
    label: '首页',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="4" cy="4" r="1.5" fill="currentColor" />
        <circle cx="11" cy="4" r="1.5" fill="currentColor" />
        <circle cx="18" cy="4" r="1.5" fill="currentColor" />
        <circle cx="4" cy="11" r="1.5" fill="currentColor" />
        <circle cx="11" cy="11" r="1.5" fill="currentColor" />
        <circle cx="18" cy="11" r="1.5" fill="currentColor" />
        <circle cx="4" cy="18" r="1.5" fill="currentColor" />
        <circle cx="11" cy="18" r="1.5" fill="currentColor" />
        <circle cx="18" cy="18" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    path: '/wishes',
    label: '星体',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path
          d="M11 2L13.4 8.3L20 9.2L15 14L16.5 20.5L11 17L5.5 20.5L7 14L2 9.2L8.6 8.3L11 2Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    path: '/workbench',
    label: '工作台',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="14" width="4" height="6" rx="1" fill="currentColor" />
        <rect x="9" y="10" width="4" height="10" rx="1" fill="currentColor" />
        <rect x="16" y="6" width="4" height="14" rx="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    path: '/reports',
    label: '报表',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="3" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <line x1="7" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="7" y1="11" x2="13" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="7" y1="14" x2="11" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function TabBar() {
  const location = useLocation();

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        padding: '10px 16px 12px',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        background: '#e8edf2',
        boxShadow: '0 -4px 16px rgba(163,170,182,0.3)',
      }}
    >
      {tabs.map((tab) => {
        const active = location.pathname === tab.path;
        return (
          <Link
            key={tab.path}
            to={tab.path}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '10px 8px',
              textDecoration: 'none',
              borderRadius: '14px',
              background: active ? 'transparent' : 'transparent',
              boxShadow: active ? 'inset 3px 3px 6px #b8c0cc, inset -3px -3px 6px #ffffff' : 'none',
              color: active ? '#d4a843' : '#a0aec0',
              transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {tab.icon}
            <span style={{
              fontFamily: "'Noto Sans SC', sans-serif",
              fontSize: '10px',
              letterSpacing: '0.08em',
            }}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}