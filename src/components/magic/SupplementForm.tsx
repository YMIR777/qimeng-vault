import { useState } from 'react';
import type { ParseResult } from './parseInput';

interface AccountOption {
  id: string;
  name: string;
  color: string;
}

interface SupplementFormProps {
  initial: ParseResult;
  accounts: AccountOption[];
  onConfirm: (result: ParseResult & { accountId?: string }) => void;
  onCancel: () => void;
}

const PLATFORMS = ['比心', '微信', '抖音', '小红书', '建行', '招行'];
const EXPENSE_CATEGORIES = ['交通', '餐饮', '娱乐', '购物', '住房', '医疗', '通讯', '其他'];

function formatDurationDisplay(minutes: number): string {
  if (minutes <= 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}小时${m}分钟`;
  if (h > 0) return `${h}小时`;
  return `${m}分钟`;
}

export function SupplementForm({ initial, accounts, onConfirm, onCancel }: SupplementFormProps) {
  const [type, setType] = useState<'income' | 'expense' | null>(initial.type);
  const [platform, setPlatform] = useState(initial.platform || '');
  const [category, setCategory] = useState(initial.category || '');
  const [bossName, setBossName] = useState(initial.bossName || '');
  const [timeSpent, setTimeSpent] = useState(initial.timeSpent || 0);
  const [amount, setAmount] = useState(String(initial.amount));
  const [accountId, setAccountId] = useState('');

  // 智能默认：根据平台选择账户
  const getDefaultAccount = () => {
    if (!platform) return '';
    const match = accounts.find(a => a.name.includes(platform) || platform.includes(a.name.replace('钱包', '')));
    return match?.id || accounts[0]?.id || '';
  };

  function handleConfirm() {
    const selectedAccount = accountId || getDefaultAccount();
    const result: ParseResult & { accountId?: string } = {
      ...initial,
      type: type!,
      platform: platform || undefined,
      category: category || initial.category,
      bossName: bossName || undefined,
      timeSpent: timeSpent || undefined,
      amount: parseFloat(amount) || 0,
      complete: true,
      missingFields: [],
      accountId: selectedAccount || undefined,
    };
    onConfirm(result);
  }

  const canConfirm = type && (type === 'income' ? platform : category) && amount;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(8px)',
    }} onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '20px',
        padding: '28px 24px',
        width: '340px',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '8px 8px 20px rgba(0,0,0,0.3)',
      }}>
        <h3 style={{
          margin: '0 0 20px',
          color: 'var(--text-primary)',
          fontSize: '17px',
          fontWeight: 500,
          textAlign: 'center',
        }}>
          补充信息
        </h3>

        {/* 金额 */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', letterSpacing: '0.1em' }}>金额</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '10px 14px',
              background: 'var(--glass-bg)', border: 'none', borderRadius: '10px',
              boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.1), inset -2px -2px 5px rgba(255,255,255,0.05)',
              color: 'var(--text-primary)', fontFamily: "'Noto Serif SC', serif",
              fontSize: '18px', textAlign: 'center', outline: 'none',
            }}
          />
        </div>

        {/* 类型切换（如果初始未识别） */}
        {!initial.type && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', letterSpacing: '0.1em' }}>类型</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setType('income')}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px',
                  border: `1.5px solid ${type === 'income' ? '#6b9fcf' : 'var(--border-subtle)'}`,
                  background: type === 'income' ? 'rgba(107,159,207,0.1)' : 'transparent',
                  color: type === 'income' ? '#6b9fcf' : 'var(--text-secondary)',
                  fontSize: '14px', cursor: 'pointer',
                }}
              >收入</button>
              <button
                onClick={() => setType('expense')}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px',
                  border: `1.5px solid ${type === 'expense' ? '#c9923a' : 'var(--border-subtle)'}`,
                  background: type === 'expense' ? 'rgba(201,146,58,0.1)' : 'transparent',
                  color: type === 'expense' ? '#c9923a' : 'var(--text-secondary)',
                  fontSize: '14px', cursor: 'pointer',
                }}
              >支出</button>
            </div>
          </div>
        )}

        {/* 收入：平台 + 账户 */}
        {(type === 'income') && (
          <>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', letterSpacing: '0.1em' }}>平台</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {PLATFORMS.map(p => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    style={{
                      padding: '8px 14px', borderRadius: '8px',
                      border: `1.5px solid ${platform === p ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                      background: platform === p ? 'rgba(79,195,247,0.1)' : 'transparent',
                      color: platform === p ? 'var(--accent-blue)' : 'var(--text-secondary)',
                      fontSize: '14px', cursor: 'pointer',
                    }}
                  >{p}</button>
                ))}
              </div>
            </div>
            {/* 账户选择 */}
            {accounts.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', letterSpacing: '0.1em' }}>存入账户</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {accounts.map(a => (
                    <button
                      key={a.id}
                      onClick={() => setAccountId(a.id)}
                      style={{
                        padding: '8px 14px', borderRadius: '8px',
                        border: `1.5px solid ${accountId === a.id ? a.color : 'var(--border-subtle)'}`,
                        background: accountId === a.id ? `${a.color}20` : 'transparent',
                        color: accountId === a.id ? a.color : 'var(--text-secondary)',
                        fontSize: '13px', cursor: 'pointer',
                      }}
                    >{a.name}</button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* 支出：分类 + 账户 */}
        {(type === 'expense') && (
          <>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', letterSpacing: '0.1em' }}>分类</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {EXPENSE_CATEGORIES.map(c => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    style={{
                      padding: '8px 14px', borderRadius: '8px',
                      border: `1.5px solid ${category === c ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                      background: category === c ? 'rgba(232,184,75,0.1)' : 'transparent',
                      color: category === c ? 'var(--accent-gold)' : 'var(--text-secondary)',
                      fontSize: '14px', cursor: 'pointer',
                    }}
                  >{c}</button>
                ))}
              </div>
            </div>
            {/* 支出账户选择 */}
            {accounts.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', letterSpacing: '0.1em' }}>支出账户</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {accounts.map(a => (
                    <button
                      key={a.id}
                      onClick={() => setAccountId(a.id)}
                      style={{
                        padding: '8px 14px', borderRadius: '8px',
                        border: `1.5px solid ${accountId === a.id ? a.color : 'var(--border-subtle)'}`,
                        background: accountId === a.id ? `${a.color}20` : 'transparent',
                        color: accountId === a.id ? a.color : 'var(--text-secondary)',
                        fontSize: '13px', cursor: 'pointer',
                      }}
                    >{a.name}</button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* 老板名（收入） */}
        {(type === 'income') && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', letterSpacing: '0.1em' }}>老板名 <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(可选)</span></label>
            <input
              type="text"
              value={bossName}
              onChange={(e) => setBossName(e.target.value)}
              placeholder="不填也可以"
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '10px 14px',
                background: 'var(--glass-bg)', border: 'none', borderRadius: '10px',
                boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.1), inset -2px -2px 5px rgba(255,255,255,0.05)',
                color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
              }}
            />
          </div>
        )}

        {/* 花费时间（收入） */}
        {(type === 'income') && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', letterSpacing: '0.1em' }}>花费时间 <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(可选，分钟)</span></label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="number"
                value={timeSpent || ''}
                onChange={(e) => setTimeSpent(parseInt(e.target.value) || 0)}
                placeholder="例如 60"
                min="0"
                style={{
                  flex: 1, padding: '10px 14px',
                  background: 'var(--glass-bg)', border: 'none', borderRadius: '10px',
                  boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.1), inset -2px -2px 5px rgba(255,255,255,0.05)',
                  color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
                }}
              />
              {timeSpent > 0 && (
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {formatDurationDisplay(timeSpent)}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              {[30, 60, 90, 120].map(m => (
                <button
                  key={m}
                  onClick={() => setTimeSpent(m)}
                  style={{
                    padding: '4px 10px', borderRadius: '6px',
                    border: `1.5px solid ${timeSpent === m ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                    background: timeSpent === m ? 'rgba(79,195,247,0.1)' : 'transparent',
                    color: timeSpent === m ? 'var(--accent-blue)' : 'var(--text-muted)',
                    fontSize: '12px', cursor: 'pointer',
                  }}
                >{m >= 60 ? `${m / 60}h` : `${m}分钟`}</button>
              ))}
              <button
                onClick={() => setTimeSpent(0)}
                style={{
                  padding: '4px 10px', borderRadius: '6px',
                  border: `1.5px solid ${timeSpent === 0 ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                  background: timeSpent === 0 ? 'rgba(232,184,75,0.1)' : 'transparent',
                  color: timeSpent === 0 ? 'var(--accent-gold)' : 'var(--text-muted)',
                  fontSize: '12px', cursor: 'pointer',
                }}
              >不填</button>
            </div>
          </div>
        )}

        {/* 按钮 */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '12px', borderRadius: '12px',
              border: '1px solid var(--border-subtle)', background: 'transparent',
              color: 'var(--text-muted)', fontSize: '14px', cursor: 'pointer',
            }}
          >取消</button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            style={{
              flex: 1, padding: '12px', borderRadius: '12px',
              border: 'none',
              background: type === 'income' ? 'var(--accent-blue)' : 'var(--accent-gold)',
              color: '#fff',
              fontSize: '14px', fontWeight: 500,
              cursor: canConfirm ? 'pointer' : 'not-allowed',
              opacity: canConfirm ? 1 : 0.5,
            }}
          >确认</button>
        </div>
      </div>
    </div>
  );
}
