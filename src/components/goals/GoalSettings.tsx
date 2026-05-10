import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { db } from '../../store/db';
import type { Transaction } from '../../store/db';

const css = {
  bg: '#f5f0e8',
  card: '#f0ebe0',
  text: '#3d3427',
  textMuted: '#a89f8e',
  textSecondary: '#b8af9e',
  accentBlue: '#6b9fcf',
  accentGold: '#c9923a',
  accentGreen: '#7a9e7e',
  accentRed: '#c07070',
  shadowRaised: '5px 5px 10px #cdc5b8, -5px -5px 10px #fffbf5',
  shadowInset: 'inset 4px 4px 8px #cdc5b8, inset -4px -4px 8px #fffbf5',
} as const;

export interface GoalSettings {
  monthlyIncome: number;
  monthlyExpenseLimit: number;
  emergencyFund: number;
  savingsRate: number;
}

const DEFAULT_GOALS: GoalSettings = {
  monthlyIncome: 0,
  monthlyExpenseLimit: 0,
  emergencyFund: 0,
  savingsRate: 0,
};

const STORAGE_KEY = 'vault:goals';

// ── Wealth Stage Calculation ────────────────────────────────────────

type WealthStage = 'survival' | 'accumulation' | 'development' | 'freedom';

function calculateWealthStage(stats: {
  avgMonthlyIncome: number;
  avgMonthlyExpense: number;
  totalAssets: number;
}): { stage: WealthStage; label: string; description: string } {
  const { avgMonthlyIncome, avgMonthlyExpense, totalAssets } = stats;
  const expenseCoverageMonths = totalAssets / (avgMonthlyExpense || 1);
  const savingsRate = avgMonthlyIncome > 0 ? (avgMonthlyIncome - avgMonthlyExpense) / avgMonthlyIncome : 0;

  if (expenseCoverageMonths >= 12) {
    return {
      stage: 'freedom',
      label: '财务自由期',
      description: '被动收入可覆盖支出，重点在于资产配置与增值',
    };
  }
  if (expenseCoverageMonths >= 3) {
    return {
      stage: 'development',
      label: '发展期',
      description: '已建立应急储备，重点在于积累与投资',
    };
  }
  if (savingsRate >= 0.2) {
    return {
      stage: 'accumulation',
      label: '积累期',
      description: '收入覆盖支出并有盈余，重点在于建立储蓄习惯',
    };
  }
  return {
    stage: 'survival',
    label: '生存期',
    description: '量入为出，建立应急基金是首要任务',
  };
}

// ── Suggestion Calculation ──────────────────────────────────────────

function calculateSuggestions(transactions: Transaction[], totalAssets: number) {
  const now = new Date();
  const months: { label: string; income: number; expense: number }[] = [];

  for (let i = 2; i >= 0; i--) {
    const y = now.getFullYear();
    const m = now.getMonth() - i;
    const start = new Date(y, m, 1).getTime();
    const end = new Date(y, m + 1, 1).getTime();
    const monthTxs = transactions.filter(t => t.date >= start && t.date < end);
    const income = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    months.push({ label: `${y}-${String(m + 1).padStart(2, '0')}`, income, expense });
  }

  const avgIncome = months.reduce((s, m) => s + m.income, 0) / 3 || 0;
  const avgExpense = months.reduce((s, m) => s + m.expense, 0) / 3 || 0;
  const lastMonthExpense = months[2]?.expense || avgExpense;

  return {
    monthlyIncome: {
      value: Math.round(avgIncome * 1.2),
      basis: `基于近3月平均收入（${Math.round(avgIncome)}元）× 1.2`,
    },
    monthlyExpenseLimit: {
      value: Math.round(lastMonthExpense * 0.95),
      basis: `基于上月支出（${Math.round(lastMonthExpense)}元）× 0.95（略收紧）`,
    },
    emergencyFund: {
      value: Math.round(avgExpense * 3),
      basis: `基于月均支出（${Math.round(avgExpense)}元）× 3个月`,
    },
    savingsRate: {
      value: avgIncome > 0 ? Math.round(((avgIncome - avgExpense) / avgIncome) * 100) : 20,
      basis: avgIncome > 0
        ? `基于近3月平均：收入${Math.round(avgIncome)} - 支出${Math.round(avgExpense)} = 储蓄率`
        : '无历史数据，建议设定 20%（《巴比伦富翁最受欢迎的秘密》）',
    },
    avgIncome,
    avgExpense,
    totalAssets,
  };
}

// ── GoalInputRow ───────────────────────────────────────────────────

function GoalInputRow({
  label,
  value,
  onChange,
  suggestion,
  prefix = '¥',
  suffix = '',
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suggestion?: { value: number; basis: string };
  prefix?: string;
  suffix?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div style={{
      background: css.card,
      borderRadius: '16px',
      padding: '18px 20px',
      boxShadow: css.shadowRaised,
      marginBottom: '12px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
      }}>
        <label style={{
          fontFamily: "'Noto Sans SC', sans-serif",
          fontSize: '14px',
          fontWeight: 500,
          color: css.text,
        }}>
          {label}
        </label>
        {hint && (
          <span style={{
            fontSize: '10px',
            color: css.textMuted,
            letterSpacing: '0.05em',
          }}>{hint}</span>
        )}
      </div>

      <div style={{ position: 'relative', marginBottom: '8px' }}>
        <input
          ref={inputRef}
          type="number"
          value={value || ''}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          placeholder={suggestion ? String(suggestion.value) : '0'}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '12px 16px',
            background: css.bg,
            border: 'none',
            borderRadius: '10px',
            boxShadow: css.shadowInset,
            color: css.text,
            fontSize: '18px',
            fontFamily: "'Noto Serif SC', serif",
            letterSpacing: '-0.02em',
            outline: 'none',
          }}
        />
        {(prefix || suffix) && (
          <span style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: css.textMuted,
            fontSize: '14px',
            pointerEvents: 'none',
          }}>
            {prefix}{suffix}
          </span>
        )}
      </div>

      {suggestion && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <button
            type="button"
            onClick={() => onChange(suggestion.value)}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              border: `1px solid ${css.accentGold}`,
              background: 'transparent',
              color: css.accentGold,
              fontSize: '11px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,146,58,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            采纳建议 ¥{suggestion.value.toLocaleString()}
          </button>
          <span style={{
            fontSize: '11px',
            color: css.textSecondary,
          }}>
            {suggestion.basis}
          </span>
        </div>
      )}
    </div>
  );
}

// ── StageCard ───────────────────────────────────────────────────────

function StageCard({ stage, label, description }: { stage: WealthStage; label: string; description: string }) {
  const colors: Record<WealthStage, string> = {
    survival: css.accentRed,
    accumulation: css.accentBlue,
    development: css.accentGold,
    freedom: css.accentGreen,
  };
  const icons: Record<WealthStage, React.ReactNode> = {
    survival: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10 2L3 18h14L10 2z" strokeLinejoin="round"/>
        <line x1="10" y1="9" x2="10" y2="13"/><circle cx="10" cy="15" r="0.5" fill="currentColor"/>
      </svg>
    ),
    accumulation: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="10" r="7"/>
        <path d="M10 6v8M7 9l3-3 3 3"/>
      </svg>
    ),
    development: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 17l5-8 4 4 5-9"/>
      </svg>
    ),
    freedom: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10 3c-4 5-6 7-6 10a6 6 0 0012 0c0-3-2-5-6-10z"/>
      </svg>
    ),
  };

  return (
    <div style={{
      background: css.card,
      borderRadius: '16px',
      padding: '16px 20px',
      boxShadow: css.shadowRaised,
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      marginBottom: '20px',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        background: colors[stage],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        flexShrink: 0,
      }}>
        {icons[stage]}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: "'Noto Sans SC', sans-serif",
          fontSize: '15px',
          fontWeight: 500,
          color: css.text,
          marginBottom: '2px',
        }}>
          {label}
        </div>
        <div style={{
          fontSize: '12px',
          color: css.textSecondary,
        }}>
          {description}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────

export default function GoalSettings() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<GoalSettings>(DEFAULT_GOALS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    db.transactions.toArray().then(setTransactions);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setGoals(JSON.parse(stored));
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!pageRef.current) return;
    const sections = pageRef.current.querySelectorAll('.animate-in');
    gsap.fromTo(sections,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.05 }
    );
  }, []);

  const stats = calculateSuggestions(transactions, 0);
  const wealthStage = calculateWealthStage({
    avgMonthlyIncome: stats.avgIncome,
    avgMonthlyExpense: stats.avgExpense,
    totalAssets: 0, // will be computed separately
  });

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateGoal = (key: keyof GoalSettings, value: number) => {
    setGoals(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div ref={pageRef} style={{
      padding: '40px 24px 100px',
      maxWidth: '560px',
      margin: '0 auto',
      minHeight: '100dvh',
      background: css.bg,
    }}>
      {/* Header */}
      <div className="animate-in" style={{ marginBottom: '8px' }}>
        <div style={{
          fontFamily: "'Noto Serif SC', serif",
          fontSize: '11px',
          letterSpacing: '0.5em',
          color: css.textSecondary,
          textTransform: 'uppercase',
          marginBottom: '2px',
        }}>绮梦账间</div>
        <h1 style={{
          fontFamily: "'Noto Sans SC', sans-serif",
          fontSize: '22px',
          fontWeight: 500,
          color: css.text,
          letterSpacing: '-0.01em',
          margin: 0,
        }}>目标设置</h1>
      </div>

      <div className="animate-in" style={{
        fontSize: '12px',
        color: css.textMuted,
        marginBottom: '24px',
        lineHeight: 1.6,
      }}>
        基于你的历史数据，设定财富目标<br/>
        <span style={{ fontSize: '11px' }}>点击「采纳建议」可一键填入推荐值</span>
      </div>

      {/* Wealth Stage */}
      <StageCard {...wealthStage} />

      {/* Goal Inputs */}
      <GoalInputRow
        label="月收入目标"
        value={goals.monthlyIncome}
        onChange={v => updateGoal('monthlyIncome', v)}
        suggestion={stats.monthlyIncome}
        prefix="¥"
        hint="每月计划收入"
      />

      <GoalInputRow
        label="月支出上限"
        value={goals.monthlyExpenseLimit}
        onChange={v => updateGoal('monthlyExpenseLimit', v)}
        suggestion={stats.monthlyExpenseLimit}
        prefix="¥"
        hint="支出控制"
      />

      <GoalInputRow
        label="应急储备目标"
        value={goals.emergencyFund}
        onChange={v => updateGoal('emergencyFund', v)}
        suggestion={stats.emergencyFund}
        prefix="¥"
        hint="3~6个月支出"
      />

      <GoalInputRow
        label="储蓄率目标"
        value={goals.savingsRate}
        onChange={v => updateGoal('savingsRate', v)}
        suggestion={stats.savingsRate}
        suffix="%"
        hint="收入-支出/收入"
      />

      {/* Save Button */}
      <button
        onClick={handleSave}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '16px',
          border: 'none',
          background: saved ? css.accentGreen : css.accentBlue,
          color: '#fff',
          fontSize: '16px',
          fontWeight: 500,
          fontFamily: "'Noto Sans SC', sans-serif",
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: css.shadowRaised,
          marginTop: '8px',
        }}
      >
        {saved ? '✓ 已保存' : '保存目标'}
      </button>

      {/* Wisdom Footer */}
      <div className="animate-in" style={{
        marginTop: '32px',
        padding: '20px',
        background: css.card,
        borderRadius: '16px',
        boxShadow: css.shadowInset,
      }}>
        <div style={{
          fontSize: '11px',
          color: css.textMuted,
          letterSpacing: '0.1em',
          marginBottom: '8px',
          textTransform: 'uppercase',
        }}>财富小语</div>
        <div style={{
          fontFamily: "'Noto Serif SC', serif",
          fontSize: '14px',
          color: css.text,
          lineHeight: 1.8,
          fontStyle: 'italic',
        }}>
          「富有不是你赚了多少，而是你留住了多少。」
          <div style={{
            fontSize: '11px',
            color: css.textSecondary,
            marginTop: '6px',
            fontStyle: 'normal',
          }}>
            —— 《巴比伦富翁最受欢迎的秘密》
          </div>
        </div>
      </div>
    </div>
  );
}