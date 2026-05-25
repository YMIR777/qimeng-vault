import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useAccounts } from '../store/useAccounts';
import { useBudgets } from '../store/useBudgets';
import { useRecurring } from '../store/useRecurring';
import { RecurringRuleCard } from '../components/recurring/RecurringRuleCard';
import { RecurringRuleModal } from '../components/recurring/RecurringRuleModal';
import type { RecurringRule } from '../store/db';
import { getSyncCode, setSyncCode } from '../supabase/client';

// ── isMobile hook (shared breakpoint: 480px) ─────────────────────
function useMobile(breakpoint = 480) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= breakpoint);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);
  return isMobile;
}

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

// ── SyncSettings: 跨设备同步码管理 ──────────────────────────────
function SyncSettings() {
  const [code, setCode] = useState(getSyncCode());
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'ok' | 'fail'>('idle');
  const [syncResult, setSyncResult] = useState('');

  const handleSyncNow = async () => {
    setSyncStatus('syncing');
    setSyncResult('');
    try {
      const { supabase } = await import('../supabase/client');
      const { db } = await import('../store/db');
      const code = getSyncCode();
      
      const txCount = await db.transactions.count();
      const wishCount = await db.wishes.count();
      const localInfo = `本地: ${txCount}笔记录, ${wishCount}个星体`;
      
      if (txCount === 0 && wishCount === 0) {
        setSyncStatus('fail');
        setSyncResult(`${localInfo}。没有数据可以同步。`);
        return;
      }
      
      // 测试：直接插入一条测试数据
      const testId = 'test-' + Date.now();
      const { error: testErr } = await supabase.from('transactions').insert({
        id: testId, type: 'income', amount: 1, date: Date.now(), createdAt: Date.now(), sync_code: code
      });
      if (testErr) {
        setSyncStatus('fail');
        setSyncResult(`${localInfo}。写入测试失败: ${testErr.message}`);
        return;
      }
      // 清理测试数据
      await supabase.from('transactions').delete().eq('id', testId).eq('sync_code', code);
      
      const { fullSync } = await import('../supabase/sync');
      const result = await fullSync();
      
      if (result.pushed === 0 && txCount > 0) {
        setSyncStatus('fail');
        setSyncResult(`${localInfo}。写入测试通过，但推送返回0。可能是字段不匹配。`);
        return;
      }
      
      setSyncStatus('ok');
      setSyncResult(`${localInfo}。拉取 ${result.pulled} 条，推送 ${result.pushed} 条`);
    } catch (err: any) {
      setSyncStatus('fail');
      setSyncResult(err?.message || String(err));
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-HTTPS or older browsers
      const el = document.createElement('textarea');
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLink = () => {
    if (!inputCode.trim() || inputCode.trim().length < 10) return;
    setSyncCode(inputCode.trim());
    setCode(inputCode.trim());
    setIsLinking(true);
    setInputCode('');
    // 刷新页面以触发 fullSync 拉取新设备的数据
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 手动同步 */}
      <div style={{
        background: css.card,
        borderRadius: '20px',
        padding: '24px',
        boxShadow: css.shadowRaised,
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: "'Noto Sans SC', sans-serif",
          fontSize: '11px',
          letterSpacing: '0.2em',
          color: css.textMuted,
          textTransform: 'uppercase',
          marginBottom: '14px',
        }}>同步状态</div>
        <button
          onClick={handleSyncNow}
          disabled={syncStatus === 'syncing'}
          style={{
            padding: '14px 32px',
            background: syncStatus === 'syncing' ? '#e0dbd3' : css.accentGold,
            border: 'none',
            borderRadius: '14px',
            color: syncStatus === 'syncing' ? '#b8af9e' : '#fff',
            fontSize: '15px',
            fontWeight: 500,
            cursor: syncStatus === 'syncing' ? 'not-allowed' : 'pointer',
            fontFamily: "'Noto Sans SC', sans-serif",
            boxShadow: syncStatus === 'syncing' ? 'none' : '3px 3px 8px #cdc5b8, -3px -3px 8px #fffbf5',
          }}
        >
          {syncStatus === 'syncing' ? '同步中...' : '立即同步'}
        </button>
        {syncResult && (
          <div style={{
            marginTop: '12px',
            fontSize: '12px',
            color: syncStatus === 'fail' ? '#d4a0a0' : '#7a9e7e',
            fontFamily: "'Noto Sans SC', sans-serif",
          }}>
            {syncStatus === 'fail' ? '失败: ' : ''}{syncResult}
          </div>
        )}
      </div>

      {/* 当前同步码 */}
      <div style={{
        background: css.card,
        borderRadius: '20px',
        padding: '24px',
        boxShadow: css.shadowRaised,
      }}>
        <div style={{
          fontFamily: "'Noto Sans SC', sans-serif",
          fontSize: '11px',
          letterSpacing: '0.2em',
          color: css.textMuted,
          textTransform: 'uppercase',
          marginBottom: '14px',
        }}>你的同步码</div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          background: css.bg,
          borderRadius: '12px',
          boxShadow: css.shadowInset,
          fontFamily: 'monospace',
          fontSize: '13px',
          color: css.text,
          wordBreak: 'break-all',
        }}>
          <span style={{ flex: 1 }}>{code}</span>
          <button
            onClick={handleCopy}
            style={{
              padding: '6px 14px',
              background: copied ? '#7a9e7e' : css.accentGold,
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: "'Noto Sans SC', sans-serif",
              whiteSpace: 'nowrap',
              transition: 'background 0.2s ease',
            }}
          >
            {copied ? '已复制' : '复制'}
          </button>
        </div>
        <p style={{
          fontSize: '11px',
          color: css.textSecondary,
          marginTop: '10px',
          lineHeight: 1.6,
        }}>
          这串代码代表你。在另一台设备输入相同同步码，数据就会互通。
        </p>
      </div>

      {/* 关联另一台设备 */}
      <div style={{
        background: css.card,
        borderRadius: '20px',
        padding: '24px',
        boxShadow: css.shadowRaised,
      }}>
        <div style={{
          fontFamily: "'Noto Sans SC', sans-serif",
          fontSize: '11px',
          letterSpacing: '0.2em',
          color: css.textMuted,
          textTransform: 'uppercase',
          marginBottom: '14px',
        }}>关联设备</div>
        {isLinking ? (
          <div style={{
            padding: '16px',
            textAlign: 'center',
            color: '#7a9e7e',
            fontSize: '14px',
            fontFamily: "'Noto Sans SC', sans-serif",
          }}>
            关联成功，正在同步数据...
          </div>
        ) : (
          <>
            <p style={{
              fontSize: '11px',
              color: css.textSecondary,
              marginBottom: '12px',
              lineHeight: 1.6,
            }}>
              在另一台设备打开「云同步」页面，复制同步码，粘贴到这里：
            </p>
            <input
              type="text"
              value={inputCode}
              onChange={e => setInputCode(e.target.value)}
              placeholder="粘贴另一台设备的同步码"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px 16px',
                background: css.bg,
                border: 'none',
                borderRadius: '12px',
                boxShadow: css.shadowInset,
                color: css.text,
                fontSize: '13px',
                fontFamily: 'monospace',
                outline: 'none',
                marginBottom: '12px',
              }}
            />
            <button
              onClick={handleLink}
              disabled={!inputCode.trim() || inputCode.trim().length < 10}
              style={{
                width: '100%',
                padding: '12px',
                background: inputCode.trim().length >= 10 ? css.accentGold : '#e0dbd3',
                border: 'none',
                borderRadius: '12px',
                color: inputCode.trim().length >= 10 ? '#fff' : '#b8af9e',
                fontSize: '14px',
                fontWeight: 500,
                cursor: inputCode.trim().length >= 10 ? 'pointer' : 'not-allowed',
                fontFamily: "'Noto Sans SC', sans-serif",
              }}
            >
              关联并同步
            </button>
          </>
        )}
      </div>

      {/* 安全说明 */}
      <div style={{
        padding: '16px 20px',
        borderRadius: '14px',
        background: 'rgba(201,146,58,0.06)',
        border: '1px solid rgba(201,146,58,0.12)',
      }}>
        <div style={{
          fontFamily: "'Noto Sans SC', sans-serif",
          fontSize: '11px',
          fontWeight: 500,
          color: css.accentGold,
          marginBottom: '6px',
        }}>
          关于安全
        </div>
        <p style={{
          fontSize: '10px',
          color: css.textSecondary,
          lineHeight: 1.7,
          margin: 0,
        }}>
          你的同步码是一串随机生成的唯一标识，别人无法猜到。只有输入相同同步码的设备才能看到同一份数据。请勿将同步码发给陌生人。
        </p>
      </div>
    </div>
  );
}

export default function Settings() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferFrom, setTransferFrom] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [editingRule, setEditingRule] = useState<RecurringRule | null>(null);
  const [activeTab, setActiveTab] = useState<'accounts' | 'recurring' | 'sync'>('accounts');

  const { rules, toggleActive, deleteRule, checkAndTrigger } = useRecurring();
  const { accounts, totalBalance, addAccount, deleteAccount, transfer } = useAccounts();
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAndTrigger();
  }, []);

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

  const isMobile = useMobile();
  const safeBottom = 'max(14px, env(safe-area-inset-bottom))';

  return (
    <div ref={pageRef} style={{
      padding: `40px ${isMobile ? '16px' : '24px'} calc(100px + ${safeBottom})`,
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
          fontSize: isMobile ? '18px' : '22px', fontWeight: 500,
          color: css.text, letterSpacing: '-0.01em', margin: 0,
        }}>账户管理</h1>
      </div>

      {/* TabBar */}
      <div className="animate-in" style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
      }}>
        <button onClick={() => setActiveTab('accounts')} style={{
          flex: 1, padding: '10px 0',
          background: activeTab === 'accounts' ? css.card : 'transparent',
          border: 'none', borderRadius: '12px',
          boxShadow: activeTab === 'accounts' ? css.shadowRaised : 'none',
          color: activeTab === 'accounts' ? css.text : css.textMuted,
          fontSize: '13px', fontWeight: 500,
          cursor: 'pointer', fontFamily: "'Noto Sans SC', sans-serif",
        }}>账户</button>
        <button onClick={() => setActiveTab('recurring')} style={{
          flex: 1, padding: '10px 0',
          background: activeTab === 'recurring' ? css.card : 'transparent',
          border: 'none', borderRadius: '12px',
          boxShadow: activeTab === 'recurring' ? css.shadowRaised : 'none',
          color: activeTab === 'recurring' ? css.text : css.textMuted,
          fontSize: '13px', fontWeight: 500,
          cursor: 'pointer', fontFamily: "'Noto Sans SC', sans-serif",
        }}>自动记账</button>
        <button onClick={() => setActiveTab('sync')} style={{
          flex: 1, padding: '10px 0',
          background: activeTab === 'sync' ? css.card : 'transparent',
          border: 'none', borderRadius: '12px',
          boxShadow: activeTab === 'sync' ? css.shadowRaised : 'none',
          color: activeTab === 'sync' ? css.text : css.textMuted,
          fontSize: '13px', fontWeight: 500,
          cursor: 'pointer', fontFamily: "'Noto Sans SC', sans-serif",
        }}>云同步</button>
      </div>

      {/* 云同步内容 */}
      {activeTab === 'sync' && <SyncSettings />}

      {/* 账户内容 */}
      {activeTab === 'accounts' && <>
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

      </>
      }

      {/* 自动记账内容 */}
      {activeTab === 'recurring' && <>
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '12px', fontWeight: 500, color: css.textMuted,
            letterSpacing: '0.08em', marginBottom: '14px',
          }}>
            周期规则
          </div>
          {rules.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '32px 0',
              color: css.textSecondary, fontSize: '14px',
            }}>还没有设置自动记账</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {rules.map(rule => (
                <RecurringRuleCard
                  key={rule.id}
                  rule={rule}
                  onToggleActive={toggleActive}
                  onEdit={setEditingRule}
                  onDelete={deleteRule}
                />
              ))}
            </div>
          )}
        </div>
      </>
      }

      {/* 预算配置 */}
      <BudgetSection />

      {/* 目标设置入口 */}
      <div className="animate-in" style={{ marginTop: '32px' }}>
        <div style={{
          fontFamily: "'Noto Sans SC', sans-serif",
          fontSize: '12px', fontWeight: 500, color: css.textMuted,
          letterSpacing: '0.08em', marginBottom: '14px',
        }}>
          目标与规划
        </div>
        <a
          href="/goals"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 20px',
            background: css.card,
            borderRadius: '16px',
            boxShadow: css.shadowRaised,
            textDecoration: 'none',
            color: css.text,
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '40px', height: '40px',
              borderRadius: '12px',
              background: css.accentGold,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="10" cy="10" r="7"/>
                <path d="M10 6v4l3 2"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "'Noto Sans SC', sans-serif", fontSize: '15px', fontWeight: 500 }}>
                目标设置
              </div>
              <div style={{ fontSize: '12px', color: css.textSecondary, marginTop: '2px' }}>
                收入/支出/储蓄目标，动态建议
              </div>
            </div>
          </div>
          <span style={{ color: css.textSecondary, fontSize: '16px' }}>→</span>
        </a>
      </div>

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

      {/* 自动记账弹窗 */}
      {showRecurringModal && (
        <RecurringRuleModal
          onClose={() => { setShowRecurringModal(false); setEditingRule(null); }}
          onSave={async (data) => {
            const { addRule, updateRule } = useRecurring.call({});
            if (editingRule) {
              await updateRule(editingRule.id, data);
            } else {
              await addRule(data);
            }
            setShowRecurringModal(false);
            setEditingRule(null);
          }}
          initialRule={editingRule ?? undefined}
        />
      )}

      {/* 新增规则按钮 */}
      {activeTab === 'recurring' && (
        <div className="animate-in" style={{
          position: 'fixed',
          bottom: '100px',
          right: '24px',
        }}>
          <button
            onClick={() => { setEditingRule(null); setShowRecurringModal(true); }}
            style={{
              width: '56px', height: '56px',
              borderRadius: '50%',
              background: css.accentGold,
              border: 'none',
              boxShadow: css.shadowRaised,
              color: '#fff',
              fontSize: '28px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >+</button>
        </div>
      )}
    </div>
  );
}
