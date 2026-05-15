import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { GoalProgress } from '../../store/useGoals';

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
  shadowRaised: '5px 5px 12px #cdc5b8, -5px -5px 12px #fffbf5',
  shadowInset: 'inset 3px 3px 7px #cdc5b8, inset -3px -3px 7px #fffbf5',
} as const;

interface GoalProgressCardProps {
  goal: GoalProgress;
  index: number;
}

export function GoalProgressCard({ goal, index }: GoalProgressCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(
      cardRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, delay: 0.1 + index * 0.08, ease: 'power2.out' }
    );
  }, [index]);

  // Calculate percentage
  let pct: number;
  if (goal.target === 0) {
    pct = 0;
  } else if (goal.higherIsBetter) {
    pct = Math.min((goal.current / goal.target) * 100, 100);
  } else {
    // Lower is better: full bar when current <= target
    pct = goal.target > 0 ? Math.min((goal.target / Math.max(goal.current, 0.01)) * 100, 100) : 0;
  }

  const overTarget = goal.higherIsBetter
    ? goal.current > goal.target && goal.target > 0
    : goal.current > goal.target && goal.target > 0;

  const barColor = overTarget
    ? goal.key === 'monthlyExpenseLimit' ? css.accentRed : css.accentGold
    : goal.key === 'monthlyExpenseLimit'
    ? css.accentGreen
    : css.accentBlue;

  const statusLabel = overTarget
    ? (goal.higherIsBetter ? '已达成 ✓' : '已超标 ✗')
    : goal.higherIsBetter
    ? `进行中 ${pct.toFixed(0)}%`
    : `${pct.toFixed(0)}%`;

  return (
    <div
      ref={cardRef}
      style={{
        background: css.card,
        borderRadius: '16px',
        padding: '16px 18px',
        boxShadow: css.shadowRaised,
        marginBottom: '10px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top row: label + status badge */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
      }}>
        <div>
          <div style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '13px',
            fontWeight: 500,
            color: css.text,
            marginBottom: '1px',
          }}>
            {goal.label}
          </div>
          <div style={{
            fontSize: '10px',
            color: css.textSecondary,
            fontFamily: "'Noto Sans SC', sans-serif",
          }}>
            {goal.description}
          </div>
        </div>
        <div style={{
          padding: '4px 10px',
          borderRadius: '20px',
          background: overTarget
            ? (goal.key === 'monthlyExpenseLimit' ? 'rgba(192,112,112,0.12)' : 'rgba(201,146,58,0.12)')
            : 'rgba(107,159,207,0.10)',
          color: overTarget
            ? (goal.key === 'monthlyExpenseLimit' ? css.accentRed : css.accentGold)
            : css.accentBlue,
          fontSize: '11px',
          fontFamily: "'Noto Sans SC', sans-serif",
          fontWeight: 600,
          letterSpacing: '0.02em',
        }}>
          {statusLabel}
        </div>
      </div>

      {/* Numbers row */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '6px',
        marginBottom: '10px',
      }}>
        {/* Current value */}
        <span style={{
          fontFamily: "'Noto Serif SC', serif",
          fontSize: '22px',
          fontWeight: 700,
          color: css.text,
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}>
          {goal.current.toLocaleString('zh-CN')}
        </span>
        <span style={{
          fontFamily: "'Noto Sans SC', sans-serif",
          fontSize: '11px',
          color: css.textMuted,
        }}>
          {goal.unit}
        </span>
        {/* Divider */}
        <span style={{
          color: css.textSecondary,
          fontSize: '12px',
          margin: '0 2px',
        }}>/</span>
        {/* Target value */}
        <span style={{
          fontFamily: "'Noto Sans SC', sans-serif",
          fontSize: '13px',
          color: css.textMuted,
        }}>
          目标 {goal.target.toLocaleString('zh-CN')}{goal.unit}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{
        height: '5px',
        borderRadius: '3px',
        background: 'rgba(163,158,148,0.15)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: '3px',
          background: barColor,
          transition: 'width 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }} />
      </div>

      {/* Bottom: remaining or over amount */}
      {goal.target > 0 && (
        <div style={{
          marginTop: '6px',
          fontSize: '10px',
          color: css.textSecondary,
          fontFamily: "'Noto Sans SC', sans-serif",
        }}>
          {goal.higherIsBetter ? (
            goal.current >= goal.target
              ? `🎉 已超出目标 ${(goal.current - goal.target).toLocaleString('zh-CN')}${goal.unit}`
              : `还差 ${(goal.target - goal.current).toLocaleString('zh-CN')}${goal.unit}`
          ) : (
            goal.current <= goal.target
              ? `✅ 支出控制在目标内，剩余 ${(goal.target - goal.current).toLocaleString('zh-CN')}${goal.unit}`
              : `⚠️ 已超出目标 ${(goal.current - goal.target).toLocaleString('zh-CN')}${goal.unit}`
          )}
        </div>
      )}
    </div>
  );
}

// ── GoalsSummary — Compact version for Dashboard top row ──────────
interface GoalsSummaryProps {
  goalProgressList: GoalProgress[];
}

export function GoalsSummary({ goalProgressList }: GoalsSummaryProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current.children,
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out', delay: 0.6 }
    );
  }, [goalProgressList.length]);

  // Show only top 2 most relevant goals in compact row
  const compactGoals = goalProgressList.slice(0, 2);

  return (
    <div ref={ref} style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '10px',
      marginBottom: '10px',
    }}>
      {compactGoals.map((goal, i) => {
        const pct = goal.target > 0
          ? (goal.higherIsBetter
              ? Math.min((goal.current / goal.target) * 100, 100)
              : Math.min((goal.target / Math.max(goal.current, 0.01)) * 100, 100))
          : 0;

        const overTarget = goal.higherIsBetter
          ? goal.current > goal.target && goal.target > 0
          : goal.current > goal.target && goal.target > 0;

        return (
          <div key={goal.key} style={{
            background: '#f0ebe0',
            borderRadius: '14px',
            padding: '14px 16px',
            boxShadow: '3px 3px 8px #cdc5b8, -3px -3px 8px #fffbf5',
          }}>
            <div style={{
              fontFamily: "'Noto Sans SC', sans-serif",
              fontSize: '10px',
              color: '#b8af9e',
              letterSpacing: '0.08em',
              marginBottom: '6px',
            }}>
              {goal.label}
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '7px',
            }}>
              <span style={{
                fontFamily: "'Noto Serif SC', serif",
                fontSize: '15px',
                color: '#3d3427',
                letterSpacing: '-0.01em',
              }}>
                {goal.current.toLocaleString('zh-CN')}
                <span style={{ fontSize: '10px', color: '#a89f8e', marginLeft: '2px' }}>{goal.unit}</span>
              </span>
              <span style={{
                fontSize: '10px',
                color: overTarget ? (goal.key === 'monthlyExpenseLimit' ? css.accentRed : css.accentGold) : '#7a9e7e',
                fontFamily: "'Noto Sans SC', sans-serif",
              }}>
                {pct.toFixed(0)}%
              </span>
            </div>
            <div style={{
              height: '4px',
              borderRadius: '2px',
              background: 'rgba(163,158,148,0.15)',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${pct}%`,
                borderRadius: '2px',
                background: overTarget
                  ? (goal.key === 'monthlyExpenseLimit' ? css.accentRed : css.accentGold)
                  : css.accentBlue,
                transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── GoalsSection — Full card list for Reports or Settings ──────────
interface GoalsSectionProps {
  goalProgressList: GoalProgress[];
  onEditGoals?: () => void;
}

export function GoalsSection({ goalProgressList, onEditGoals }: GoalsSectionProps) {
  return (
    <div>
      {/* Section header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
      }}>
        <div style={{
          fontFamily: "'Noto Sans SC', sans-serif",
          fontSize: '12px',
          fontWeight: 500,
          color: '#a89f8e',
          letterSpacing: '0.08em',
        }}>
          目标进度
        </div>
        {onEditGoals && (
          <button
            onClick={onEditGoals}
            style={{
              background: 'none',
              border: 'none',
              color: '#b8af9e',
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: "'Noto Sans SC', sans-serif",
              padding: '4px 8px',
              borderRadius: '6px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            编辑目标 →
          </button>
        )}
      </div>
      {goalProgressList.map((goal, i) => (
        <GoalProgressCard key={goal.key} goal={goal} index={i} />
      ))}
    </div>
  );
}