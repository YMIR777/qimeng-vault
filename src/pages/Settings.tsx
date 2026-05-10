import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useAccounts } from '../store/useAccounts';
import { useBudgets } from '../store/useBudgets';

const css = {
  bg: '#f5f0e8',
  card: '#f0ebe0',
  text: '#3d3427',
  textMuted: '#a89f8e',
  textSecondary: '#b8af9e',
  accentBlue: '#6b9fcf',
  accentGold: '#c9923a',
  accentGreen: '#7a9e7e',
  shadowRaised: '5px 5px 10px #cdc5b8, -5px -5px 10px #fffbf5',
  shadowInset: 'inset 4px 4px 8px #cdc5b8, inset -4px -4px 8px #fffbf5',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

const TYPE_LABELS: Record<string, string> = {
  bank: '银行卡',
  wechat: '微信',
  alipay: '支付宝',
  cash: '现金',
  other: '其他',
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  bank: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="6" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M2 10h16" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="14" cy="13" r="1.5" fill="currentColor"/>
    </svg>
  ),
  wechat: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2C5.58 2 2 4.9 2 8.5c0 2.1 1.2 4 3 5.2V18l3.8-2.1c.7.2 1.5.3 2.2.3 4.4 0 8-2.9 8-6.5S14.4 2 10 2z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </svg>
  ),
  alipay: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M6 10h8M10 6v8" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  cash: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <text x="10" y="14" textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="bold">¥</text>
    </svg>
  ),
  other: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </svg>
  ),
};

const TYPE_COLORS = ['#6b9fcf', '#c9923a', '#7a9e7e', '#b8af9e', '#d4a843', '#a89f8e'];

function AnimatedNumber({ value, prefix = '' }: { value: number; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: value,
      duration: 1,
      ease: 'power2.out',
      onUpdate: () => setDisplay(Math.round(obj.val)),
    });
  }, [value]);

  return <span ref={ref}>{prefix}{display.toLocaleString()}</span>;
}

function AddAccountModal({ onClose, onAdd }: { onClose: () => void; onAdd: (data: { name: string; type: 'bank' | 'wechat' | 'alipay' | 'cash' | 'other'; balance: number }) => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'bank' | 'wechat' | 'alipay' | 'cash' | 'other'>('bank');
  const [balance, setBalance] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), type, balance: parseFloat(balance) || 0 });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(8px)',
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: css.card,
        borderRadius: '20px',
        padding: '32px 28px',
        width: '320px',
        boxShadow: css.shadowRaised,
      }}>
        <h3 style={{ margin: '0 0 24px', color: css.text, fontSize: '17px', fontWeight: 500 }}>
          添加账户
        </h3>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: css.textMuted, fontSize: '12px', marginBottom: '6px' }}>账户名称</label>
          <input
            type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="例如：招行工资卡"
            style={{
              width: '100%', boxSizing: 'border-box', padding: '10px 14px',
              background: css.bg, border: 'none', borderRadius: '10px',
              boxShadow: css.shadowInset, color: css.text, fontSize: '14px', outline: 'none',
            }}
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: css.textMuted, fontSize: '12px', marginBottom: '6px' }}>账户类型</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <button key={key} onClick={() => setType(key as any)}
                style={{
                  padding: '6px 12px', borderRadius: '8px',
                  border: `1.5px solid ${type === key ? css.accentBlue : 'var(--border-subtle)'}`,
                  background: type === key ? 'rgba(107,159,207,0.15)' : 'transparent',
                  color: type === key ? css.accentBlue : css.textMuted,
                  fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s ease',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', color: css.textMuted, fontSize: '12px', marginBottom: '6px' }}>初始余额</label>
          <input
            type="number" value={balance} onChange={e => setBalance(e.target.value)}
            placeholder="0"
            style={{
              width: '100%', boxSizing: 'border-box', padding: '10px 14px',
              background: css.bg, border: 'none', borderRadius: '10px',
              boxShadow: css.shadowInset, color: css.text, fontSize: '14px', outline: 'none',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px', borderRadius: '12px',
            border: '1px solid var(--border-subtle)', background: 'transparent',
            color: css.textMuted, fontSize: '14px', cursor: 'pointer',
          }}>取消</button>
          <button onClick={handleSubmit} disabled={!name.trim()} style={{
            flex: 1, padding: '12px', borderRadius: '12px',
            border: 'none', background: css.accentBlue, color: '#fff',
            fontSize: '14px', fontWeight: 500, cursor: name.trim() ? 'pointer' : 'not-allowed',
            opacity: name.trim() ? 1 : 0.5,
          }}>添加</button>
        </div>
      </div>
    </div>
  );
}

const EXPENSE_CATEGORIES = ['交通', '餐饮', '娱乐', '购物', '住房', '医疗', '通讯', '其他'];

function BudgetSection() {
  const { budgets, addBudget, deleteBudget } = useBudgets();
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');

  const handleAdd = () => {
    if (!category || !amount) return;
    addBudget({ category, amount: parseFloat(amount), period: 'monthly', rollover: false });
    setCategory('');
    setAmount('');
  };

  return (
    <div className="animate-in" style={{ marginTop: '32px' }}>
      <div style={{
        fontFamily: "'Noto Sans SC', sans-serif",
        fontSize: '12px', fontWeight: 500, color: css.textMuted,
        letterSpacing: '0.08em', marginBottom: '14px',
      }}>
        月度预算
      </div>

      {/* 添加预算 */}
      <div style={{
        background: css.card, borderRadius: '16px', padding: '16px',
        boxShadow: css.shadowRaised, marginBottom: '12px',
      }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{
              flex: 1, padding: '10px', background: css.bg, border: 'none', borderRadius: '10px',
              boxShadow: css.shadowInset, color: css.text, fontSize: '14px', outline: 'none',
            }}
          >
            <option value="">选择分类</option>
            {EXPENSE_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="预算金额"
            style={{
              flex: 1, padding: '10px', background: css.bg, border: 'none', borderRadius: '10px',
              boxShadow: css.shadowInset, color: css.text, fontSize: '14px', outline: 'none',
            }}
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={!category || !amount}
          style={{
            width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
            background: css.accentGreen, color: '#fff',
            fontSize: '14px', fontWeight: 500, cursor: 'pointer',
            opacity: (!category || !amount) ? 0.5 : 1,
          }}
        >
          添加预算
        </button>
      </div>

      {/* 预算列表 */}
      {budgets.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '24px 0', color: css.textSecondary, fontSize: '13px',
        }}>
          暂无预算，添加一个开始控制开支
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {budgets.map(b => (
            <div key={b.id} style={{
              background: css.card, borderRadius: '14px', padding: '14px 16px',
              boxShadow: css.shadowRaised, display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "'Noto Sans SC', sans-serif", fontSize: '14px', color: css.text,
                }}>
                  {b.category}
                </div>
                <div style={{ fontSize: '12px', color: css.textSecondary, marginTop: '2px' }}>
                  月度 ¥{b.amount.toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => {
                  if (window.confirm(`删除「${b.category}」预算？`)) {
                    deleteBudget(b.id);
                  }
                }}
                style={{
                  border: 'none', background: 'transparent',
                  color: css.textSecondary, cursor: 'pointer', fontSize: '18px', padding: '4px',
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Settings() {
  const { accounts, totalBalance, addAccount, deleteAccount, transfer } = useAccounts();
  const pageRef = useRef<HTMLDivElement>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferFrom, setTransferFrom] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  useEffect(() => {
    if (!pageRef.current) return;
    const sections = pageRef.current.querySelectorAll('.animate-in');
    gsap.fromTo(sections,
      { y: 36, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.65, stagger: 0.1, ease: 'power2.out', delay: 0.1 }
    );
  }, []);

  const handleTransfer = async () => {
    if (!transferFrom || !transferTo || !transferAmount || transferFrom === transferTo) return;
    const success = await transfer(transferFrom, transferTo, parseFloat(transferAmount));
    if (success) {
      setShowTransfer(false);
      setTransferFrom('');
      setTransferTo('');
      setTransferAmount('');
    } else {
      alert('余额不足');
    }
  };

  return (
    <div ref={pageRef} style={{
      padding: '40px 24px 100px',
      maxWidth: '560px',
      margin: '0 auto',
      minHeight: '100dvh',
      background: css.bg,
    }}>
      {/* Header */}
      <div className="animate-in" style={{ marginBottom: '28px' }}>
        <div style={{
          fontFamily: "'Noto Serif SC', serif",
          fontSize: '11px', letterSpacing: '0.5em',
          color: css.textSecondary, textTransform: 'uppercase',
          marginBottom: '2px',
        }}>绮梦账间</div>
        <h1 style={{
          fontFamily: "'Noto Sans SC', sans-serif",
          fontSize: '22px', fontWeight: 500,
          color: css.text, letterSpacing: '-0.01em', margin: 0,
        }}>账户管理</h1>
      </div>

      {/* 总资产卡片 */}
      <div className="animate-in" style={{
        background: css.card,
        borderRadius: '20px',
        padding: '28px 24px',
        boxShadow: css.shadowRaised,
        marginBottom: '20px',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: "'Noto Serif SC', serif",
          fontSize: 'clamp(36px, 8vw, 52px)',
          color: css.text,
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}>
          <AnimatedNumber value={totalBalance} prefix="¥" />
        </div>
        <div style={{
          fontFamily: "'Noto Sans SC', sans-serif",
          fontSize: '10px', color: css.textSecondary,
          marginTop: '8px', letterSpacing: '0.15em',
        }}>总资产</div>
      </div>

      {/* 操作按钮 */}
      <div className="animate-in" style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
      }}>
        <button onClick={() => setShowAddModal(true)} style={{
          flex: 1, padding: '12px',
          background: css.card, border: 'none', borderRadius: '14px',
          boxShadow: css.shadowRaised,
          color: css.text, fontSize: '14px', fontWeight: 500,
          cursor: 'pointer', fontFamily: "'Noto Sans SC', sans-serif",
        }}>+ 添加账户</button>
        <button onClick={() => setShowTransfer(!showTransfer)} style={{
          flex: 1, padding: '12px',
          background: css.card, border: 'none', borderRadius: '14px',
          boxShadow: css.shadowRaised,
          color: css.text, fontSize: '14px', fontWeight: 500,
          cursor: 'pointer', fontFamily: "'Noto Sans SC', sans-serif",
        }}>⇄ 转账</button>
      </div>

      {/* 转账区域 */}
      {showTransfer && (
        <div className="animate-in" style={{
          background: css.card,
          borderRadius: '16px',
          padding: '20px',
          boxShadow: css.shadowInset,
          marginBottom: '20px',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: css.text, marginBottom: '12px' }}>账户转账</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <select value={transferFrom} onChange={e => setTransferFrom(e.target.value)}
              style={{
                padding: '10px', background: css.bg, border: 'none', borderRadius: '10px',
                boxShadow: css.shadowInset, color: css.text, fontSize: '14px', outline: 'none',
              }}
            >
              <option value="">选择转出账户</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name} (¥{a.balance})</option>)}
            </select>
            <select value={transferTo} onChange={e => setTransferTo(e.target.value)}
              style={{
                padding: '10px', background: css.bg, border: 'none', borderRadius: '10px',
                boxShadow: css.shadowInset, color: css.text, fontSize: '14px', outline: 'none',
              }}
            >
              <option value="">选择转入账户</option>
              {accounts.filter(a => a.id !== transferFrom).map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <input type="number" value={transferAmount} onChange={e => setTransferAmount(e.target.value)}
              placeholder="转账金额"
              style={{
                padding: '10px', background: css.bg, border: 'none', borderRadius: '10px',
                boxShadow: css.shadowInset, color: css.text, fontSize: '14px', outline: 'none',
              }}
            />
            <button onClick={handleTransfer} disabled={!transferFrom || !transferTo || !transferAmount}
              style={{
                padding: '12px', borderRadius: '12px', border: 'none',
                background: css.accentBlue, color: '#fff',
                fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                opacity: (!transferFrom || !transferTo || !transferAmount) ? 0.5 : 1,
              }}
            >确认转账</button>
          </div>
        </div>
      )}

      {/* 账户列表 */}
      <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {accounts.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '48px 0',
            color: css.textSecondary, fontSize: '14px',
          }}>暂无账户，点击上方添加</div>
        ) : (
          accounts.map((account) => (
            <div key={account.id} style={{
              background: css.card,
              borderRadius: '16px',
              padding: '18px 20px',
              boxShadow: css.shadowRaised,
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              transition: 'transform 0.2s ease',
            }}>
              <div style={{
                width: '44px', height: '44px',
                borderRadius: '12px',
                background: account.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                flexShrink: 0,
              }}>
                {TYPE_ICONS[account.type] || TYPE_ICONS.other}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "'Noto Sans SC', sans-serif",
                  fontSize: '15px', fontWeight: 500, color: css.text,
                  marginBottom: '2px',
                }}>{account.name}</div>
                <div style={{
                  fontSize: '11px', color: css.textSecondary,
                  letterSpacing: '0.05em',
                }}>{TYPE_LABELS[account.type] || '其他'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontFamily: "'Noto Serif SC', serif",
                  fontSize: '20px', color: css.text,
                  letterSpacing: '-0.02em',
                }}>¥{account.balance.toLocaleString()}</div>
              </div>
              <button onClick={() => {
                if (window.confirm(`删除账户「${account.name}」？\n余额将被移除，但历史交易记录保留。`)) {
                  deleteAccount(account.id);
                }
              }} style={{
                border: 'none', background: 'transparent',
                color: css.textSecondary, cursor: 'pointer',
                fontSize: '18px', padding: '4px', lineHeight: 1,
              }}>×</button>
            </div>
          ))
        )}
      </div>

      {/* 预算配置 */}
      <BudgetSection />

      {/* 底部装饰 */}
      <div className="animate-in" style={{ marginTop: '32px', textAlign: 'center' }}>
        <div style={{
          width: '40px', height: '2px',
          background: 'linear-gradient(90deg, transparent, #c9923a, transparent)',
          margin: '0 auto', borderRadius: '1px', opacity: 0.5,
        }} />
      </div>

      {/* 添加账户弹窗 */}
      {showAddModal && (
        <AddAccountModal
          onClose={() => setShowAddModal(false)}
          onAdd={data => {
            const color = TYPE_COLORS[accounts.length % TYPE_COLORS.length];
            addAccount({ ...data, color });
          }}
        />
      )}
    </div>
  );
}
