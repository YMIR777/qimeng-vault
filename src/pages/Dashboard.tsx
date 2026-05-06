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
    const judgmentLabel = judgment ? (judgment === 'worthy' ? '· 值得' : '· 不值') : '';
    showToast(`${result.amount} 元（${typeLabel}）${judgmentLabel}`, 'success');

    setPendingExpense(null);
    setPendingIncomplete(null);
  }

  const recentTx = [...transactions].reverse().slice(0, 3);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTx = transactions.filter(t => t.date >= today.getTime());
  const todayIncome = todayTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const todayExpense = todayTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <div style={{
      padding: '32px 24px 100px',
      maxWidth: '540px',
      margin: '0 auto',
      minHeight: '100dvh',
    }}>
      {/* Logo + Title */}
      <div style={{ textAlign: 'center', marginBottom: '44px' }}>
        <div style={{
          fontFamily: "'Noto Sans SC', sans-serif",
          fontSize: '12px',
          letterSpacing: '0.3em',
          color: '#a0aec0',
          textTransform: 'uppercase',
          marginBottom: '10px',
        }}>
          绮梦账间
        </div>
        <div style={{
          fontFamily: "'Noto Serif SC', serif",
          fontSize: 'clamp(48px, 12vw, 88px)',
          fontWeight: 400,
          letterSpacing: '-0.025em',
          color: '#2d3748',
          lineHeight: 1,
        }}>
          ¥{displayNumber.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{
          marginTop: '10px',
          fontSize: '10px',
          letterSpacing: '0.3em',
          color: '#a0aec0',
          textTransform: 'uppercase',
        }}>
          总资产
        </div>
      </div>

      {/* Magic Input */}
      <div style={{ marginBottom: '36px' }}>
        <MagicInput onSubmit={handleInputSubmit} />
        <p style={{
          textAlign: 'center',
          marginTop: '10px',
          fontSize: '10px',
          letterSpacing: '0.14em',
          color: '#a0aec0',
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
          background: '#e8edf2',
          borderRadius: '18px',
          padding: '18px 12px',
          textAlign: 'center',
          boxShadow: '5px 5px 10px #b8c0cc, -5px -5px 10px #ffffff',
        }}>
          <div style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: '22px',
            color: '#5a9fd4',
            letterSpacing: '-0.02em',
          }}>
            +{todayIncome.toFixed(0)}
          </div>
          <div style={{
            fontSize: '10px',
            color: '#a0aec0',
            marginTop: '5px',
            letterSpacing: '0.1em',
          }}>今日收入</div>
        </div>
        <div style={{
          background: '#e8edf2',
          borderRadius: '18px',
          padding: '18px 12px',
          textAlign: 'center',
          boxShadow: '5px 5px 10px #b8c0cc, -5px -5px 10px #ffffff',
        }}>
          <div style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: '22px',
            color: '#d4a843',
            letterSpacing: '-0.02em',
          }}>
            -{todayExpense.toFixed(0)}
          </div>
          <div style={{
            fontSize: '10px',
            color: '#a0aec0',
            marginTop: '5px',
            letterSpacing: '0.1em',
          }}>今日支出</div>
        </div>
        <div style={{
          background: '#e8edf2',
          borderRadius: '18px',
          padding: '18px 12px',
          textAlign: 'center',
          boxShadow: '5px 5px 10px #b8c0cc, -5px -5px 10px #ffffff',
        }}>
          <div style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: '22px',
            color: '#2d3748',
            letterSpacing: '-0.02em',
          }}>
            {transactions.length}
          </div>
          <div style={{
            fontSize: '10px',
            color: '#a0aec0',
            marginTop: '5px',
            letterSpacing: '0.1em',
          }}>总记录</div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h3 style={{
          fontFamily: "'Noto Sans SC', sans-serif",
          fontSize: '10px',
          letterSpacing: '0.2em',
          color: '#a0aec0',
          textTransform: 'uppercase',
          marginBottom: '14px',
        }}>
          最近记录
        </h3>
        {recentTx.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '32px 0',
            color: '#c0c8d4',
            fontSize: '13px',
          }}>
            暂无记录，开始记账吧
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentTx.map(tx => (
              <div key={tx.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 18px',
                background: '#e8edf2',
                borderRadius: '14px',
                boxShadow: 'inset 3px 3px 6px #b8c0cc, inset -3px -3px 6px #ffffff',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{
                    fontFamily: "'Noto Sans SC', sans-serif",
                    fontSize: '14px',
                    color: '#2d3748',
                  }}>
                    {tx.platform || tx.category}
                  </span>
                  <span style={{ fontSize: '11px', color: '#a0aec0' }}>
                    {new Date(tx.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                    {tx.bossName ? ` · ${tx.bossName}` : ''}
                  </span>
                </div>
                <div style={{
                  fontFamily: "'Noto Serif SC', serif",
                  fontSize: '17px',
                  color: tx.type === 'income' ? '#5a9fd4' : '#d4a843',
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
          onConfirm={handleSupplementConfirm}
          onCancel={() => { setShowSupplement(false); setPendingIncomplete(null); setPendingExpense(null); }}
        />
      )}
    </div>
  );
}