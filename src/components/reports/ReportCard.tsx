import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import type { DailyReport, WeeklyReport } from '../../store/useReports';

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

const statusConfig = {
  surplus: { color: css.accentGreen, bg: 'rgba(122,158,126,0.10)', label: '盈余' },
  deficit: { color: css.accentRed, bg: 'rgba(192,112,112,0.10)', label: '亏损' },
  break_even: { color: css.textSecondary, bg: 'rgba(163,158,148,0.10)', label: '平衡' },
} as const;

// ── Daily Report Card ──────────────────────────────────────────────
export function DailyReportCard({ report, index = 0 }: { report: DailyReport; index?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const status = statusConfig[report.status];

  useEffect(() => {
    if (!ref.current || index !== 0) return;
    gsap.fromTo(ref.current,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, delay: 0.15, ease: 'power2.out' }
    );
  }, [index]);

  return (
    <div
      ref={ref}
      style={{
        background: css.card,
        borderRadius: '18px',
        padding: '20px',
        boxShadow: css.shadowRaised,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header: date + status badge */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <div>
          <div style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: '11px',
            letterSpacing: '0.3em',
            color: css.textSecondary,
            textTransform: 'uppercase',
            marginBottom: '2px',
          }}>
            日报
          </div>
          <div style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '16px',
            fontWeight: 500,
            color: css.text,
          }}>
            {report.dateLabel}
          </div>
        </div>
        <div style={{
          padding: '5px 12px',
          borderRadius: '20px',
          background: status.bg,
          color: status.color,
          fontSize: '12px',
          fontFamily: "'Noto Sans SC', sans-serif",
          fontWeight: 600,
        }}>
          {status.label}
        </div>
      </div>

      {/* Summary text */}
      <div style={{
        fontSize: '13px',
        color: css.text,
        fontFamily: "'Noto Sans SC', sans-serif",
        marginBottom: '16px',
        lineHeight: 1.5,
      }}>
        {report.summary}
      </div>

      {/* Main numbers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '12px',
        marginBottom: '16px',
      }}>
        <div style={{
          background: css.bg,
          borderRadius: '12px',
          padding: '14px 10px',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: '20px',
            fontWeight: 700,
            color: css.accentBlue,
            letterSpacing: '-0.02em',
          }}>
            ¥{report.income.toLocaleString('zh-CN')}
          </div>
          <div style={{
            fontSize: '10px',
            color: css.textSecondary,
            marginTop: '4px',
            fontFamily: "'Noto Sans SC', sans-serif",
          }}>
            收入 {report.incomeTxCount}笔
          </div>
        </div>

        <div style={{
          background: css.bg,
          borderRadius: '12px',
          padding: '14px 10px',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: '20px',
            fontWeight: 700,
            color: css.accentGold,
            letterSpacing: '-0.02em',
          }}>
            ¥{report.expense.toLocaleString('zh-CN')}
          </div>
          <div style={{
            fontSize: '10px',
            color: css.textSecondary,
            marginTop: '4px',
            fontFamily: "'Noto Sans SC', sans-serif",
          }}>
            支出 {report.expenseTxCount}笔
          </div>
        </div>

        <div style={{
          background: css.bg,
          borderRadius: '12px',
          padding: '14px 10px',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: '20px',
            fontWeight: 700,
            color: report.net >= 0 ? css.accentGreen : css.accentRed,
            letterSpacing: '-0.02em',
          }}>
            {report.net >= 0 ? '+' : ''}¥{report.net.toLocaleString('zh-CN')}
          </div>
          <div style={{
            fontSize: '10px',
            color: css.textSecondary,
            marginTop: '4px',
            fontFamily: "'Noto Sans SC', sans-serif",
          }}>
            净增
          </div>
        </div>
      </div>

      {/* Highlights */}
      {(report.topIncome || report.topExpense) && (
        <div style={{
          background: css.bg,
          borderRadius: '12px',
          padding: '14px 16px',
        }}>
          <div style={{
            fontSize: '11px',
            color: css.textMuted,
            marginBottom: '8px',
            fontFamily: "'Noto Sans SC', sans-serif",
            letterSpacing: '0.08em',
          }}>
            今日高光
          </div>
          {report.topIncome && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px',
            }}>
              <span style={{
                fontSize: '12px',
                color: css.text,
                fontFamily: "'Noto Sans SC', sans-serif",
              }}>
                🌟 最高收入 · {report.topIncome.category || '其他'}
              </span>
              <span style={{
                fontSize: '13px',
                color: css.accentBlue,
                fontFamily: "'Noto Serif SC', serif",
                fontWeight: 600,
              }}>
                +¥{report.topIncome.amount.toLocaleString('zh-CN')}
              </span>
            </div>
          )}
          {report.topExpense && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{
                fontSize: '12px',
                color: css.text,
                fontFamily: "'Noto Sans SC', sans-serif",
              }}>
                📌 最高支出 · {report.topExpense.category || '其他'}
              </span>
              <span style={{
                fontSize: '13px',
                color: css.accentGold,
                fontFamily: "'Noto Serif SC', serif",
                fontWeight: 600,
              }}>
                -¥{report.topExpense.amount.toLocaleString('zh-CN')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Goal progress mini */}
      {(report.goalProgress.monthlyIncomePct > 0 || report.goalProgress.monthlyExpensePct > 0) && (
        <div style={{
          marginTop: '14px',
          paddingTop: '14px',
          borderTop: '1px solid rgba(163,158,148,0.15)',
        }}>
          <div style={{
            fontSize: '10px',
            color: css.textSecondary,
            marginBottom: '8px',
            fontFamily: "'Noto Sans SC', sans-serif",
            letterSpacing: '0.08em',
          }}>
            本月目标进度
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {report.goalProgress.monthlyIncomePct > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '11px', color: css.textSecondary, width: '60px', fontFamily: "'Noto Sans SC', sans-serif" }}>收入</span>
                <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: 'rgba(163,158,148,0.15)' }}>
                  <div style={{
                    height: '100%',
                    width: `${report.goalProgress.monthlyIncomePct}%`,
                    borderRadius: '2px',
                    background: css.accentBlue,
                    transition: 'width 0.8s ease',
                  }} />
                </div>
                <span style={{ fontSize: '11px', color: css.accentBlue, fontFamily: "'Noto Serif SC', serif" }}>
                  {report.goalProgress.monthlyIncomePct.toFixed(0)}%
                </span>
              </div>
            )}
            {report.goalProgress.monthlyExpensePct > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '11px', color: css.textSecondary, width: '60px', fontFamily: "'Noto Sans SC', sans-serif" }}>支出</span>
                <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: 'rgba(163,158,148,0.15)' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(report.goalProgress.monthlyExpensePct, 100)}%`,
                    borderRadius: '2px',
                    background: report.goalProgress.monthlyExpensePct > 80 ? css.accentRed : css.accentGold,
                    transition: 'width 0.8s ease',
                  }} />
                </div>
                <span style={{
                  fontSize: '11px',
                  color: report.goalProgress.monthlyExpensePct > 80 ? css.accentRed : css.accentGold,
                  fontFamily: "'Noto Serif SC', serif",
                }}>
                  {report.goalProgress.monthlyExpensePct.toFixed(0)}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Weekly Report Card ─────────────────────────────────────────────
export function WeeklyReportCard({ report }: { report: WeeklyReport }) {
  const ref = useRef<HTMLDivElement>(null);
  const status = statusConfig[report.status];

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, delay: 0.1, ease: 'power2.out' }
    );
  }, []);

  return (
    <div
      ref={ref}
      style={{
        background: css.card,
        borderRadius: '18px',
        padding: '20px',
        boxShadow: css.shadowRaised,
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <div>
          <div style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: '11px',
            letterSpacing: '0.3em',
            color: css.textSecondary,
            textTransform: 'uppercase',
            marginBottom: '2px',
          }}>
            周报
          </div>
          <div style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '16px',
            fontWeight: 500,
            color: css.text,
          }}>
            {report.weekLabel}
          </div>
          <div style={{
            fontSize: '10px',
            color: css.textMuted,
            marginTop: '2px',
            fontFamily: "'Noto Sans SC', sans-serif",
          }}>
            {report.weekStart.slice(5)} ~ {report.weekEnd.slice(5)}
          </div>
        </div>
        <div style={{
          padding: '5px 12px',
          borderRadius: '20px',
          background: status.bg,
          color: status.color,
          fontSize: '12px',
          fontFamily: "'Noto Sans SC', sans-serif",
          fontWeight: 600,
        }}>
          {status.label}
        </div>
      </div>

      {/* Summary */}
      <div style={{
        fontSize: '13px',
        color: css.text,
        fontFamily: "'Noto Sans SC', sans-serif",
        marginBottom: '16px',
        lineHeight: 1.5,
      }}>
        {report.summary}
      </div>

      {/* Main stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '12px',
        marginBottom: '16px',
      }}>
        <div style={{ background: css.bg, borderRadius: '12px', padding: '14px 10px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '20px', fontWeight: 700, color: css.accentBlue, letterSpacing: '-0.02em' }}>
            ¥{report.income.toLocaleString('zh-CN')}
          </div>
          <div style={{ fontSize: '10px', color: css.textSecondary, marginTop: '4px', fontFamily: "'Noto Sans SC', sans-serif" }}>
            总收入
          </div>
        </div>
        <div style={{ background: css.bg, borderRadius: '12px', padding: '14px 10px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '20px', fontWeight: 700, color: css.accentGold, letterSpacing: '-0.02em' }}>
            ¥{report.expense.toLocaleString('zh-CN')}
          </div>
          <div style={{ fontSize: '10px', color: css.textSecondary, marginTop: '4px', fontFamily: "'Noto Sans SC', sans-serif" }}>
            总支出
          </div>
        </div>
        <div style={{ background: css.bg, borderRadius: '12px', padding: '14px 10px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '20px', fontWeight: 700, color: report.net >= 0 ? css.accentGreen : css.accentRed, letterSpacing: '-0.02em' }}>
            {report.net >= 0 ? '+' : ''}¥{report.net.toLocaleString('zh-CN')}
          </div>
          <div style={{ fontSize: '10px', color: css.textSecondary, marginTop: '4px', fontFamily: "'Noto Sans SC', sans-serif" }}>
            净增
          </div>
        </div>
      </div>

      {/* Week-over-week comparison */}
      <div style={{
        background: css.bg,
        borderRadius: '12px',
        padding: '14px 16px',
        marginBottom: '14px',
      }}>
        <div style={{
          fontSize: '11px',
          color: css.textMuted,
          marginBottom: '10px',
          fontFamily: "'Noto Sans SC', sans-serif",
          letterSpacing: '0.08em',
        }}>
          环比上周
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '14px',
              fontFamily: "'Noto Serif SC', serif",
              fontWeight: 600,
              color: report.vsLastWeek.incomeChange >= 0 ? css.accentGreen : css.accentRed,
            }}>
              {report.vsLastWeek.incomeChange >= 0 ? '+' : ''}{report.vsLastWeek.incomeChange.toFixed(0)}%
            </div>
            <div style={{ fontSize: '10px', color: css.textSecondary, marginTop: '2px', fontFamily: "'Noto Sans SC', sans-serif" }}>收入</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '14px',
              fontFamily: "'Noto Serif SC', serif",
              fontWeight: 600,
              color: report.vsLastWeek.expenseChange <= 0 ? css.accentGreen : css.accentRed,
            }}>
              {report.vsLastWeek.expenseChange >= 0 ? '+' : ''}{report.vsLastWeek.expenseChange.toFixed(0)}%
            </div>
            <div style={{ fontSize: '10px', color: css.textSecondary, marginTop: '2px', fontFamily: "'Noto Sans SC', sans-serif" }}>支出</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '14px',
              fontFamily: "'Noto Serif SC', serif",
              fontWeight: 600,
              color: report.vsLastWeek.netChange >= 0 ? css.accentGreen : css.accentRed,
            }}>
              {report.vsLastWeek.netChange >= 0 ? '+' : ''}{report.vsLastWeek.netChange.toFixed(0)}%
            </div>
            <div style={{ fontSize: '10px', color: css.textSecondary, marginTop: '2px', fontFamily: "'Noto Sans SC', sans-serif" }}>净增</div>
          </div>
        </div>
      </div>

      {/* Best / Worst day */}
      {(report.bestDay || report.worstDay) && (
        <div style={{
          background: css.bg,
          borderRadius: '12px',
          padding: '14px 16px',
        }}>
          <div style={{
            fontSize: '11px',
            color: css.textMuted,
            marginBottom: '8px',
            fontFamily: "'Noto Sans SC', sans-serif",
            letterSpacing: '0.08em',
          }}>
            本周最佳 / 最差
          </div>
          {report.bestDay && report.bestDay.income > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '4px',
            }}>
              <span style={{ fontSize: '12px', color: css.text, fontFamily: "'Noto Sans SC', sans-serif" }}>
                🌟 最佳 {report.bestDay.date.slice(5)}
              </span>
              <span style={{ fontSize: '13px', color: css.accentBlue, fontFamily: "'Noto Serif SC', serif", fontWeight: 600 }}>
                +¥{report.bestDay.income.toLocaleString('zh-CN')}
              </span>
            </div>
          )}
          {report.worstDay && report.worstDay.expense > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '12px', color: css.text, fontFamily: "'Noto Sans SC', sans-serif" }}>
                📉 最差 {report.worstDay.date.slice(5)}
              </span>
              <span style={{ fontSize: '13px', color: css.accentGold, fontFamily: "'Noto Serif SC', serif", fontWeight: 600 }}>
                -¥{report.worstDay.expense.toLocaleString('zh-CN')}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Daily Report Strip (compact horizontal list) ───────────────────
export function DailyReportStrip({ reports }: { reports: DailyReport[] }) {
  return (
    <div style={{
      display: 'flex',
      gap: '10px',
      overflowX: 'auto',
      paddingBottom: '4px',
      scrollbarWidth: 'none',
    }}>
      {reports.map((report, i) => {
        const status = statusConfig[report.status];
        return (
          <div
            key={report.date}
            style={{
              minWidth: '140px',
              background: css.card,
              borderRadius: '14px',
              padding: '14px',
              boxShadow: '3px 3px 8px #cdc5b8, -3px -3px 8px #fffbf5',
              flexShrink: 0,
            }}
          >
            <div style={{
              fontSize: '11px',
              color: css.textSecondary,
              marginBottom: '8px',
              fontFamily: "'Noto Sans SC', sans-serif",
            }}>
              {report.dateLabel.replace(/\d{4}年/, '')}
            </div>
            <div style={{
              fontFamily: "'Noto Serif SC', serif",
              fontSize: '18px',
              fontWeight: 700,
              color: report.net >= 0 ? css.accentGreen : css.accentRed,
              letterSpacing: '-0.02em',
              marginBottom: '6px',
            }}>
              {report.net >= 0 ? '+' : ''}¥{report.net.toLocaleString('zh-CN')}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ fontSize: '10px', color: css.accentBlue, fontFamily: "'Noto Sans SC', sans-serif" }}>
                收{report.incomeTxCount}
              </span>
              <span style={{ fontSize: '10px', color: css.accentGold, fontFamily: "'Noto Sans SC', sans-serif" }}>
                支{report.expenseTxCount}
              </span>
              <span style={{
                fontSize: '10px',
                color: status.color,
                background: status.bg,
                padding: '1px 6px',
                borderRadius: '8px',
                fontFamily: "'Noto Sans SC', sans-serif",
              }}>
                {status.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}