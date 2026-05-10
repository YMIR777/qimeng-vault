import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useLedger } from '../store/useLedger';
import { useAccounts } from '../store/useAccounts';
import { useWishes } from '../store/useWishes';
import { useBudgets } from '../store/useBudgets';
import type { ParseResult } from '../components/magic/parseInput';
import { MagicInput } from '../components/magic/MagicInput';
import { ExpenseDecision } from '../components/magic/ExpenseDecision';
import { SupplementForm } from '../components/magic/SupplementForm';
import { WishPicker } from '../components/wishes/WishPicker';
import { useToast } from '../components/ui/Toast';
import { db } from '../store/db';
import type { MagicInputRef } from '../components/magic/MagicInput';

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// ── BudgetProgress — 预算进度（接收 transactions prop）────────────────
function BudgetProgress({ transactions }: { transactions: any[] }) {
  const { budgets } = useBudgets();

  // 同步计算 — 直接从传入的 transactions 过滤
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();

  const items = budgets.map((budget: any) => {
    const used = transactions
      .filter((t: any) => t.type === 'expense' && t.date >= start && t.date < end && t.category === budget.category)
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    return {
      budget,
      used,
      pct: Math.min((used / budget.amount) * 100, 100),
    };
  });

  if (items.length === 0) return null;

  return (
    <div className="animate-in" style={{ marginBottom: '24px' }}>
      <div style={{
        fontFamily: "'Noto Sans SC', sans-serif",
        fontSize: '12px',
        fontWeight: 500,
        color: '#a89f8e',
        letterSpacing: '0.08em',
        marginBottom: '10px',
      }}>本月预算</div>
      <div style={{ display: 'grid', gap: '10px' }}>
        {items.map(({ budget, used, pct }) => (
          <div key={budget.id} style={{
            background: '#f0ebe0',
            borderRadius: '14px',
            padding: '14px 16px',
            boxShadow: '3px 3px 8px #cdc5b8, -3px -3px 8px #fffbf5',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#3d3427', fontFamily: "'Noto Sans SC', sans-serif" }}>
                {budget.category}
              </span>
              <span style={{ fontSize: '13px', color: pct > 80 ? '#d4a0a0' : '#7a9e7e', fontFamily: "'Noto Serif SC', serif" }}>
                ¥{used.toLocaleString()} / ¥{budget.amount.toLocaleString()}
              </span>
            </div>
            <div style={{
              height: '6px',
              borderRadius: '3px',
              background: 'rgba(163,158,148,0.15)',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${pct}%`,
                borderRadius: '3px',
                background: pct > 80 ? '#d4a0a0' : pct > 50 ? '#c9923a' : '#7a9e7e',
                transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }} />
            </div>
            {pct > 80 && (
              <div style={{ fontSize: '11px', color: '#d4a0a0', marginTop: '6px' }}>
                预算即将用完，剩余 ¥{(budget.amount - used).toLocaleString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── AccountOverview — 账户总览 ─────────────────────────────────────
function AccountOverview() {
  const { accounts } = useAccounts();

  if (accounts.length === 0) return null;

  return (
    <div className="animate-in" style={{ marginBottom: '24px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px',
      }}>
        <div style={{
          fontFamily: "'Noto Sans SC', sans-serif",
          fontSize: '12px',
          fontWeight: 500,
          color: '#a89f8e',
          letterSpacing: '0.08em',
        }}>账户总览</div>
        <Link to="/settings" style={{
          fontSize: '11px',
          color: '#b8af9e',
          textDecoration: 'none',
          letterSpacing: '0.05em',
        }}>管理 →</Link>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '8px',
      }}>
        {accounts.map((account) => (
          <div key={account.id} style={{
            background: '#f0ebe0',
            borderRadius: '14px',
            padding: '14px 12px',
            boxShadow: '3px 3px 8px #cdc5b8, -3px -3px 8px #fffbf5',
            textAlign: 'center',
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: account.color,
              margin: '0 auto 6px',
            }} />
            <div style={{
              fontFamily: "'Noto Serif SC', serif",
              fontSize: '16px',
              color: '#3d3427',
              letterSpacing: '-0.01em',
            }}>¥{account.balance.toLocaleString()}</div>
            <div style={{
              fontFamily: "'Noto Sans SC', sans-serif",
              fontSize: '10px',
              color: '#a89f8e',
              marginTop: '2px',
            }}>{account.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Dashboard() {
  const { transactions, totalAsset, addTransaction, updateTransaction } = useLedger();
  const { wishes, depositToWish } = useWishes();
  const { accounts } = useAccounts();
  const { budgets: _budgets } = useBudgets();
  const { showToast } = useToast();
  const pageRef = useRef<HTMLDivElement>(null);
  const magicInputRef = useRef<MagicInputRef>(null);

  useEffect(() => {
    if (!pageRef.current) return;
    const sections = pageRef.current.querySelectorAll('.animate-in');
    gsap.fromTo(sections, { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, stagger: 0.1, ease: 'power2.out', delay: 0.1 });
    const items = pageRef.current.querySelectorAll('.tx-item');
    gsap.fromTo(items, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out', delay: 0.5 });
  }, [transactions.length]);

  const [displayNumber, setDisplayNumber] = useState(0);
  const [showDecision, setShowDecision] = useState(false);
  const [pendingExpense, setPendingExpense] = useState<ParseResult | null>(null);
  const [showSupplement, setShowSupplement] = useState(false);
  const [pendingIncomplete, setPendingIncomplete] = useState<ParseResult | null>(null);
  const [showWishPicker, setShowWishPicker] = useState(false);
  const [wishPickerAmount, setWishPickerAmount] = useState(0);
  const [lastTxId, setLastTxId] = useState<string | null>(null);
  const [lastAccountId, setLastAccountId] = useState<string | null>(null);

  useEffect(() => {
    let start: number | null = null;
    const duration = 1400;
    const startValue = displayNumber || 0;

    function tick(now: number) {
      if (!start) start = now;
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayNumber(startValue + (totalAsset - startValue) * easeOut(progress));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [totalAsset]);

  async function handleInputSubmit(result: ParseResult) {
    if (!result.complete) {
      setPendingIncomplete(result);
      setShowSupplement(true);
      return;
    }
    if (result.type === 'income') {
      // 所有收入都可以存入许愿瓶
      if (wishes.length > 0) {
        const txId = await addTransaction({
          type: 'income',
          amount: result.amount,
          platform: result.platform || '未知',
          bossName: result.bossName,
          timeSpent: result.timeSpent,
          note: result.note || '',
          date: Date.now(),
          accountId: result.accountId,
        });
        setLastTxId(txId);
        setLastAccountId(result.accountId || null);
        setWishPickerAmount(result.amount);
        setShowWishPicker(true);
      } else {
        await addTransaction({
          type: 'income',
          amount: result.amount,
          platform: result.platform || '未知',
          bossName: result.bossName,
          timeSpent: result.timeSpent,
          note: result.note || '',
          date: Date.now(),
          accountId: result.accountId,
        });
        showToast(`+${result.amount} 元（${result.platform} 收入）`, 'success');
      }
      return;
    }
    if (result.type === 'expense') {
      // 所有支出强制走 SupplementForm，确保选择账户
      setPendingIncomplete(result);
      setShowSupplement(true);
      return;
    }
  }

  async function handleExpenseConfirm(judgment: 'worthy' | 'unworthy') {
    if (!pendingExpense) return;
    setShowDecision(false);
    if (!pendingExpense.complete) {
      setPendingIncomplete({ ...pendingExpense, judgment });
      setShowSupplement(true);
    } else {
      await addTransaction({
        type: 'expense',
        amount: pendingExpense.amount,
        category: pendingExpense.category || '其他',
        platform: pendingExpense.platform,
        bossName: pendingExpense.bossName,
        judgment,
        timeSpent: pendingExpense.timeSpent,
        note: pendingExpense.note,
        date: Date.now(),
        accountId: pendingExpense.accountId,
      });
      showToast(`${pendingExpense.amount} 元（支出）· ${judgment === 'worthy' ? '值得' : '不值'}`, 'success');
      setPendingExpense(null);
    }
  }

  async function handleSupplementConfirm(result: ParseResult & { accountId?: string }) {
    setShowSupplement(false);
    if (!pendingIncomplete && !pendingExpense) return;

    // 支出类型：保存完整结果后弹出值得/不值得判断
    if (result.type === 'expense') {
      setPendingExpense(result);
      setShowDecision(true);
      return;
    }

    // income 类型：直接记录
    const judgment = pendingIncomplete?.judgment;
    const txId = await addTransaction({
      type: result.type!,
      amount: result.amount,
      category: result.category || '其他',
      platform: result.platform,
      bossName: result.bossName,
      judgment,
      timeSpent: result.timeSpent,
      note: result.note,
      accountId: result.accountId,
      date: Date.now(),
    });
    const typeLabel = result.type === 'income' ? '收入' : '支出';
    // 所有收入都可以存入许愿瓶
    if (result.type === 'income' && wishes.length > 0) {
      setLastTxId(txId);
      setLastAccountId(result.accountId || null);
      setWishPickerAmount(result.amount);
      setShowWishPicker(true);
      return;
    }
    const judgmentLabel = judgment ? (judgment === 'worthy' ? '· 值得' : '· 不值') : '';
    showToast(`${result.amount} 元（${typeLabel}）${judgmentLabel}`, 'success');
    setPendingExpense(null);
    setPendingIncomplete(null);
  }

  const recentTx = [...transactions]
    .sort((a, b) => b.date - a.date)
    .slice(0, 10);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTx = transactions.filter(t => t.date >= today.getTime());
  const todayIncome = todayTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const todayExpense = todayTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  // ── 洞察卡片数据 ──────────────────────────────────────
  const todayWorkMinutes = todayTx
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.timeSpent || 0), 0);
  const todayWorkHours = (todayWorkMinutes / 60).toFixed(1);

  const weekStart = new Date();
  const dayOfWeek = weekStart.getDay();
  const diff = weekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  weekStart.setDate(diff);
  weekStart.setHours(0, 0, 0, 0);
  const weekIncome = transactions
    .filter(t => t.type === 'income' && t.date >= weekStart.getTime())
    .reduce((sum, t) => sum + t.amount, 0);
  const weekGoal = 2000;
  const weekProgress = Math.min((weekIncome / weekGoal) * 100, 100);

  const latestWish = [...wishes]
    .filter(w => w.status === 'building')
    .sort((a, b) => b.createdAt - a.createdAt)[0];

  // Format number with thousands separator and decimal
  const formattedNumber = displayNumber.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Split integer and decimal parts
  const [integerPart, decimalPart] = formattedNumber.split('.');

  return (
    <div ref={pageRef} style={{
      padding: '48px 28px 100px',
      maxWidth: '560px',
      margin: '0 auto',
      minHeight: '100dvh',
    }}>
      {/* Header Section */}
      <div className="animate-in" style={{ marginBottom: '8px', textAlign: 'center' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2px',
        }}>
          <div style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: '11px',
            letterSpacing: '0.5em',
            color: '#b8af9e',
            textTransform: 'uppercase',
            marginBottom: '2px',
            flex: 1,
            textAlign: 'center',
          }}>绮梦账间</div>
          <Link to="/settings" style={{
            position: 'absolute',
            right: '28px',
            top: '48px',
            textDecoration: 'none',
            color: '#b8af9e',
            transition: 'color 0.2s ease',
            padding: '8px',
          }} onMouseEnter={e => (e.currentTarget.style.color = '#a89f8e')}
          onMouseLeave={e => (e.currentTarget.style.color = '#b8af9e')}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="10" cy="10" r="2"/>
              <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M4.93 15.07l1.41-1.41M13.66 6.34l1.41-1.41"/>
            </svg>
          </Link>
        </div>
        <div style={{
          fontFamily: "'Noto Sans SC', sans-serif",
          fontSize: '9px',
          letterSpacing: '0.35em',
          color: '#c5bdb0',
          textTransform: 'uppercase',
        }}>Your Private Vault</div>
      </div>

      {/* Asset Display — 重新设计 */}
      <div className="animate-in" style={{
        textAlign: 'center',
        marginBottom: '44px',
        padding: '32px 20px 28px',
        background: '#f0ebe0',
        borderRadius: '28px',
        boxShadow: '8px 8px 20px #cdc5b8, -8px -8px 20px #fffbf5',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative corner lines */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          width: '24px',
          height: '24px',
          borderTop: '1.5px solid rgba(201,146,58,0.2)',
          borderLeft: '1.5px solid rgba(201,146,58,0.2)',
          borderRadius: '2px 0 0 0',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          width: '24px',
          height: '24px',
          borderBottom: '1.5px solid rgba(201,146,58,0.2)',
          borderRight: '1.5px solid rgba(201,146,58,0.2)',
          borderRadius: '0 0 2px 0',
        }} />

        {/* Label above */}
        <div style={{
          fontFamily: "'Noto Sans SC', sans-serif",
          fontSize: '9px',
          letterSpacing: '0.4em',
          color: '#b8af9e',
          textTransform: 'uppercase',
          marginBottom: '12px',
        }}>
          总资产
        </div>

        {/* Number — large typography */}
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'center',
          gap: '4px',
          marginBottom: '6px',
        }}>
          {/* ¥ symbol — smaller, offset left */}
          <span style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: 'clamp(28px, 6vw, 38px)',
            fontWeight: 400,
            color: '#a89f8e',
            letterSpacing: '-0.02em',
            lineHeight: 1,
            marginRight: '2px',
            alignSelf: 'flex-start',
            marginTop: '8px',
          }}>¥</span>

          {/* Integer part — huge display */}
          <span style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: 'clamp(54px, 14vw, 96px)',
            fontWeight: 400,
            color: '#3d3427',
            letterSpacing: '-0.04em',
            lineHeight: 0.9,
            textShadow: '2px 2px 0 rgba(163,158,148,0.3)',
          }}>
            {integerPart}
          </span>

          {/* Decimal — smaller superscript */}
          <span style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: 'clamp(22px, 5vw, 32px)',
            fontWeight: 400,
            color: '#7a6d5a',
            letterSpacing: '-0.02em',
            lineHeight: 1,
            alignSelf: 'flex-end',
            marginBottom: '6px',
          }}>
            .{decimalPart}
          </span>
        </div>

        {/* Decorative bottom line */}
        <div style={{
          width: '40px',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #c9923a, transparent)',
          margin: '14px auto 0',
          borderRadius: '1px',
        }} />
      </div>

      {/* Magic Input */}
      <div className="animate-in" style={{ marginBottom: '36px', padding: '0 8px' }}>
        <MagicInput ref={magicInputRef} onSubmit={handleInputSubmit} />
        <p style={{
          textAlign: 'center',
          marginTop: '10px',
          fontSize: '10px',
          letterSpacing: '0.12em',
          color: '#b8af9e',
        }}>
          像写日记一样记录 · 按 Enter 提交 · Shift+Enter 换行
        </p>
      </div>

      {/* Account Overview */}
      <AccountOverview />

      {/* Insights — 洞察卡片 */}
      <div className="animate-in" style={{ marginBottom: '32px' }}>
        {/* Row 1: 今日工作激励 + 许愿瓶 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '10px',
          marginBottom: '10px',
          alignItems: 'stretch',
        }}>
          {/* 今日工作激励 */}
          <div style={{
            background: '#f0ebe0',
            borderRadius: '18px',
            padding: '20px 18px',
            boxShadow: '5px 5px 12px #cdc5b8, -5px -5px 12px #fffbf5',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: '110px',
          }}>
            <div style={{
              fontFamily: "'Noto Sans SC', sans-serif",
              fontSize: '10px',
              letterSpacing: '0.14em',
              color: '#a89f8e',
              marginBottom: '10px',
            }}>
              今日已工作 {todayWorkHours} 小时，赚了 <span style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, 'Cascadia Code', monospace",
                fontSize: '13px',
                color: '#6b9fcf',
                fontWeight: 500,
              }}>{todayIncome.toFixed(0)}</span> 元
            </div>
            <div style={{
              fontFamily: "'Noto Sans SC', sans-serif",
              fontSize: '9px',
              letterSpacing: '0.1em',
              color: '#b8af9e',
              marginBottom: '8px',
            }}>
              本周目标
            </div>
            <div style={{
              height: '6px',
              borderRadius: '3px',
              background: 'rgba(163,158,148,0.15)',
              overflow: 'hidden',
              marginBottom: '6px',
            }}>
              <div style={{
                height: '100%',
                width: `${weekProgress}%`,
                borderRadius: '3px',
                background: '#7a9e7e',
                transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }} />
            </div>
            <div style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, 'Cascadia Code', monospace",
              fontSize: '10px',
              color: '#7a9e7e',
            }}>
              {weekIncome.toFixed(0)} / {weekGoal}
            </div>
          </div>

          {/* 许愿瓶快速查看 */}
          <Link to="/wishes" style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#f0ebe0',
              borderRadius: '18px',
              padding: '18px 14px',
              boxShadow: '5px 5px 12px #cdc5b8, -5px -5px 12px #fffbf5',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: '110px',
              height: '100%',
              cursor: 'pointer',
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '6px 6px 16px #c5bdb0, -6px -6px 16px #fffbf5';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '5px 5px 12px #cdc5b8, -5px -5px 12px #fffbf5';
            }}
            >
              <div style={{
                fontFamily: "'Noto Sans SC', sans-serif",
                fontSize: '9px',
                letterSpacing: '0.12em',
                color: '#b8af9e',
                marginBottom: '8px',
              }}>
                许愿瓶
              </div>
              {latestWish ? (
                <>
                  <div style={{
                    fontFamily: "'Noto Sans SC', sans-serif",
                    fontSize: '13px',
                    color: '#3d3427',
                    marginBottom: '8px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {latestWish.name}
                  </div>
                  <div style={{
                    height: '4px',
                    borderRadius: '2px',
                    background: 'rgba(163,158,148,0.15)',
                    overflow: 'hidden',
                    marginBottom: '6px',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min((latestWish.currentBalance / latestWish.targetPrice) * 100, 100)}%`,
                      borderRadius: '2px',
                      background: '#c9923a',
                      transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }} />
                  </div>
                  <div style={{
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, 'Cascadia Code', monospace",
                    fontSize: '10px',
                    color: '#a89f8e',
                  }}>
                    {latestWish.currentBalance.toFixed(0)} / {latestWish.targetPrice.toFixed(0)}
                  </div>
                </>
              ) : (
                <div style={{
                  fontSize: '11px',
                  color: '#b8af9e',
                }}>
                  暂无进行中的许愿瓶
                </div>
              )}
            </div>
          </Link>
        </div>

        {/* 快速记账入口 */}
        <button
          onClick={() => magicInputRef.current?.focus()}
          style={{
            width: '100%',
            padding: '16px 20px',
            background: '#f0ebe0',
            border: 'none',
            borderRadius: '18px',
            boxShadow: '5px 5px 12px #cdc5b8, -5px -5px 12px #fffbf5',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '14px',
            color: '#3d3427',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '6px 6px 16px #c5bdb0, -6px -6px 16px #fffbf5';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '5px 5px 12px #cdc5b8, -5px -5px 12px #fffbf5';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7a9e7e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>快速记账</span>
        </button>
      </div>

      {/* Budget Progress */}
      <BudgetProgress transactions={transactions} />

      {/* Quick Stats — Asymmetric Bento Grid */}
      <div className="animate-in" style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr',
        gap: '10px',
        marginBottom: '32px',
        alignItems: 'stretch',
      }}>
        {/* 今日收入 — wider, taller */}
        <div style={{
          background: '#f0ebe0',
          borderRadius: '18px',
          padding: '20px 16px 18px',
          textAlign: 'center',
          boxShadow: '5px 5px 12px #cdc5b8, -5px -5px 12px #fffbf5',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: '90px',
        }}>
          <div style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: '24px',
            color: '#6b9fcf',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}>
            +{todayIncome.toFixed(0)}
          </div>
          <div style={{
            fontSize: '9px',
            color: '#b8af9e',
            marginTop: '8px',
            letterSpacing: '0.14em',
          }}>今日收入</div>
        </div>
        {/* 今日支出 */}
        <div style={{
          background: '#f0ebe0',
          borderRadius: '18px',
          padding: '18px 12px',
          textAlign: 'center',
          boxShadow: '5px 5px 12px #cdc5b8, -5px -5px 12px #fffbf5',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <div style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: '20px',
            color: '#c9923a',
            letterSpacing: '-0.02em',
          }}>
            -{todayExpense.toFixed(0)}
          </div>
          <div style={{
            fontSize: '9px',
            color: '#b8af9e',
            marginTop: '6px',
            letterSpacing: '0.12em',
          }}>今日支出</div>
        </div>
        {/* 总记录 */}
        <div style={{
          background: '#f0ebe0',
          borderRadius: '18px',
          padding: '18px 12px',
          textAlign: 'center',
          boxShadow: '5px 5px 12px #cdc5b8, -5px -5px 12px #fffbf5',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <div style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: '20px',
            color: '#3d3427',
            letterSpacing: '-0.02em',
          }}>
            {transactions.length}
          </div>
          <div style={{
            fontSize: '9px',
            color: '#b8af9e',
            marginTop: '6px',
            letterSpacing: '0.12em',
          }}>总记录</div>
        </div>
      </div>

      {/* Recent Transactions — 固定高度容器 + 内部滚动 */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '14px',
          paddingLeft: '4px',
        }}>
          <h3 style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '10px',
            letterSpacing: '0.22em',
            color: '#b8af9e',
            textTransform: 'uppercase',
          }}>
            最近记录
          </h3>
          <a href="/records" style={{
            fontSize: '10px',
            color: '#a89f8e',
            textDecoration: 'none',
            letterSpacing: '0.08em',
          }}>查看全部 →</a>
        </div>
        {recentTx.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '36px 24px',
            color: '#c5bdb0',
            background: '#f0ebe0',
            borderRadius: '16px',
            boxShadow: 'inset 4px 4px 8px #cdc5b8, inset -4px -4px 8px #fffbf5',
          }}>
            <div style={{ fontSize: '14px', marginBottom: '6px', color: '#a89f8e' }}>暂无记账记录</div>
            <div style={{ fontSize: '12px', color: '#c5bdb0' }}>尝试输入「比心 150」或「打车 30」</div>
          </div>
        ) : (
          <div style={{
            maxHeight: '320px',
            overflowY: 'auto',
            padding: '4px 2px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            {recentTx.map(tx => (
              <div key={tx.id} className="tx-item" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                background: '#f0ebe0',
                borderRadius: '14px',
                boxShadow: 'inset 3px 3px 6px #cdc5b8, inset -3px -3px 6px #fffbf5',
                flexShrink: 0,
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, overflow: 'hidden' }}>
                  <span style={{
                    fontFamily: "'Noto Sans SC', sans-serif",
                    fontSize: '13px',
                    color: '#3d3427',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {tx.note || tx.platform || tx.category || '未分类'}
                  </span>
                  <span style={{ fontSize: '10px', color: '#a89f8e', display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span>{new Date(tx.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}</span>
                    {tx.category && <span style={{ padding: '1px 6px', background: '#e8e1d5', borderRadius: '4px', fontSize: '9px' }}>{tx.category}</span>}
                    {tx.platform && <span style={{ padding: '1px 6px', background: '#e8e1d5', borderRadius: '4px', fontSize: '9px' }}>{tx.platform}</span>}
                    {tx.bossName ? <span>· {tx.bossName}</span> : ''}
                  </span>
                </div>
                <div style={{
                  fontFamily: "'Noto Serif SC', serif",
                  fontSize: '16px',
                  color: tx.type === 'income' ? '#6b9fcf' : '#c9923a',
                  letterSpacing: '-0.01em',
                }}>
                  {tx.type === 'income' ? '+' : '-'}{tx.amount}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDecision && pendingExpense && (
        <ExpenseDecision
          amount={pendingExpense.amount}
          category={pendingExpense.category || '其他'}
          onConfirm={handleExpenseConfirm}
          onCancel={() => { setShowDecision(false); setPendingExpense(null); }}
        />
      )}

      {showSupplement && pendingIncomplete && (
        <SupplementForm
          initial={pendingIncomplete}
          accounts={accounts.map(a => ({ id: a.id, name: a.name, color: a.color }))}
          onConfirm={handleSupplementConfirm}
          onCancel={() => { setShowSupplement(false); setPendingIncomplete(null); setPendingExpense(null); }}
        />
      )}

      {showWishPicker && (
        <WishPicker
          amount={wishPickerAmount}
          wishes={wishes}
          onDeposit={async (wishId: string, amount: number) => {
            if (lastAccountId) {
              // 存入许愿瓶 = 从关联账户扣钱
              const acc = await db.accounts.get(lastAccountId);
              if (acc && acc.balance >= amount) {
                await db.accounts.update(lastAccountId, { balance: acc.balance - amount });
              }
            }
            await depositToWish(wishId, amount);
            if (lastTxId) {
              await updateTransaction(lastTxId, { wishId });
            }
            showToast(`+${amount} 元存入星体`, 'success');
            setShowWishPicker(false);
            setLastTxId(null);
            setLastAccountId(null);
          }}
          onClose={() => {
            setShowWishPicker(false);
            setLastTxId(null);
            setLastAccountId(null);
          }}
        />
      )}
      {/* 危险区域：数据管理 */}
      <div style={{ marginTop: '48px', paddingTop: '20px', borderTop: '1px solid #e0dbd3' }}>
        <div style={{ fontSize: '11px', color: '#b8af9e', letterSpacing: '0.1em', marginBottom: '12px' }}>
          数据管理
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
          {/* 导出 */}
          <button
            onClick={async () => {
              const txs = await db.transactions.toArray();
              const wishes = await db.wishes.toArray();
              const data = { version: 1, exportedAt: Date.now(), transactions: txs, wishes };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `绮梦账间备份_${new Date().toISOString().slice(0,10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
              showToast('备份已下载', 'success');
            }}
            style={{
              flex: 1, padding: '12px',
              background: '#f0ebe0', border: 'none', borderRadius: '10px',
              boxShadow: '3px 3px 6px #cdc5b8, -3px -3px 6px #fffbf5',
              color: '#3d3427', fontFamily: "'Noto Sans SC', sans-serif",
              fontSize: '13px', cursor: 'pointer',
            }}
          >
            导出备份
          </button>

          {/* 导入 */}
          <button
            onClick={() => document.getElementById('import-file')?.click()}
            style={{
              flex: 1, padding: '12px',
              background: '#f0ebe0', border: 'none', borderRadius: '10px',
              boxShadow: '3px 3px 6px #cdc5b8, -3px -3px 6px #fffbf5',
              color: '#3d3427', fontFamily: "'Noto Sans SC', sans-serif",
              fontSize: '13px', cursor: 'pointer',
            }}
          >
            导入恢复
          </button>
          <input
            id="import-file"
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const text = await file.text();
                const data = JSON.parse(text);
                if (!data.transactions || !data.wishes) {
                  showToast('文件格式不对', 'error');
                  return;
                }
                if (!window.confirm(`导入将覆盖现有数据（${data.transactions.length} 条记录 + ${data.wishes.length} 个星体），确定吗？`)) return;
                await db.transactions.clear();
                await db.wishes.clear();
                await db.transactions.bulkAdd(data.transactions);
                await db.wishes.bulkAdd(data.wishes);
                window.location.reload();
              } catch (err) {
                showToast('导入失败：' + (err as Error).message, 'error');
              }
              e.target.value = '';
            }}
          />
        </div>

        {/* 清除 */}
        <button
          onClick={async () => {
            if (!window.confirm('⚠️ 确定要清除所有数据吗？\n\n这将删除所有记账记录、星体、账户和预算，不可恢复。')) return;
            await db.transactions.clear();
            await db.wishes.clear();
            await db.accounts.clear();
            await db.budgets.clear();
            window.location.reload();
          }}
          style={{
            width: '100%', padding: '12px',
            background: 'transparent', border: '1px solid #d4a0a0',
            borderRadius: '10px', color: '#c07070',
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '13px', cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(192,112,112,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          清除所有数据
        </button>
      </div>

    </div>
  );
}