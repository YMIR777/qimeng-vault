import { useState } from 'react';
import type { ParseResult } from './parseInput';

interface SupplementFormProps {
  initial: ParseResult;
  onConfirm: (result: ParseResult) => void;
  onCancel: () => void;
}

const PLATFORMS = ['比心', '微信', '抖音', '小红书', '建行', '招行'];
const EXPENSE_CATEGORIES = ['交通', '餐饮', '娱乐', '购物', '住房', '医疗', '通讯', '其他'];

export function SupplementForm({ initial, onConfirm, onCancel }: SupplementFormProps) {
  const [platform, setPlatform] = useState(initial.platform || '');
  const [category, setCategory] = useState(initial.category || '');
  const [bossName, setBossName] = useState(initial.bossName || '');
  const [amount, setAmount] = useState(String(initial.amount));

  function handleConfirm() {
    const result: ParseResult = {
      ...initial,
      platform: platform || undefined,
      category: category || initial.category,
      bossName: bossName || undefined,
      amount: parseFloat(amount) || 0,
      complete: true,
      missingFields: [],
    };
    onConfirm(result);
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 90,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: 'var(--bg-card)',
        borderRadius: '20px 20px 0 0',
        padding: '24px',
        borderTop: '1px solid var(--border-subtle)',
        animation: 'slideUp 0.3s var(--ease-out)',
      }}>
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

        <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: '18px', fontWeight: 400, marginBottom: '20px', textAlign: 'center' }}>
          补充信息
        </h3>

        {initial.type === 'income' && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', letterSpacing: '0.1em' }}>平台</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {PLATFORMS.map(p => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: `1.5px solid ${platform === p ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                    background: platform === p ? 'rgba(79,195,247,0.1)' : 'transparent',
                    color: platform === p ? 'var(--accent-blue)' : 'var(--text-secondary)',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {initial.type === 'expense' && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', letterSpacing: '0.1em' }}>分类</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {EXPENSE_CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: `1.5px solid ${category === c ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                    background: category === c ? 'rgba(232,184,75,0.1)' : 'transparent',
                    color: category === c ? 'var(--accent-gold)' : 'var(--text-secondary)',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', letterSpacing: '0.1em' }}>金额</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              textAlign: 'center',
              outline: 'none',
            }}
          />
        </div>

        {initial.type === 'income' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', letterSpacing: '0.1em' }}>老板名（可选）</label>
            <input
              type="text"
              value={bossName}
              onChange={(e) => setBossName(e.target.value)}
              placeholder="如：小明"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--glass-bg)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              background: 'transparent',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={(initial.type === 'income' && !platform) || !amount}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: (initial.type === 'income' && !platform) || !amount ? 'var(--border-subtle)' : 'var(--accent-blue)',
              color: (initial.type === 'income' && !platform) || !amount ? 'var(--text-muted)' : '#0D0D10',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: (initial.type === 'income' && !platform) || !amount ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
}