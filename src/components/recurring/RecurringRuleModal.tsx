import { useState } from 'react';
import type { RecurringRule } from '../../store/db';
import { useAccounts } from '../../store/useAccounts';

const EXPENSE_CATEGORIES = ['交通', '餐饮', '娱乐', '购物', '住房', '医疗', '通讯', '其他'];

const PERIOD_LABELS = { monthly: '每月', weekly: '每周', yearly: '每年' };
const DAY_OF_WEEK_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const MONTH_LABELS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

function getNextDue(
  period: RecurringRule['period'],
  dayOfMonth?: number,
  dayOfWeek?: number,
  month?: number,
): number {
  const now = new Date();
  let next: Date;

  if (period === 'monthly') {
    const day = dayOfMonth ?? 1;
    next = new Date(now.getFullYear(), now.getMonth(), day, 0, 0, 0);
    if (next.getTime() <= now.getTime()) {
      next = new Date(now.getFullYear(), now.getMonth() + 1, day, 0, 0, 0);
    }
  } else if (period === 'weekly') {
    const dow = dayOfWeek ?? 0;
    const currentDow = now.getDay();
    const daysUntil = (dow - currentDow + 7) % 7 || 7;
    next = new Date(now);
    next.setDate(now.getDate() + daysUntil);
    next.setHours(0, 0, 0, 0);
  } else if (period === 'yearly') {
    const day = dayOfMonth ?? 1;
    const mon = (month ?? 0);
    next = new Date(now.getFullYear(), mon, day, 0, 0, 0);
    if (next.getTime() <= now.getTime()) {
      next = new Date(now.getFullYear() + 1, mon, day, 0, 0, 0);
    }
  } else {
    next = new Date(now.getTime() + 86400000);
  }

  return next.getTime();
}

interface RecurringRuleModalProps {
  onClose: () => void;
  onSave: (payload: Omit<RecurringRule, 'id' | 'createdAt' | 'lastTriggered'>) => void;
  initialRule?: RecurringRule;
}

export function RecurringRuleModal({ onClose, onSave, initialRule }: RecurringRuleModalProps) {
  const { accounts } = useAccounts();
  const isEditing = !!initialRule;

  const [name, setName] = useState(initialRule?.name ?? '');
  const [amount, setAmount] = useState(initialRule ? String(initialRule.amount) : '');
  const [type, setType] = useState<'expense' | 'income'>(initialRule?.type ?? 'expense');
  const [category, setCategory] = useState(initialRule?.category ?? '');
  const [accountId, setAccountId] = useState(initialRule?.accountId ?? '');
  const [period, setPeriod] = useState<RecurringRule['period']>(initialRule?.period ?? 'monthly');
  const [dayOfMonth, setDayOfMonth] = useState(initialRule?.dayOfMonth ?? 1);
  const [dayOfWeek, setDayOfWeek] = useState(initialRule?.dayOfWeek ?? 0);
  const [yearMonth, setYearMonth] = useState(
    initialRule && 'month' in initialRule ? (initialRule as any).month ?? 0 : 0
  );
  const [yearDay, setYearDay] = useState(initialRule?.dayOfMonth ?? 1);
  const [autoRecord, setAutoRecord] = useState(initialRule?.autoRecord ?? false);
  const [note, setNote] = useState(initialRule?.note ?? '');
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = '请输入名称';
    if (!amount || parseFloat(amount) <= 0) errs.amount = '请输入有效金额';
    if (!accountId) errs.accountId = '请选择账户';
    if (period === 'monthly' && !dayOfMonth) errs.date = '请选择日期';
    if (period === 'weekly' && dayOfWeek === undefined) errs.date = '请选择星期';
    if (period === 'yearly' && (!yearMonth && yearMonth !== 0)) errs.date = '请选择月日';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;

    if (autoRecord && !initialRule?.autoRecord) {
      setShowConfirm(true);
      return;
    }

    const nextDue = getNextDue(
      period,
      period === 'monthly' ? dayOfMonth : yearDay,
      period === 'weekly' ? dayOfWeek : undefined,
      period === 'yearly' ? yearMonth : undefined,
    );

    const payload: Omit<RecurringRule, 'id' | 'createdAt' | 'lastTriggered'> = {
      name: name.trim(),
      amount: parseFloat(amount),
      type,
      category: type === 'expense' ? category : undefined,
      accountId,
      period,
      dayOfMonth: period === 'monthly' ? dayOfMonth : period === 'yearly' ? yearDay : undefined,
      dayOfWeek: period === 'weekly' ? dayOfWeek : undefined,
      nextDue,
      active: initialRule?.active ?? true,
      autoRecord,
      note: note.trim() || undefined,
      ...(initialRule ? { lastTriggered: initialRule.lastTriggered } : { lastTriggered: 0 }),
    };

    onSave(payload);
    onClose();
  }

  // Common button style helpers
  function segBtnStyle(active: boolean): React.CSSProperties {
    return {
      flex: 1,
      padding: '8px 4px',
      border: 'none',
      borderRadius: '10px',
      fontSize: '0.8rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s var(--cream-spring)',
      background: active ? 'var(--cream-accent-blue)' : 'var(--cream-card-inset)',
      color: active ? '#fff' : 'var(--cream-text-muted)',
      boxShadow: active
        ? '3px 3px 6px var(--cream-shadow-raised), -1px -1px 3px #fff'
        : 'inset 2px 2px 4px #cdc5b8, inset -2px -2px 4px #fffbf5',
    };
  }

  function inputStyle(error?: string): React.CSSProperties {
    return {
      width: '100%',
      boxSizing: 'border-box',
      padding: '10px 14px',
      borderRadius: '12px',
      border: error ? '1.5px solid #e57373' : '1.5px solid transparent',
      background: 'var(--cream-card-inset)',
      color: 'var(--cream-text)',
      fontSize: '0.9rem',
      boxShadow: 'inset 2px 2px 5px #cdc5b8, inset -2px -2px 5px #fffbf5',
      outline: 'none',
      transition: 'border-color 0.2s ease',
    };
  }

  function labelStyle(): React.CSSProperties {
    return {
      display: 'block',
      fontSize: '0.75rem',
      color: 'var(--cream-text-secondary)',
      marginBottom: '6px',
      letterSpacing: '0.08em',
      fontWeight: 500,
    };
  }

  function fieldGap(): React.CSSProperties {
    return { marginBottom: '18px' };
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 90,
          background: 'rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      {/* Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 95,
        background: 'var(--cream-card)',
        borderRadius: '24px 24px 0 0',
        boxShadow: '0 -8px 40px rgba(163, 158, 148, 0.5)',
        maxHeight: '92vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        animation: 'slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}</style>

        {/* Handle */}
        <div style={{ padding: '14px 0 4px', textAlign: 'center', flexShrink: 0 }}>
          <div style={{
            width: '40px', height: '5px', background: 'var(--cream-divider)',
            borderRadius: '3px', margin: '0 auto',
            boxShadow: 'inset 2px 2px 4px #cdc5b8, inset -2px -2px 4px #fffbf5',
          }} />
        </div>

        {/* Header */}
        <div style={{
          padding: '10px 24px 16px', textAlign: 'center', flexShrink: 0,
          borderBottom: '1px solid var(--cream-divider)',
        }}>
          <span style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: '18px',
            color: 'var(--cream-text)',
            fontWeight: 600,
          }}>
            {isEditing ? '编辑周期规则' : '新建周期规则'}
          </span>
        </div>

        {/* Scrollable form */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 24px' }}>

          {/* 名称 */}
          <div style={fieldGap()}>
            <label style={labelStyle()}>名称</label>
            <input
              type="text"
              placeholder="如：饿了么会员"
              value={name}
              onChange={e => setName(e.target.value)}
              style={inputStyle(errors.name)}
            />
            {errors.name && <span style={{ fontSize: '0.72rem', color: '#e57373', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
          </div>

          {/* 金额 */}
          <div style={fieldGap()}>
            <label style={labelStyle()}>金额</label>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              style={inputStyle(errors.amount)}
              min="0"
              step="0.01"
            />
            {errors.amount && <span style={{ fontSize: '0.72rem', color: '#e57373', marginTop: '4px', display: 'block' }}>{errors.amount}</span>}
          </div>

          {/* 类型 */}
          <div style={fieldGap()}>
            <label style={labelStyle()}>类型</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                style={segBtnStyle(type === 'expense')}
                onClick={() => { setType('expense'); setCategory(''); }}
              >
                支出
              </button>
              <button
                style={segBtnStyle(type === 'income')}
                onClick={() => { setType('income'); setCategory(''); }}
              >
                收入
              </button>
            </div>
          </div>

          {/* 分类（支出时） */}
          {type === 'expense' && (
            <div style={fieldGap()}>
              <label style={labelStyle()}>分类</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {EXPENSE_CATEGORIES.map(c => (
                  <button
                    key={c}
                    style={{
                      padding: '6px 12px',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s var(--cream-spring)',
                      background: category === c ? 'var(--cream-accent-blue)' : 'var(--cream-card-inset)',
                      color: category === c ? '#fff' : 'var(--cream-text-muted)',
                      boxShadow: category === c
                        ? '3px 3px 6px var(--cream-shadow-raised), -1px -1px 3px #fff'
                        : 'inset 2px 2px 4px #cdc5b8, inset -2px -2px 4px #fffbf5',
                    }}
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 账户 */}
          <div style={fieldGap()}>
            <label style={labelStyle()}>账户</label>
            <select
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              style={{ ...inputStyle(errors.accountId), cursor: 'pointer', appearance: 'none' }}
            >
              <option value="">请选择账户</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
            {errors.accountId && <span style={{ fontSize: '0.72rem', color: '#e57373', marginTop: '4px', display: 'block' }}>{errors.accountId}</span>}
          </div>

          {/* 周期类型 */}
          <div style={fieldGap()}>
            <label style={labelStyle()}>周期</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {(['monthly', 'weekly', 'yearly'] as const).map(p => (
                <button key={p} style={segBtnStyle(period === p)} onClick={() => setPeriod(p)}>
                  {PERIOD_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          {/* 日期选择 */}
          <div style={fieldGap()}>
            <label style={labelStyle()}>日期</label>

            {/* 每月 */}
            {period === 'monthly' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--cream-text-secondary)', fontSize: '0.85rem' }}>每月</span>
                <input
                  type="number"
                  min={1} max={31}
                  value={dayOfMonth}
                  onChange={e => setDayOfMonth(Math.max(1, Math.min(31, parseInt(e.target.value) || 1)))}
                  style={{ ...inputStyle(), width: '70px', textAlign: 'center' }}
                />
                <span style={{ color: 'var(--cream-text-secondary)', fontSize: '0.85rem' }}>日</span>
              </div>
            )}

            {/* 每周 */}
            {period === 'weekly' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {DAY_OF_WEEK_LABELS.map((label, i) => (
                  <button
                    key={i}
                    style={{
                      padding: '6px 10px',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s var(--cream-spring)',
                      background: dayOfWeek === i ? 'var(--cream-accent-blue)' : 'var(--cream-card-inset)',
                      color: dayOfWeek === i ? '#fff' : 'var(--cream-text-muted)',
                      boxShadow: dayOfWeek === i
                        ? '3px 3px 6px var(--cream-shadow-raised), -1px -1px 3px #fff'
                        : 'inset 2px 2px 4px #cdc5b8, inset -2px -2px 4px #fffbf5',
                    }}
                    onClick={() => setDayOfWeek(i)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* 每年 */}
            {period === 'yearly' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <select
                  value={yearMonth}
                  onChange={e => setYearMonth(parseInt(e.target.value))}
                  style={{ ...inputStyle(), width: '100px', cursor: 'pointer', appearance: 'none' }}
                >
                  {MONTH_LABELS.map((m, i) => (
                    <option key={i} value={i}>{m}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1} max={31}
                  value={yearDay}
                  onChange={e => setYearDay(Math.max(1, Math.min(31, parseInt(e.target.value) || 1)))}
                  style={{ ...inputStyle(), width: '70px', textAlign: 'center' }}
                />
                <span style={{ color: 'var(--cream-text-secondary)', fontSize: '0.85rem' }}>日</span>
              </div>
            )}

            {errors.date && <span style={{ fontSize: '0.72rem', color: '#e57373', marginTop: '6px', display: 'block' }}>{errors.date}</span>}
          </div>

          {/* 自动入账 */}
          <div style={{ ...fieldGap(), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <label style={{ ...labelStyle(), marginBottom: 0 }}>自动入账</label>
              <div style={{ fontSize: '0.72rem', color: 'var(--cream-text-secondary)', marginTop: '2px' }}>
                开启后，到期自动记录，无需确认
              </div>
            </div>
            <button
              onClick={() => setAutoRecord(v => !v)}
              style={{
                width: '48px',
                height: '28px',
                borderRadius: '14px',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.25s ease',
                background: autoRecord ? 'var(--cream-accent-blue)' : 'var(--cream-card-inset)',
                boxShadow: autoRecord
                  ? 'inset 2px 2px 4px rgba(0,0,0,0.15)'
                  : 'inset 2px 2px 4px #cdc5b8, inset -2px -2px 4px #fffbf5',
                flexShrink: 0,
              }}
            >
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: '#fff',
                position: 'absolute',
                top: '3px',
                left: autoRecord ? '23px' : '3px',
                transition: 'left 0.25s var(--cream-spring)',
                boxShadow: '2px 2px 4px rgba(0,0,0,0.2)',
              }} />
            </button>
          </div>

          {/* 备注 */}
          <div style={fieldGap()}>
            <label style={labelStyle()}>备注 <span style={{ opacity: 0.5 }}>（可选）</span></label>
            <input
              type="text"
              placeholder="添加备注..."
              value={note}
              onChange={e => setNote(e.target.value)}
              style={inputStyle()}
            />
          </div>
        </div>

        {/* Bottom buttons */}
        <div style={{
          padding: '16px 24px calc(16px + env(safe-area-inset-bottom))',
          display: 'flex', gap: '12px', flexShrink: 0,
          borderTop: '1px solid var(--cream-divider)',
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: '14px',
              border: 'none',
              background: 'var(--cream-card-inset)',
              color: 'var(--cream-text)',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: 'inset 2px 2px 5px #cdc5b8, inset -2px -2px 5px #fffbf5',
              transition: 'transform 0.15s var(--cream-spring)',
            }}
            onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)'; }}
            onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: '14px',
              border: 'none',
              background: 'var(--cream-accent-blue)',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '4px 4px 10px rgba(107, 159, 207, 0.4), -1px -1px 3px rgba(255,255,255,0.3)',
              transition: 'transform 0.15s var(--cream-spring)',
            }}
            onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)'; }}
            onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
          >
            保存
          </button>
        </div>
      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <>
          <div
            onClick={() => setShowConfirm(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(6px)',
            }}
          />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 105,
            background: 'var(--cream-card)',
            borderRadius: '20px',
            padding: '28px 24px',
            width: '300px',
            textAlign: 'center',
            boxShadow: '8px 8px 24px rgba(0,0,0,0.3)',
          }}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--cream-text)', marginBottom: '12px' }}>
              确认开启自动入账？
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--cream-text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
              开启后，此规则将在到期时<strong style={{ color: 'var(--cream-text)' }}>自动入账</strong>，无需每次确认。
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  flex: 1, padding: '10px', borderRadius: '12px', border: 'none',
                  background: 'var(--cream-card-inset)', color: 'var(--cream-text)',
                  fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
                  boxShadow: 'inset 2px 2px 4px #cdc5b8, inset -2px -2px 4px #fffbf5',
                }}
              >
                取消
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setAutoRecord(true);
                  const nextDue = getNextDue(
                    period,
                    period === 'monthly' ? dayOfMonth : yearDay,
                    period === 'weekly' ? dayOfWeek : undefined,
                    period === 'yearly' ? yearMonth : undefined,
                  );
                  const payload: Omit<RecurringRule, 'id' | 'createdAt' | 'lastTriggered'> = {
                    name: name.trim(),
                    amount: parseFloat(amount),
                    type,
                    category: type === 'expense' ? category : undefined,
                    accountId,
                    period,
                    dayOfMonth: period === 'monthly' ? dayOfMonth : period === 'yearly' ? yearDay : undefined,
                    dayOfWeek: period === 'weekly' ? dayOfWeek : undefined,
                    nextDue,
                    active: initialRule?.active ?? true,
                    autoRecord: true,
                    note: note.trim() || undefined,
                    ...(initialRule ? { lastTriggered: initialRule.lastTriggered } : { lastTriggered: 0 }),
                  };
                  onSave(payload);
                  onClose();
                }}
                style={{
                  flex: 1, padding: '10px', borderRadius: '12px', border: 'none',
                  background: 'var(--cream-accent-blue)', color: '#fff',
                  fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
                  boxShadow: '3px 3px 8px rgba(107, 159, 207, 0.4)',
                }}
              >
                确认
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
