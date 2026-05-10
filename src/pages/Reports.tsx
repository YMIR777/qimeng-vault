import { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer,
} from 'recharts';
import { useLedger } from '../store/useLedger';
import { FinancialSummary } from '../components/reports/FinancialSummary';
import { ReportNav } from '../components/reports/ReportNav';
import {
  calcNetWorthHistory,
  calcFreedomProgress,
  calcEmergencyFundMonths,
} from '../utils/financialHealth';
import {
  getFreedomProgressInsight,
  getEmergencyFundInsight,
} from '../utils/wisdomEngine';
import { WisdomTooltip } from '../components/ui/WisdomTooltip';

// ── Design Tokens (Cream Neumorphism) ──────────────────────────────
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

const CHART_COLORS = ['#6b9fcf', '#c9923a', '#7a9e7e', '#b8af9e', '#d4a843', '#a89f8e'];

// 生活投资类别
const LIFE_INVESTMENT_CATEGORIES = ['设备升级', '技能提升', '学习', '健身', '书籍', '课程', '培训', '教育', '投资自己', '软件', '硬件'];

function isLifeInvestment(category?: string): boolean {
  if (!category) return false;
  return LIFE_INVESTMENT_CATEGORIES.includes(category);
}

// ── 月份工具函数 ──────────────────────────────────────────────────
function getMonthOptions(): string[] {
  const now = new Date();
  const opts: string[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    opts.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return opts;
}

function getMonthLabel(monthStr: string): string {
  const [y, m] = monthStr.split('-');
  return `${y}年${parseInt(m)}月`;
}

function filterByMonth(transactions: any[], monthStr: string) {
  const [year, month] = monthStr.split('-').map(Number);
  const start = new Date(year, month - 1, 1).getTime();
  const end = new Date(year, month, 1).getTime();
  return transactions.filter(t => t.date >= start && t.date < end);
}

function calcMonthlyTrend(transactions: any[]) {
  const months: Record<string, { income: number; expense: number }> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months[key] = { income: 0, expense: 0 };
  }
  for (const tx of transactions) {
    const d = new Date(tx.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (months[key]) {
      if (tx.type === 'income') months[key].income += tx.amount;
      else months[key].expense += tx.amount;
    }
  }
  return Object.entries(months).map(([month, data]) => ({
    month: month.slice(5) + '月',
    income: data.income,
    expense: data.expense,
  }));
}

// ── 新增：日均支出趋势 ────────────────────────────────────────────
function calcDailyExpenseTrend(transactions: any[], monthStr: string) {
  const [year, month] = monthStr.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const start = new Date(year, month - 1, 1).getTime();
  const end = new Date(year, month, 1).getTime();
  const daily: Record<number, number> = {};
  for (let i = 1; i <= daysInMonth; i++) daily[i] = 0;
  for (const tx of transactions) {
    if (tx.type !== 'expense' || tx.date < start || tx.date >= end) continue;
    const d = new Date(tx.date);
    daily[d.getDate()] = (daily[d.getDate()] || 0) + tx.amount;
  }
  return Object.entries(daily).map(([day, amount]) => ({
    day: `${day}日`,
    amount,
  }));
}

// ── 新增：生活投资统计 ────────────────────────────────────────────
function calcLifeInvestmentStats(transactions: any[], monthStr: string) {
  const monthTx = filterByMonth(transactions, monthStr);
  const expenses = monthTx.filter((t: any) => t.type === 'expense');
  const totalExpense = expenses.reduce((s: number, t: any) => s + t.amount, 0);
  const lifeInvestment = expenses
    .filter((t: any) => isLifeInvestment(t.category))
    .reduce((s: number, t: any) => s + t.amount, 0);
  const regularExpense = totalExpense - lifeInvestment;
  return {
    totalExpense,
    lifeInvestment,
    regularExpense,
    ratio: totalExpense > 0 ? (lifeInvestment / totalExpense) * 100 : 0,
  };
}

function calcCategoryRanking(transactions: any[]) {
  const expenses = transactions.filter((t: any) => t.type === 'expense');
  const byCategory: Record<string, number> = {};
  for (const tx of expenses) {
    const cat = tx.category || '其他';
    byCategory[cat] = (byCategory[cat] || 0) + tx.amount;
  }
  return Object.entries(byCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

// ── 新增：收入渠道迷你列表 ────────────────────────────────────────
// ── 数字滚动组件 ───────────────────────────────────────────────────
function AnimatedNumber({ value, prefix = '', suffix = '', duration = 1.2, delay = 0 }: {
  value: number; prefix?: string; suffix?: string; duration?: number; delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: value,
      duration,
      delay,
      ease: 'power2.out',
      onUpdate: () => setDisplay(Math.round(obj.val)),
    });
  }, [value, duration, delay]);

  return <span ref={ref} className="font-mono">{prefix}{display.toLocaleString()}{suffix}</span>;
}

// ── 卡片组件 ───────────────────────────────────────────────────────
function Card({ children, style, className }: {
  children: React.ReactNode; style?: React.CSSProperties; className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        background: css.card,
        borderRadius: '18px',
        padding: '20px',
        boxShadow: css.shadowRaised,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── 自定义 Tooltip ─────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: css.card,
      borderRadius: '12px',
      padding: '10px 14px',
      boxShadow: css.shadowRaised,
      border: '1px solid rgba(163,158,148,0.2)',
      fontFamily: "'Noto Sans SC', sans-serif",
      fontSize: '12px',
      color: css.text,
    }}>
      <div style={{ fontWeight: 500, marginBottom: '4px', color: css.textMuted }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: p.color }} />
          <span className="font-mono" style={{ color: p.dataKey === 'income' ? css.accentBlue : p.dataKey === 'expense' || p.dataKey === 'amount' ? css.accentGold : css.text }}>
            {p.dataKey === 'income' ? '收入' : p.dataKey === 'expense' ? '支出' : p.dataKey === 'amount' ? '支出' : p.name}: ¥{p.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── 主页面 ─────────────────────────────────────────────────────────
export function Reports() {
  const { transactions } = useLedger();
  const pageRef = useRef<HTMLDivElement>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [activeSection, setActiveSection] = useState('summary');

  // 计算所有数据
  const monthlyData = useMemo(() => calcMonthlyTrend(transactions), [transactions]);
  const currentMonthTx = useMemo(() => filterByMonth(transactions, selectedMonth), [transactions, selectedMonth]);
  const categoryData = useMemo(() => calcCategoryRanking(currentMonthTx), [currentMonthTx]);
  // const platformMiniData = useMemo(() => calcPlatformMiniList(transactions, selectedMonth), [transactions, selectedMonth]);
  const dailyExpenseData = useMemo(() => calcDailyExpenseTrend(transactions, selectedMonth), [transactions, selectedMonth]);
  const lifeStats = useMemo(() => calcLifeInvestmentStats(transactions, selectedMonth), [transactions, selectedMonth]);

  const monthIncome = currentMonthTx.filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + t.amount, 0);
  const monthExpense = currentMonthTx.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + t.amount, 0);
  const monthNet = monthIncome - monthExpense;
  const savingsRate = monthIncome > 0 ? (monthNet / monthIncome) * 100 : 0;

  const totalIncome = transactions.filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + t.amount, 0);
  const totalExpense = transactions.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + t.amount, 0);

  // 滚动监听自动更新 active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['summary', 'trend', 'expense', 'income', 'health'];
      const scrollPos = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i]);
          return;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!pageRef.current) return;
    const sections = pageRef.current.querySelectorAll('.animate-in');
    gsap.fromTo(
      sections,
      { y: 36, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.65, stagger: 0.1, ease: 'back.out(1.7)', delay: 0.1 }
    );
  }, [selectedMonth]);

  const monthOptions = getMonthOptions();

  return (
    <div
      ref={pageRef}
      style={{
        padding: '40px 24px 100px',
        maxWidth: '720px',
        margin: '0 auto',
        minHeight: '100dvh',
        background: css.bg,
      }}
    >
      {/* Header — 左对齐标题 + 月份选择器 */}
      <div className="animate-in" style={{ marginBottom: '28px' }}>
        <div style={{
          fontFamily: "'Noto Serif SC', serif",
          fontSize: '11px',
          letterSpacing: '0.5em',
          color: css.textSecondary,
          textTransform: 'uppercase',
          marginBottom: '2px',
        }}>
          绮梦账间
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '16px',
        }}>
          <h1 style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '22px',
            fontWeight: 500,
            color: css.text,
            letterSpacing: '-0.01em',
            margin: 0,
          }}>
            财务报表
          </h1>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              padding: '8px 14px',
              background: css.card,
              border: 'none',
              borderRadius: '12px',
              boxShadow: css.shadowInset,
              color: css.text,
              fontFamily: "'Noto Sans SC', sans-serif",
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {monthOptions.map(m => (
              <option key={m} value={m}>{getMonthLabel(m)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sticky 导航 */}
      <ReportNav activeSection={activeSection} onNavigate={(id) => {
        setActiveSection(id);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }} />

      {/* 财务摘要卡片 */}
      <div id="summary" className="animate-in" style={{ marginBottom: '12px' }}>
        <FinancialSummary transactions={transactions} />
      </div>

      {/* Row 1: 月度收支趋势(2fr) + 资产构成(1fr) */}
      <div id="trend" className="animate-in" style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '12px',
        marginBottom: '12px',
      }}>
        {/* 月度收支趋势 */}
        <Card style={{ minHeight: '260px' }}>
          <div style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '13px',
            fontWeight: 500,
            color: css.text,
            marginBottom: '12px',
            letterSpacing: '0.05em',
          }}>
            月度收支趋势
            <WisdomTooltip wisdom="博多·舍费尔在《小狗钱钱》中说：记录你的支出，是理财的第一步。知道钱花在哪里，才能控制钱的流向。">
              <span style={{ marginLeft: '8px', fontSize: '11px', color: '#c9923a', cursor: 'help' }}>?</span>
            </WisdomTooltip>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={css.accentBlue} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={css.accentBlue} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={css.accentGold} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={css.accentGold} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(163,158,148,0.15)" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: css.textSecondary, fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: css.textSecondary, fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="income"
                stroke={css.accentBlue}
                strokeWidth={2}
                fill="url(#incomeGrad)"
                animationDuration={1200}
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke={css.accentGold}
                strokeWidth={2}
                fill="url(#expenseGrad)"
                animationDuration={1200}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* 资产构成（环形图） */}
        <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '260px' }}>
          <div style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '13px',
            fontWeight: 500,
            color: css.text,
            marginBottom: '8px',
            letterSpacing: '0.05em',
          }}>
            资产构成
            <WisdomTooltip wisdom="罗伯特·清崎说：资产是把钱放入你口袋的东西，负债是把钱从你口袋取走的东西。知道自己拥有什么，是理财的基础。">
              <span style={{ marginLeft: '8px', fontSize: '11px', color: '#c9923a', cursor: 'help' }}>?</span>
            </WisdomTooltip>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={[
                  { name: '累计收入', value: totalIncome },
                  { name: '累计支出', value: totalExpense },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
                animationDuration={1200}
              >
                <Cell fill={css.accentBlue} />
                <Cell fill={css.accentGold} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ textAlign: 'center', marginTop: '-8px' }}>
            <div className="font-mono" style={{
              fontSize: 'clamp(24px, 3vw, 32px)',
              color: css.text,
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}>
              <AnimatedNumber value={totalIncome - totalExpense} prefix="¥" />
            </div>
            <div style={{
              fontFamily: "'Noto Sans SC', sans-serif",
              fontSize: '10px',
              color: css.textSecondary,
              marginTop: '4px',
              letterSpacing: '0.1em',
            }}>
              净结余
            </div>
          </div>
        </Card>
      </div>

      {/* Row 2: 支出洞察(2fr) + 生活投资占比(1fr) */}
      <div id="expense" className="animate-in" style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '12px',
        marginBottom: '12px',
      }}>
        {/* 支出分类排行 - 增强版：含百分比与生活投资标记 */}
        <Card style={{ minHeight: '240px' }}>
          <div style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '13px',
            fontWeight: 500,
            color: css.text,
            marginBottom: '16px',
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span>支出洞察</span>
            <span style={{
              fontSize: '10px',
              color: css.accentGreen,
              background: 'rgba(122,158,126,0.12)',
              padding: '2px 8px',
              borderRadius: '10px',
              fontWeight: 400,
            }}>🌱 生活投资已标记</span>
            <WisdomTooltip wisdom="《金钱心理学》作者摩根·豪塞尔说：知道你的钱花在哪里，比知道你怎么花更重要。前者让你发现模式，后者让你分析行为。">
              <span style={{ fontSize: '11px', color: '#c9923a', cursor: 'help' }}>?</span>
            </WisdomTooltip>
          </div>
          {categoryData.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '32px 0',
              color: css.textSecondary,
              fontSize: '13px',
            }}>
              暂无支出记录
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {categoryData.map((item, i) => {
                const totalExp = monthExpense || 1;
                const pctOfTotal = (item.value / totalExp) * 100;
                const maxVal = categoryData[0]?.value || 1;
                const barPct = (item.value / maxVal) * 100;
                const isInvest = isLifeInvestment(item.name);
                const color = isInvest ? css.accentGreen : CHART_COLORS[i % CHART_COLORS.length];
                return (
                  <div key={item.name}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px',
                    }}>
                      <span style={{
                        fontFamily: "'Noto Sans SC', sans-serif",
                        fontSize: '12px',
                        color: css.text,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: color,
                          display: 'inline-block',
                        }} />
                        {item.name}
                        {isInvest && (
                          <span style={{
                            fontSize: '9px',
                            color: css.accentGreen,
                            background: 'rgba(122,158,126,0.12)',
                            padding: '1px 6px',
                            borderRadius: '8px',
                            fontWeight: 400,
                          }}>生活投资</span>
                        )}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="font-mono" style={{
                          fontSize: '11px',
                          color: css.textMuted,
                        }}>
                          {pctOfTotal.toFixed(1)}%
                        </span>
                        <span className="font-mono" style={{
                          fontSize: '13px',
                          color,
                        }}>
                          ¥{item.value.toLocaleString()}
                        </span>
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '6px',
                      background: 'rgba(163,158,148,0.12)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${barPct}%`,
                        height: '100%',
                        background: color,
                        borderRadius: '3px',
                        transition: `width 0.8s ${css.spring}`,
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* 生活投资占比 */}
        <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '240px' }}>
          <div style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '13px',
            fontWeight: 500,
            color: css.text,
            marginBottom: '8px',
            letterSpacing: '0.05em',
          }}>
            生活投资占比
            <WisdomTooltip wisdom="投资自己是回报率最高的事情。设备升级、技能提升、书籍课程——这些支出会在未来产生复利。">
              <span style={{ marginLeft: '8px', fontSize: '11px', color: '#c9923a', cursor: 'help' }}>?</span>
            </WisdomTooltip>
          </div>
          {lifeStats.totalExpense === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '32px 0',
              color: css.textSecondary,
              fontSize: '13px',
            }}>
              暂无支出记录
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={[
                      { name: '生活投资', value: lifeStats.lifeInvestment },
                      { name: '普通消费', value: lifeStats.regularExpense },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={4}
                    dataKey="value"
                    animationDuration={1200}
                  >
                    <Cell fill={css.accentGreen} />
                    <Cell fill={css.accentGold} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="font-mono" style={{
                fontSize: '22px',
                color: css.accentGreen,
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}>
                {lifeStats.ratio.toFixed(1)}%
              </div>
              <div style={{
                fontFamily: "'Noto Sans SC', sans-serif",
                fontSize: '10px',
                color: css.textSecondary,
                marginTop: '4px',
                letterSpacing: '0.1em',
              }}>
                投资占比
              </div>
              <div style={{
                marginTop: '8px',
                fontSize: '10px',
                color: css.textMuted,
                textAlign: 'center',
                lineHeight: 1.4,
              }}>
                本月投资 ¥{lifeStats.lifeInvestment.toLocaleString()}
                <br />
                普通消费 ¥{lifeStats.regularExpense.toLocaleString()}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Row 2.5: 日均支出趋势(2fr) + 生活投资占比(1fr) */}
      <div className="animate-in" style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '12px',
        marginBottom: '12px',
      }}>
        <Card style={{ minHeight: '220px' }}>
          <div style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '13px',
            fontWeight: 500,
            color: css.text,
            marginBottom: '12px',
            letterSpacing: '0.05em',
          }}>
            日均支出趋势
          </div>
          {dailyExpenseData.every((d: any) => d.amount === 0) ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 0',
              color: css.textSecondary,
              fontSize: '13px',
            }}>
              暂无支出记录
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={dailyExpenseData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(163,158,148,0.15)" vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: css.textSecondary, fontSize: 10, fontFamily: "'Noto Sans SC', sans-serif" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: css.textSecondary, fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" radius={[3, 3, 0, 0]} fill={css.accentGold} animationDuration={1200} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '220px' }}>
          <div style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '13px',
            fontWeight: 500,
            color: css.text,
            marginBottom: '8px',
            letterSpacing: '0.05em',
          }}>
            生活投资占比
            <WisdomTooltip wisdom="投资自己是回报率最高的事情。设备升级、技能提升、书籍课程——这些支出会在未来产生复利。">
              <span style={{ marginLeft: '8px', fontSize: '11px', color: '#c9923a', cursor: 'help' }}>?</span>
            </WisdomTooltip>
          </div>
          {lifeStats.totalExpense === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '32px 0',
              color: css.textSecondary,
              fontSize: '13px',
            }}>
              暂无支出记录
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={[
                      { name: '生活投资', value: lifeStats.lifeInvestment },
                      { name: '普通消费', value: lifeStats.regularExpense },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={4}
                    dataKey="value"
                    animationDuration={1200}
                  >
                    <Cell fill={css.accentGreen} />
                    <Cell fill={css.accentGold} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="font-mono" style={{
                fontSize: '22px',
                color: css.accentGreen,
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}>
                {lifeStats.ratio.toFixed(1)}%
              </div>
              <div style={{
                fontFamily: "'Noto Sans SC', sans-serif",
                fontSize: '10px',
                color: css.textSecondary,
                marginTop: '4px',
                letterSpacing: '0.1em',
              }}>
                投资占比
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Row 3: 本月摘要 — 非对称 2fr 1fr 1fr 1fr */}
      <div id="income" className="animate-in">
        <Card style={{ padding: '24px' }}>
          <div style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '13px',
            fontWeight: 500,
            color: css.text,
            marginBottom: '20px',
            letterSpacing: '0.05em',
          }}>
            {getMonthLabel(selectedMonth)} 摘要
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: '12px',
          }}>
            {/* 总收入 — 大卡片 */}
            <div style={{
              background: css.card,
              borderRadius: '16px',
              padding: '20px',
              boxShadow: css.shadowInset,
              textAlign: 'center',
            }}>
              <div className="font-mono" style={{
                fontSize: 'clamp(28px, 5vw, 40px)',
                color: css.accentBlue,
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}>
                <AnimatedNumber value={monthIncome} prefix="¥" />
              </div>
              <div style={{
                fontFamily: "'Noto Sans SC', sans-serif",
                fontSize: '10px',
                color: css.textSecondary,
                marginTop: '8px',
                letterSpacing: '0.12em',
              }}>
                总收入
              </div>
            </div>

            {/* 总支出 */}
            <div style={{
              background: css.card,
              borderRadius: '16px',
              padding: '20px',
              boxShadow: css.shadowInset,
              textAlign: 'center',
            }}>
              <div className="font-mono" style={{
                fontSize: 'clamp(22px, 4vw, 32px)',
                color: css.accentGold,
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}>
                <AnimatedNumber value={monthExpense} prefix="¥" />
              </div>
              <div style={{
                fontFamily: "'Noto Sans SC', sans-serif",
                fontSize: '10px',
                color: css.textSecondary,
                marginTop: '8px',
                letterSpacing: '0.12em',
              }}>
                总支出
              </div>
            </div>

            {/* 净结余 */}
            <div style={{
              background: css.card,
              borderRadius: '16px',
              padding: '20px',
              boxShadow: css.shadowInset,
              textAlign: 'center',
            }}>
              <div className="font-mono" style={{
                fontSize: 'clamp(22px, 4vw, 32px)',
                color: css.text,
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}>
                <AnimatedNumber value={monthNet} prefix={monthNet >= 0 ? '¥' : '-¥'} />
              </div>
              <div style={{
                fontFamily: "'Noto Sans SC', sans-serif",
                fontSize: '10px',
                color: css.textSecondary,
                marginTop: '8px',
                letterSpacing: '0.12em',
              }}>
                净结余
              </div>
            </div>

            {/* 储蓄率 */}
            <div style={{
              background: css.card,
              borderRadius: '16px',
              padding: '20px',
              boxShadow: css.shadowInset,
              textAlign: 'center',
            }}>
              <div className="font-mono" style={{
                fontSize: 'clamp(22px, 4vw, 32px)',
                color: savingsRate >= 0 ? css.accentGreen : css.accentRed,
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}>
                <AnimatedNumber value={Math.abs(Math.round(savingsRate))} suffix="%" />
              </div>
              <div style={{
                fontFamily: "'Noto Sans SC', sans-serif",
                fontSize: '10px',
                color: css.textSecondary,
                marginTop: '8px',
                letterSpacing: '0.12em',
              }}>
                储蓄率
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 净资产增长曲线 */}
      {(() => {
        const netWorthHistory = useMemo(() => calcNetWorthHistory(transactions), [transactions]);
        if (netWorthHistory.length === 0) return null;
        return (
          <div className="animate-in" style={{ marginBottom: '12px' }}>
            <Card>
              <div style={{
                fontFamily: "'Noto Sans SC', sans-serif",
                fontSize: '13px',
                fontWeight: 500,
                marginBottom: '12px',
                letterSpacing: '0.05em',
              }}>
                净资产增长
                <WisdomTooltip wisdom="清崎把人分为两类：买了资产的人，和买了负债的人。净资产 = 你拥有的资产 - 欠下的债。它是你真正拥有的财富。">
                  <span style={{ marginLeft: '8px', fontSize: '11px', color: '#c9923a', cursor: 'help' }}>?</span>
                </WisdomTooltip>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={netWorthHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7a9e7e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#7a9e7e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(163,158,148,0.15)" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: css.textSecondary, fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: css.textSecondary, fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="netWorth" stroke="#7a9e7e" strokeWidth={2} fill="url(#netWorthGrad)" animationDuration={1200} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </div>
        );
      })()}

      {/* 财务健康度卡片组 */}
      {(() => {
        const emergencyMonths = useMemo(() => calcEmergencyFundMonths(transactions), [transactions]);
        const freedomProgress = useMemo(() => calcFreedomProgress(transactions, 6), [transactions]);
        const freedomInsight = useMemo(() => getFreedomProgressInsight(freedomProgress), [freedomProgress]);
        const emergencyInsight = useMemo(() => getEmergencyFundInsight(emergencyMonths), [emergencyMonths]);
        return (
          <div id="health" className="animate-in" style={{ marginBottom: '12px' }}>
            <div style={{
              fontFamily: "'Noto Sans SC', sans-serif",
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '12px',
              letterSpacing: '0.05em',
            }}>
              财务健康度
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* 财富自由进度 */}
              <Card style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: css.textMuted, marginBottom: '8px' }}>财富自由进度</div>
                <div className="font-mono" style={{
                  fontSize: '28px',
                  color: freedomInsight.color,
                }}>
                  {Math.round(freedomProgress)}%
                </div>
                <div style={{ marginTop: '8px', height: '6px', borderRadius: '3px', background: 'rgba(163,158,148,0.15)' }}>
                  <div style={{
                    height: '100%',
                    borderRadius: '3px',
                    background: 'linear-gradient(90deg, #6b9fcf, #7a9e7e)',
                    width: `${Math.min(freedomProgress, 100)}%`,
                    transition: 'width 1s ease-out',
                  }} />
                </div>
                <div style={{ fontSize: '11px', color: freedomInsight.color, marginTop: '8px' }}>
                  {freedomInsight.message}
                </div>
              </Card>

              {/* 应急资金 */}
              <Card style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: css.textMuted, marginBottom: '8px' }}>
                  应急储备
                  <WisdomTooltip wisdom="摩根·豪塞尔在《金钱心理学》中说：容错空间（Margin of Safety）是最被低估的财务指标。它保护你不被生活击倒。建议储备至少 3-6 个月的生活费。">
                    <span style={{ marginLeft: '4px', color: '#c9923a', cursor: 'help' }}>?</span>
                  </WisdomTooltip>
                </div>
                <div className="font-mono" style={{
                  fontSize: '28px',
                  color: emergencyInsight.color,
                }}>
                  {emergencyMonths.toFixed(1)}<span style={{ fontSize: '14px' }}>个月</span>
                </div>
                <div style={{ fontSize: '11px', color: css.textSecondary, marginTop: '8px' }}>目标: 6个月</div>
                <div style={{ fontSize: '11px', color: emergencyInsight.color, marginTop: '4px' }}>
                  {emergencyInsight.message}
                </div>
              </Card>
            </div>
          </div>
        );
      })()}

      {/* 底部装饰线 */}
      <div className="animate-in" style={{
        marginTop: '32px',
        textAlign: 'center',
      }}>
        <div style={{
          width: '40px',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #c9923a, transparent)',
          margin: '0 auto',
          borderRadius: '1px',
          opacity: 0.5,
        }} />
      </div>
    </div>
  );
}
