import { useMemo } from 'react';
import type { Transaction } from '../../store/db';
import { calcMonthlyStats, calcEmergencyFundMonths, calcHourlyRate } from '../../utils/financialHealth';
import { getSavingsRateInsight, getEmergencyFundInsight } from '../../utils/wisdomEngine';
import { WisdomTooltip } from '../ui/WisdomTooltip';

interface Props {
  transactions: Transaction[];
}

function AnimatedCard({ title, value, prefix = '', suffix = '', color = '#3d3427', wisdom, detail }: {
  title: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  color?: string;
  wisdom?: string;
  detail?: string;
}) {
  return (
    <div style={{
      background: '#f0ebe0',
      borderRadius: '18px',
      padding: '20px',
      boxShadow: '5px 5px 10px #cdc5b8, -5px -5px 10px #fffbf5',
      textAlign: 'center',
      position: 'relative',
    }}>
      {wisdom && (
        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
          <WisdomTooltip wisdom={wisdom} detail={detail}>
            <span style={{
              width: '20px', height: '20px', borderRadius: '50%',
              background: 'rgba(201,146,58,0.15)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', color: '#c9923a', cursor: 'help',
            }}>?</span>
          </WisdomTooltip>
        </div>
      )}
      <div style={{
        fontFamily: "'Noto Sans SC', sans-serif",
        fontSize: '10px',
        color: '#a89f8e',
        letterSpacing: '0.12em',
        marginBottom: '8px',
      }}>
        {title}
      </div>
      <div style={{
        fontFamily: "'Noto Serif SC', serif",
        fontSize: 'clamp(22px, 4vw, 32px)',
        color,
        letterSpacing: '-0.02em',
        lineHeight: 1,
      }}>
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </div>
    </div>
  );
}

export function FinancialSummary({ transactions }: Props) {
  const stats = useMemo(() => calcMonthlyStats(transactions), [transactions]);
  const emergencyMonths = useMemo(() => calcEmergencyFundMonths(transactions), [transactions]);
  const hourlyRate = useMemo(() => calcHourlyRate(transactions), [transactions]);

  const savingsInsight = useMemo(() => getSavingsRateInsight(stats.savingsRate), [stats.savingsRate]);
  const emergencyInsight = useMemo(() => getEmergencyFundInsight(emergencyMonths), [emergencyMonths]);

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        marginBottom: '16px',
      }}>
        <AnimatedCard
          title="本月收入"
          value={stats.income}
          prefix="¥"
          color="#6b9fcf"
          wisdom="收入是河流，储蓄是湖泊。河流再宽，没有湖泊就会干涸。"
          detail="记录所有进入你口袋的钱，无论来源。"
        />
        <AnimatedCard
          title="本月支出"
          value={stats.expense}
          prefix="¥"
          color="#c9923a"
          wisdom="清崎说：'穷人先花钱，富人先存钱。'每一笔支出都在投票给某种生活。"
          detail="不是所有支出都是坏事。投资自己的支出是资产。"
        />
        <AnimatedCard
          title="净结余"
          value={stats.net}
          prefix={stats.net >= 0 ? '¥' : '-¥'}
          color={stats.net >= 0 ? '#7a9e7e' : '#d4a0a0'}
          wisdom="结余 = 自由。这个月的结余，是你下个月选择权的存款。"
        />
        <AnimatedCard
          title="储蓄率"
          value={Math.round(stats.savingsRate)}
          suffix="%"
          color={savingsInsight.color}
          wisdom={savingsInsight.message}
          detail={`当前 ${Math.round(stats.savingsRate)}%，${stats.savingsRate >= 20 ? '优秀' : '建议提升到 20% 以上'}`}
        />
      </div>

      {/* 洞察徽章 */}
      <div style={{
        background: '#f0ebe0',
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: 'inset 3px 3px 6px #cdc5b8, inset -3px -3px 6px #fffbf5',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '11px', color: '#a89f8e' }}>💡 本月洞察</span>
        <span style={{
          fontSize: '12px',
          color: savingsInsight.color,
          fontWeight: 500,
        }}>
          {savingsInsight.message}
        </span>
        {hourlyRate > 0 && (
          <span style={{ fontSize: '11px', color: '#b8af9e' }}>
            时薪 ¥{hourlyRate}/h
          </span>
        )}
        <span style={{
          fontSize: '11px',
          color: emergencyInsight.color,
        }}>
          应急储备: {emergencyMonths.toFixed(1)} 个月
        </span>
      </div>
    </div>
  );
}