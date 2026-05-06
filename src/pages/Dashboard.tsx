import { useState, useEffect } from 'react';
import { useLedger } from '../store/useLedger';
import { useWishes } from '../store/useWishes';
import type { ParseResult } from '../components/magic/parseInput';
import { MagicInput } from '../components/magic/MagicInput';
import { ExpenseDecision } from '../components/magic/ExpenseDecision';
import { SupplementForm } from '../components/magic/SupplementForm';
import { WishPicker } from '../components/wishes/WishPicker';
import { useToast } from '../components/ui/Toast';

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function Dashboard() {
  const { transactions, totalAsset, addTransaction } = useLedger();
  const { wishes, depositToWish } = useWishes();
  const { showToast } = useToast();
  const [displayNumber, setDisplayNumber] = useState(0);
  const [showDecision, setShowDecision] = useState(false);
  const [pendingExpense, setPendingExpense] = useState<ParseResult | null>(null);
  const [showSupplement, setShowSupplement] = useState(false);
  const [pendingIncomplete, setPendingIncomplete] = useState<ParseResult | null>(null);
  const [showWishPicker, setShowWishPicker] = useState(false);
  const [wishPickerAmount, setWishPickerAmount] = useState(0);

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
      // For income with amount >= 20, offer to deposit to wish
      if (wishes.length > 0 && result.amount >= 20) {
        await addTransaction({
          type: 'income',
          amount: result.amount,
          platform: result.platform || '未知',
          bossName: result.bossName,
          timeSpent: result.timeSpent,
          note: result.note,
          date: Date.now(),
        });
        setWishPickerAmount(result.amount);
        setShowWishPicker(true);
      } else {
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
      }
      return;
    }
    if (result.type === 'expense') {
      // For expense, skip wish picker entirely — money already left
      setPendingExpense(result);
      setShowDecision(true);
      return;
    }
  }

  async function handleExpenseConfirm(judgment: 'worthy' | 'unworthy') {
    if (!pendingExpense) return;
    setShowDecision(false);
    // Worthy judgment is just a label — no deposit from expenses
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
      });
      showToast(`${pendingExpense.amount} 元（支出）· ${judgment === 'worthy' ? '值得' : '不值'}`, 'success');
      setPendingExpense(null);
    }
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
    // For income >= 20, offer wish deposit
    if (result.type === 'income' && wishes.length > 0 && result.amount >= 20) {
      setWishPickerAmount(result.amount);
      setShowWishPicker(true);
      return;
    }
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

  // Format number with thousands separator and decimal
  const formattedNumber = displayNumber.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Split integer and decimal parts
  const [integerPart, decimalPart] = formattedNumber.split('.');

  return (
    <div style={{
      padding: '48px 28px 100px',
      maxWidth: '560px',
      margin: '0 auto',
      minHeight: '100dvh',
    }}>
      {/* Header Section */}
      <div style={{ marginBottom: '8px', textAlign: 'center' }}>
        <div style={{
          fontFamily: "'Noto Serif SC', serif",
          fontSize: '11px',
          letterSpacing: '0.5em',
          color: '#b8af9e',
          textTransform: 'uppercase',
          marginBottom: '2px',
        }}>绮梦账间</div>
        <div style={{
          fontFamily: "'Noto Sans SC', sans-serif",
          fontSize: '9px',
          letterSpacing: '0.35em',
          color: '#c5bdb0',
          textTransform: 'uppercase',
        }}>Your Private Vault</div>
      </div>

      {/* Asset Display — 重新设计 */}
      <div style={{
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
      <div style={{ marginBottom: '36px', padding: '0 8px' }}>
        <MagicInput onSubmit={handleInputSubmit} />
        <p style={{
          textAlign: 'center',
          marginTop: '10px',
          fontSize: '10px',
          letterSpacing: '0.12em',
          color: '#b8af9e',
        }}>
          按 Enter 记录 · 示例：比心 150 / 打车 30
        </p>
      </div>

      {/* Quick Stats — Asymmetric Bento Grid */}
      <div style={{
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

      {/* Recent Transactions */}
      <div>
        <h3 style={{
          fontFamily: "'Noto Sans SC', sans-serif",
          fontSize: '10px',
          letterSpacing: '0.22em',
          color: '#b8af9e',
          textTransform: 'uppercase',
          marginBottom: '14px',
          paddingLeft: '4px',
        }}>
          最近记录
        </h3>
        {recentTx.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '32px 0',
            color: '#c5bdb0',
            fontSize: '13px',
            background: '#f0ebe0',
            borderRadius: '16px',
            boxShadow: 'inset 4px 4px 8px #cdc5b8, inset -4px -4px 8px #fffbf5',
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
                padding: '14px 18px',
                background: '#f0ebe0',
                borderRadius: '14px',
                boxShadow: 'inset 3px 3px 6px #cdc5b8, inset -3px -3px 6px #fffbf5',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{
                    fontFamily: "'Noto Sans SC', sans-serif",
                    fontSize: '13px',
                    color: '#3d3427',
                  }}>
                    {tx.platform || tx.category}
                  </span>
                  <span style={{ fontSize: '10px', color: '#a89f8e' }}>
                    {new Date(tx.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                    {tx.bossName ? ` · ${tx.bossName}` : ''}
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
          onConfirm={handleSupplementConfirm}
          onCancel={() => { setShowSupplement(false); setPendingIncomplete(null); setPendingExpense(null); }}
        />
      )}

      {showWishPicker && (
        <WishPicker
          amount={wishPickerAmount}
          wishes={wishes}
          onDeposit={async (wishId: string, amount: number) => {
            await depositToWish(wishId, amount);
            showToast(`+${amount} 元存入星体`, 'success');
            setShowWishPicker(false);
          }}
          onClose={() => {
            setShowWishPicker(false);
          }}
        />
      )}
    </div>
  );
}