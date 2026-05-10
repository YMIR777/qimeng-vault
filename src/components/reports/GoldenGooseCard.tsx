import { useMemo, useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { Transaction } from '../../store/db';
import { calcMonthlyStats, calcEmergencyFundMonths, calcNetWorth } from '../../utils/financialHealth';

// ── Design Tokens (match Reports.tsx) ──────────────────────────────
const css = {
  bg: '#f5f0e8',
  card: '#f0ebe0',
  text: '#3d3427',
  textMuted: '#a89f8e',
  textSecondary: '#b8af9e',
  accentBlue: '#6b9fcf',
  accentGold: '#c9923a',
  accentGreen: '#7a9e7e',
  accentRed: '#d4a0a0',
  shadowRaised: '5px 5px 10px #cdc5b8, -5px -5px 10px #fffbf5',
  shadowInset: 'inset 4px 4px 8px #cdc5b8, inset -4px -4px 8px #fffbf5',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

// ── 解锁条件定义 ──────────────────────────────────────────────────
interface UnlockCondition {
  id: string;
  label: string;
  target: string;
  check: (ctx: GoldenContext) => boolean;
  currentValue: (ctx: GoldenContext) => string;
  progress: (ctx: GoldenContext) => number; // 0–1
  gap: (ctx: GoldenContext) => string;
}

interface GoldenContext {
  transactions: Transaction[];
  monthlyStats: { income: number; expense: number; net: number; savingsRate: number };
  emergencyMonths: number;
  netWorth: number;
  avgMonthlyExpense: number;
  savingsRate: number;
}

const CONDITIONS: UnlockCondition[] = [
  {
    id: 'income',
    label: '月收入',
    target: '≥ ¥3,000',
    check: (ctx) => ctx.monthlyStats.income >= 3000,
    currentValue: (ctx) => `¥${ctx.monthlyStats.income.toLocaleString()}`,
    progress: (ctx) => Math.min(1, ctx.monthlyStats.income / 3000),
    gap: (ctx) => ctx.monthlyStats.income >= 3000 ? '已达成' : `还差 ¥${(3000 - ctx.monthlyStats.income).toLocaleString()}`,
  },
  {
    id: 'savings_rate',
    label: '储蓄率',
    target: '≥ 20%',
    check: (ctx) => ctx.savingsRate >= 20,
    currentValue: (ctx) => `${ctx.savingsRate.toFixed(1)}%`,
    progress: (ctx) => Math.min(1, ctx.savingsRate / 20),
    gap: (ctx) => ctx.savingsRate >= 20 ? '已达成' : `还差 ${(20 - ctx.savingsRate).toFixed(1)}%`,
  },
  {
    id: 'emergency',
    label: '应急储备',
    target: '≥ 3个月',
    check: (ctx) => ctx.emergencyMonths >= 3,
    currentValue: (ctx) => `${ctx.emergencyMonths.toFixed(1)}个月`,
    progress: (ctx) => Math.min(1, ctx.emergencyMonths / 3),
    gap: (ctx) => ctx.emergencyMonths >= 3 ? '已达成' : `还差 ${(3 - ctx.emergencyMonths).toFixed(1)}个月`,
  },
];

// ── Props ──────────────────────────────────────────────────────────
interface GoldenGooseCardProps {
  transactions: Transaction[];
  compact?: boolean;
}

// ── Component ──────────────────────────────────────────────────────
export function GoldenGooseCard({ transactions, compact = false }: GoldenGooseCardProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [animating, setAnimating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const gooseRef = useRef<HTMLDivElement>(null);

  // 计算上下文数据
  const ctx = useMemo<GoldenContext>(() => {
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthlyStats = calcMonthlyStats(transactions, currentMonthStr);
    const emergencyMonths = calcEmergencyFundMonths(transactions);
    const netWorth = calcNetWorth(transactions);
    const avgMonthlyExpense = netWorth > 0 ? netWorth / Math.max(1, emergencyMonths) : 0;
    const savingsRate = monthlyStats.savingsRate;
    return { transactions, monthlyStats, emergencyMonths, netWorth, avgMonthlyExpense, savingsRate };
  }, [transactions]);

  const { conditions, metCount, totalCount } = useMemo(() => {
    const conditions = CONDITIONS.map(c => ({
      ...c,
      met: c.check(ctx),
      current: c.currentValue(ctx),
      prog: c.progress(ctx),
      gap: c.gap(ctx),
    }));
    const metCount = conditions.filter(c => c.met).length;
    return { conditions, metCount, totalCount: CONDITIONS.length };
  }, [ctx]);

  const overallProgress = metCount / totalCount;
  const allUnlocked = metCount === totalCount;

  // 解锁动画
  useEffect(() => {
    if (allUnlocked && !unlocked) {
      setAnimating(true);
      // 动画: 金色光芒从内向外扩散
      if (gooseRef.current) {
        gsap.fromTo(
          gooseRef.current,
          { scale: 1, filter: 'brightness(1) drop-shadow(0 0 0px #c9923a)' },
          {
            scale: 1.15,
            filter: 'brightness(1.3) drop-shadow(0 0 20px #c9923a)',
            duration: 0.6,
            ease: css.spring,
            onComplete: () => {
              gsap.to(gooseRef.current!, {
                scale: 1,
                filter: 'brightness(1.1) drop-shadow(0 0 8px #c9923a)',
                duration: 0.4,
              });
              setUnlocked(true);
              setAnimating(false);
            },
          }
        );
      }
      // 卡片闪烁
      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { boxShadow: css.shadowRaised },
          {
            boxShadow: '0 0 30px rgba(201,146,58,0.4), 5px 5px 10px #cdc5b8, -5px -5px 10px #fffbf5',
            duration: 0.4,
            yoyo: true,
            repeat: 3,
          }
        );
      }
    }
  }, [allUnlocked, unlocked, animating]);

  if (compact) {
    return (
      <div
        ref={cardRef}
        style={{
          background: allUnlocked ? 'linear-gradient(135deg, #f0e6c8, #f5ecd8)' : css.card,
          borderRadius: '18px',
          padding: '16px',
          boxShadow: allUnlocked
            ? '0 0 20px rgba(201,146,58,0.3), 5px 5px 10px #cdc5b8, -5px -5px 10px #fffbf5'
            : css.shadowRaised,
          transition: 'all 0.6s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* 鹅图标 */}
          <div
            ref={gooseRef}
            style={{
              fontSize: '32px',
              filter: allUnlocked
                ? 'drop-shadow(0 0 8px #c9923a)'
                : 'grayscale(100%) opacity(0.4)',
              transition: 'filter 0.6s ease',
            }}
          >
            {allUnlocked ? '🪿' : '🔒'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "'Noto Sans SC', sans-serif",
              fontSize: '13px',
              fontWeight: 500,
              color: css.text,
              marginBottom: '4px',
            }}>
              金鹅守护者
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <div style={{
                flex: 1,
                height: '6px',
                background: 'rgba(163,158,148,0.15)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${overallProgress * 100}%`,
                  height: '100%',
                  background: allUnlocked
                    ? 'linear-gradient(90deg, #c9923a, #e8c060)'
                    : 'linear-gradient(90deg, #6b9fcf, #7a9e7e)',
                  borderRadius: '3px',
                  transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }} />
              </div>
              <span style={{
                fontFamily: "'Noto Sans SC', sans-serif",
                fontSize: '11px',
                color: allUnlocked ? css.accentGold : css.textMuted,
                whiteSpace: 'nowrap',
              }}>
                {metCount}/{totalCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      style={{
        background: allUnlocked ? 'linear-gradient(135deg, #f0e6c8, #f5ecd8)' : css.card,
        borderRadius: '18px',
        padding: '20px',
        boxShadow: allUnlocked
          ? '0 0 30px rgba(201,146,58,0.25), 5px 5px 10px #cdc5b8, -5px -5px 10px #fffbf5'
          : css.shadowRaised,
        transition: 'all 0.6s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 锁定状态背景纹理 */}
      {!allUnlocked && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(163,158,148,0.03) 10px, rgba(163,158,148,0.03) 20px)',
          pointerEvents: 'none',
        }} />
      )}

      {/* 解锁成功动画 */}
      {animating && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at center, rgba(201,146,58,0.3) 0%, transparent 70%)',
          animation: 'pulse 0.8s ease-out forwards',
          pointerEvents: 'none',
        }} />
      )}

      {/* 标题行 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '16px',
        position: 'relative',
      }}>
        <div
          ref={gooseRef}
          style={{
            fontSize: '36px',
            filter: allUnlocked
              ? 'drop-shadow(0 0 12px #c9923a)'
              : 'grayscale(100%) opacity(0.35)',
            transition: 'filter 0.6s ease',
          }}
        >
          {allUnlocked ? '🪿' : '🔒'}
        </div>
        <div>
          <div style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '14px',
            fontWeight: 500,
            color: css.text,
            letterSpacing: '0.05em',
          }}>
            金鹅守护者
          </div>
          <div style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '11px',
            color: css.textMuted,
            marginTop: '2px',
          }}>
            {allUnlocked ? '✨ 已解锁金鹅账户' : '锁定中 — 满足条件即可解锁'}
          </div>
        </div>

        {/* 解锁徽章 */}
        {allUnlocked && (
          <div style={{
            marginLeft: 'auto',
            background: 'linear-gradient(135deg, #c9923a, #e8c060)',
            color: '#fff',
            fontSize: '10px',
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: '12px',
            letterSpacing: '0.08em',
            boxShadow: '0 2px 8px rgba(201,146,58,0.4)',
            animation: 'fadeIn 0.5s ease-out',
          }}>
            已解锁
          </div>
        )}
      </div>

      {/* 整体进度条 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
        padding: '12px 16px',
        background: 'rgba(163,158,148,0.08)',
        borderRadius: '12px',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '6px',
          }}>
            <span style={{
              fontFamily: "'Noto Sans SC', sans-serif",
              fontSize: '11px',
              color: css.textMuted,
            }}>解锁进度</span>
            <span style={{
              fontFamily: "'Noto Sans SC', sans-serif",
              fontSize: '11px',
              color: allUnlocked ? css.accentGold : css.textMuted,
              fontWeight: 500,
            }}>
              {metCount} / {totalCount} 条件
            </span>
          </div>
          <div style={{
            height: '8px',
            background: 'rgba(163,158,148,0.15)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${overallProgress * 100}%`,
              height: '100%',
              background: allUnlocked
                ? 'linear-gradient(90deg, #c9923a, #e8c060, #f5d98a)'
                : 'linear-gradient(90deg, #6b9fcf, #7a9e7e)',
              borderRadius: '4px',
              transition: `width 1s ${css.spring}`,
              boxShadow: allUnlocked ? '0 0 8px rgba(201,146,58,0.5)' : 'none',
            }} />
          </div>
        </div>
      </div>

      {/* 三个条件列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {conditions.map((condition) => (
          <div
            key={condition.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              background: condition.met
                ? 'rgba(122,158,126,0.08)'
                : 'rgba(163,158,148,0.06)',
              borderRadius: '12px',
              border: condition.met
                ? '1px solid rgba(122,158,126,0.2)'
                : '1px solid rgba(163,158,148,0.1)',
              transition: 'all 0.4s ease',
            }}
          >
            {/* 状态图标 */}
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: condition.met
                ? 'rgba(122,158,126,0.15)'
                : 'rgba(163,158,148,0.1)',
              fontSize: '14px',
              flexShrink: 0,
            }}>
              {condition.met ? '✅' : '○'}
            </div>

            {/* 标签和目标 */}
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{
                  fontFamily: "'Noto Sans SC', sans-serif",
                  fontSize: '12px',
                  fontWeight: 500,
                  color: condition.met ? css.accentGreen : css.text,
                }}>
                  {condition.label}
                </span>
                <span style={{
                  fontSize: '10px',
                  color: css.textMuted,
                  background: 'rgba(163,158,148,0.08)',
                  padding: '1px 6px',
                  borderRadius: '6px',
                }}>
                  目标: {condition.target}
                </span>
              </div>
              {/* 进度条 */}
              <div style={{
                marginTop: '6px',
                height: '4px',
                background: 'rgba(163,158,148,0.12)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${condition.prog * 100}%`,
                  height: '100%',
                  background: condition.met
                    ? `linear-gradient(90deg, ${css.accentGreen}, #8fbc8f)`
                    : 'linear-gradient(90deg, #6b9fcf, #7a9e7e)',
                  borderRadius: '2px',
                  transition: `width 0.8s ${css.spring}`,
                }} />
              </div>
            </div>

            {/* 当前值 & 差距 */}
            <div style={{
              textAlign: 'right',
              flexShrink: 0,
              minWidth: '70px',
            }}>
              <div style={{
                fontFamily: "'Noto Sans SC', sans-serif",
                fontSize: '13px',
                fontWeight: 500,
                color: condition.met ? css.accentGreen : css.text,
              }}>
                {condition.current}
              </div>
              <div style={{
                fontFamily: "'Noto Sans SC', sans-serif",
                fontSize: '10px',
                color: condition.met ? css.accentGreen : css.accentRed,
                marginTop: '2px',
              }}>
                {condition.gap}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 解锁消息提示 */}
      {!allUnlocked && (
        <div style={{
          marginTop: '16px',
          padding: '10px 14px',
          background: 'rgba(107,159,207,0.08)',
          borderRadius: '10px',
          border: '1px solid rgba(107,159,207,0.15)',
          textAlign: 'center',
        }}>
          <span style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '11px',
            color: css.accentBlue,
          }}>
            💡 继续记录收支，解锁金鹅账户
          </span>
        </div>
      )}

      {/* 已解锁祝福语 */}
      {allUnlocked && !animating && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          background: 'linear-gradient(135deg, rgba(201,146,58,0.1), rgba(232,192,96,0.1))',
          borderRadius: '10px',
          border: '1px solid rgba(201,146,58,0.2)',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: "'Noto Sans SC', serif",
            fontSize: '14px',
            fontWeight: 500,
            color: css.accentGold,
            marginBottom: '4px',
          }}>
            🎉 恭喜解锁金鹅账户！
          </div>
          <div style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '11px',
            color: css.textMuted,
          }}>
            你的财务正在为你工作，继续保持！
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.8; transform: scale(0.8); }
          100% { opacity: 0; transform: scale(2); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}