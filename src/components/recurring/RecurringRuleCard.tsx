import { useState } from 'react';
import type { RecurringRule } from '../../store/db';

interface RecurringRuleCardProps {
  rule: RecurringRule;
  accountName?: string;
  onToggleActive: (id: string) => void;
  onEdit: (rule: RecurringRule) => void;
  onDelete: (id: string) => void;
}

const PERIOD_LABELS: Record<RecurringRule['period'], string> = {
  monthly: '每月',
  weekly: '每周',
  yearly: '每年',
};

export function RecurringRuleCard({
  rule,
  accountName,
  onToggleActive,
  onEdit,
  onDelete,
}: RecurringRuleCardProps) {
  const [isPressed, setIsPressed] = useState(false);

  const paused = !rule.active;
  const periodLabel = buildPeriodLabel(rule);

  const cardStyle: React.CSSProperties = {
    background: 'var(--cream-card)',
    borderRadius: '20px',
    padding: '20px 24px',
    boxShadow: paused
      ? 'var(--cream-shadow-inset)'
      : 'var(--cream-shadow-raised)',
    opacity: paused ? 0.65 : 1,
    transition: 'box-shadow 0.25s ease, opacity 0.25s ease, transform 0.2s var(--cream-spring)',
    transform: isPressed ? 'scale(0.97)' : 'scale(1)',
    cursor: 'default',
    userSelect: 'none',
  };

  const textPrimaryStyle: React.CSSProperties = {
    color: paused ? 'var(--cream-text-muted)' : 'var(--cream-text)',
    transition: 'color 0.25s ease',
  };

  const textMutedStyle: React.CSSProperties = {
    color: paused ? 'var(--cream-text-secondary)' : 'var(--cream-text-muted)',
    fontSize: '0.8rem',
    transition: 'color 0.25s ease',
  };

  const amountStyle: React.CSSProperties = {
    ...textPrimaryStyle,
    fontWeight: 700,
    fontSize: '1.15rem',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-0.02em',
  };

  const toggleBtnStyle: React.CSSProperties = {
    background: paused ? 'var(--cream-accent-blue)' : 'var(--cream-card-inset)',
    color: paused ? '#fff' : 'var(--cream-text-muted)',
    border: 'none',
    borderRadius: '12px',
    padding: '6px 14px',
    fontSize: '0.78rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s ease, color 0.2s ease, transform 0.15s var(--cream-spring)',
    transform: 'scale(1)',
    boxShadow: paused
      ? '3px 3px 6px var(--cream-shadow-raised), -1px -1px 3px #fff'
      : 'inset 2px 2px 4px #cdc5b8, inset -2px -2px 4px #fffbf5',
  };

  const iconBtnStyle: React.CSSProperties = {
    background: 'var(--cream-card-inset)',
    border: 'none',
    borderRadius: '12px',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--cream-text-muted)',
    fontSize: '0.9rem',
    transition: 'transform 0.15s var(--cream-spring), background 0.15s ease',
    boxShadow: 'inset 2px 2px 4px #cdc5b8, inset -2px -2px 4px #fffbf5',
  };

  const tagStyle: React.CSSProperties = {
    display: 'inline-block',
    background: rule.autoRecord
      ? 'var(--cream-accent-blue)'
      : 'var(--cream-accent-gold)',
    color: '#fff',
    borderRadius: '8px',
    padding: '2px 8px',
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.02em',
  };

  return (
    <div
      style={cardStyle}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      {/* Top row: name + amount + period */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              ...textPrimaryStyle,
              fontWeight: 600,
              fontSize: '0.95rem',
              marginBottom: '2px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              transition: 'color 0.25s ease',
            }}
          >
            {rule.name}
          </div>
          <div style={textMutedStyle}>{periodLabel}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
          <div style={amountStyle}>
            {rule.type === 'expense' ? '-' : '+'}
            ¥{rule.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Middle row: account + type tag */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        {accountName && (
          <span style={textMutedStyle}>{accountName}</span>
        )}
        {accountName && <span style={{ color: 'var(--cream-text-secondary)', fontSize: '0.75rem' }}>·</span>}
        <span style={tagStyle}>
          {rule.autoRecord ? '自动' : '手动'}
        </span>
        {rule.category && (
          <>
            <span style={{ color: 'var(--cream-text-secondary)', fontSize: '0.75rem' }}>·</span>
            <span style={textMutedStyle}>{rule.category}</span>
          </>
        )}
      </div>

      {/* Bottom row: toggle + edit + delete */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          style={toggleBtnStyle}
          onClick={() => onToggleActive(rule.id)}
          onMouseDown={e => {
            e.stopPropagation();
            const btn = e.currentTarget;
            btn.style.transform = 'scale(0.92)';
            setTimeout(() => { btn.style.transform = 'scale(1)'; }, 120);
          }}
          onMouseUp={e => {
            e.stopPropagation();
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {paused ? '▶ 启用' : '⏸ 暂停'}
        </button>

        <button
          style={iconBtnStyle}
          onClick={(e) => { e.stopPropagation(); onEdit(rule); }}
          onMouseDown={e => { e.stopPropagation(); e.currentTarget.style.transform = 'scale(0.88)'; }}
          onMouseUp={e => { e.stopPropagation(); e.currentTarget.style.transform = 'scale(1)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          title="编辑"
        >
          ✎
        </button>

        <button
          style={iconBtnStyle}
          onClick={(e) => { e.stopPropagation(); onDelete(rule.id); }}
          onMouseDown={e => { e.stopPropagation(); e.currentTarget.style.transform = 'scale(0.88)'; }}
          onMouseUp={e => { e.stopPropagation(); e.currentTarget.style.transform = 'scale(1)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          title="删除"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function buildPeriodLabel(rule: RecurringRule): string {
  const base = PERIOD_LABELS[rule.period];
  if (rule.period === 'monthly' && rule.dayOfMonth !== undefined) {
    return `${base}${rule.dayOfMonth}日`;
  }
  if (rule.period === 'weekly' && rule.dayOfWeek !== undefined) {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${base}${days[rule.dayOfWeek]}`;
  }
  return base;
}