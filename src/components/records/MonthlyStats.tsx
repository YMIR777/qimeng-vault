export interface MonthlyStatsProps {
  stats: {
    income: number;
    expense: number;
    net: number;
  };
}

function formatCurrency(value: number): string {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function MonthlyStats({ stats }: MonthlyStatsProps) {
  const isNetPositive = stats.net >= 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        padding: '16px 8px',
      }}
    >
      {/* Income */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <span
          style={{
            fontSize: '12px',
            color: '#9a9488',
            fontFamily: "'Noto Serif SC', serif",
          }}
        >
          收入
        </span>
        <span
          style={{
            fontSize: '16px',
            color: '#7a9e7e',
            fontFamily: "'Noto Serif SC', serif",
            fontWeight: 500,
          }}
        >
          ¥{formatCurrency(stats.income)}
        </span>
      </div>

      {/* Expense */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <span
          style={{
            fontSize: '12px',
            color: '#9a9488',
            fontFamily: "'Noto Serif SC', serif",
          }}
        >
          支出
        </span>
        <span
          style={{
            fontSize: '16px',
            color: '#c9923a',
            fontFamily: "'Noto Serif SC', serif",
            fontWeight: 500,
          }}
        >
          ¥{formatCurrency(stats.expense)}
        </span>
      </div>

      {/* Net */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <span
          style={{
            fontSize: '12px',
            color: '#9a9488',
            fontFamily: "'Noto Serif SC', serif",
          }}
        >
          结余
        </span>
        <span
          style={{
            fontSize: '16px',
            color: isNetPositive ? '#7a9e7e' : '#d4a0a0',
            fontFamily: "'Noto Serif SC', serif",
            fontWeight: 500,
          }}
        >
          {isNetPositive ? '+' : ''}¥{formatCurrency(stats.net)}
        </span>
      </div>
    </div>
  );
}
