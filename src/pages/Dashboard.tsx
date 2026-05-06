import { useState, useEffect } from 'react';
import { useLedger } from '../store/useLedger';
import type { ParseResult } from '../components/magic/parseInput';
import { MagicInput } from '../components/magic/MagicInput';
import { ExpenseDecision } from '../components/magic/ExpenseDecision';
import { SupplementForm } from '../components/magic/SupplementForm';
import { useToast } from '../components/ui/Toast';

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function Dashboard() {
  const { transactions, totalAsset, addTransaction } = useLedger();
  const { showToast } = useToast();
  const [displayNumber, setDisplayNumber] = useState(0);
  const [showDecision, setShowDecision] = useState(false);
  const [pendingExpense, setPendingExpense] = useState<ParseResult | null>(null);
  const [showSupplement, setShowSupplement] = useState(false);
  const [pendingIncomplete, setPendingIncomplete] = useState<ParseResult | null>(null);

  // Animate total asset number
  useEffect(() => {
    let start: number | null = null;
    const duration = 1200;
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
      await addTransaction({
        type: 'income',
        amount: result.amount,
        platform: result.platform || '未知',
        bossName: result.bossName,
        timeSpent: result.timeSpent,
        note: result.note,
        date: Date.now(),
      });
      showToast(`+${result.amount} 元（${result.platform} 收入）`, 'success');
      return;
    }

    if (result.type === 'expense') {
      setPendingExpense(result);
      setShowDecision(true);
      return;
    }
  }

  async function handleExpenseConfirm(judgment: 'worthy' | 'unworthy') {
    if (!pendingExpense) return;
    setShowDecision(false);

    setPendingIncomplete({ ...pendingExpense, judgment });
    setShowSupplement(true);
  }

  async function handleSupplementConfirm(result: ParseResult) {
    setShowSupplement(false);
    if (!pendingIncomplete && !pendingExpense) return;

    const judgment = pendingIncomplete?.judgment;

    await addTransaction({
      type: result.type!,
      amount: result.amount,
      category: result.category || '其他',
      platform: result.platform,
      bossName: result.bossName,
      judgment,
      timeSpent: result.timeSpent,
      note: result.note,
      date: Date.now(),
    });

    const typeLabel = result.type === 'income' ? '收入' : '支出';
    const judgmentLabel = judgment === 'worthy' ? '· 值得' : judgment === 'unworthy' ? '· 不值' : '';
    showToast(`${result.amount} 元（${typeLabel}）${judgmentLabel}`, 'success');

    setPendingExpense(null);
    setPendingIncomplete(null);
  }

  // Recent transactions (last 3)
  const recentTx = [...transactions].reverse().slice(0, 3);

  // Today's stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTx = transactions.filter(t => t.date >= today.getTime());
  const todayIncome = todayTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const todayExpense = todayTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <div style={{ padding: '24px 24px 100px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Logo + Title */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '13px',
          letterSpacing: '0.25em',
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          marginBottom: '8px',
        }}>
          绮梦账间
        </h1>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(52px, 12vw, 96px)',
          fontWeight: 400,
          letterSpacing: '-0.025em',
          color: 'var(--text-primary)',
          lineHeight: 1,
          textShadow: '0 0 48px rgba(79,195,247,0.12)',
        }}>
          ¥{displayNumber.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{
          marginTop: '12px',
          fontSize: '10px',
          letterSpacing: '0.28em',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
        }}>
          总资产
        </div>
      </div>

      {/* Magic Input */}
      <div style={{ marginBottom: '40px' }}>
        <MagicInput onSubmit={handleInputSubmit} />
        <p style={{
          textAlign: 'center',
          marginTop: '10px',
          fontSize: '10px',
          letterSpacing: '0.14em',
          color: 'var(--text-muted)',
        }}>
          按 Enter 记录 · 示例：比心 150 / 打车 30
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '12px',
        marginBottom: '32px',
      }}>
        <div style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px',
          padding: '16px 12px',
          textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--accent-blue)' }}>
            +{todayIncome.toFixed(0)}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', letterSpacing: '0.1em' }}>今日收入</div>
        </div>
        <div style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px',
          padding: '16px 12px',
          textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--accent-gold)' }}>
            -{todayExpense.toFixed(0)}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', letterSpacing: '0.1em' }}>今日支出</div>
        </div>
        <div style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px',
          padding: '16px 12px',
          textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--text-primary)' }}>
            {transactions.length}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', letterSpacing: '0.1em' }}>总记录</div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h3 style={{
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          letterSpacing: '0.18em',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          marginBottom: '14px',
        }}>
          最近记录
        </h3>
        {recentTx.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
            暂无记录，开始记账吧
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentTx.map(tx => (
              <div key={tx.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 16px',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-primary)' }}>
                    {tx.platform || tx.category}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {new Date(tx.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                    {tx.bossName ? ` · ${tx.bossName}` : ''}
                  </span>
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  color: tx.type === 'income' ? 'var(--accent-blue)' : 'var(--accent-gold)',
                }}>
                  {tx.type === 'income' ? '+' : '-'}{tx.amount}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expense Decision Card */}
      {showDecision && pendingExpense && (
        <ExpenseDecision
          amount={pendingExpense.amount}
          category={pendingExpense.category || '其他'}
          onConfirm={handleExpenseConfirm}
          onCancel={() => { setShowDecision(false); setPendingExpense(null); }}
        />
      )}

      {/* Supplement Form */}
      {showSupplement && pendingIncomplete && (
        <SupplementForm
          initial={pendingIncomplete}
          onConfirm={handleSupplementConfirm}
          onCancel={() => { setShowSupplement(false); setPendingIncomplete(null); setPendingExpense(null); }}
        />
      )}
    </div>
  );
}