interface ReportNavProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

const SECTIONS = [
  { id: 'briefing', label: '简报' },
  { id: 'goals', label: '目标' },
  { id: 'summary', label: '摘要' },
  { id: 'trend', label: '趋势' },
  { id: 'expense', label: '支出' },
  { id: 'income', label: '收入' },
  { id: 'health', label: '健康度' },
];

export function ReportNav({ activeSection, onNavigate }: ReportNavProps) {
  return (
    <div style={{
      position: 'sticky',
      top: '0',
      zIndex: 50,
      background: 'rgba(245,240,232,0.95)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      padding: '12px 0',
      marginBottom: '24px',
      borderBottom: '1px solid rgba(163,158,148,0.2)',
    }}>
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '4px 8px',
        scrollbarWidth: 'none',
      }}>
        {SECTIONS.map(section => (
          <button
            key={section.id}
            onClick={() => onNavigate(section.id)}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: 'none',
              background: activeSection === section.id ? '#f0ebe0' : 'transparent',
              color: activeSection === section.id ? '#3d3427' : '#a89f8e',
              fontSize: '12px',
              fontFamily: "'Noto Sans SC', sans-serif",
              cursor: 'pointer',
              boxShadow: activeSection === section.id ? '3px 3px 6px #cdc5b8, -3px -3px 6px #fffbf5' : 'none',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              outline: 'none',
            }}
          >
            {section.label}
          </button>
        ))}
      </div>
    </div>
  );
}
