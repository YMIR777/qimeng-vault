import { useState } from 'react';
import { parseInput, ParseResult } from './parseInput';

interface MagicInputProps {
  onSubmit: (result: ParseResult) => void;
}

export function MagicInput({ onSubmit }: MagicInputProps) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && value.trim()) {
      const result = parseInput(value.trim());
      onSubmit(result);
      setValue('');
    }
  }

  return (
    <div style={{
      position: 'relative',
    }}>
      <div style={{
        borderRadius: '16px',
        border: `1.5px solid ${focused ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        padding: '3px',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
        boxShadow: focused ? '0 0 0 1.5px var(--accent-blue), 0 6px 36px rgba(79,195,247,0.13)' : 'none',
      }}>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="输入金额，自动识别收入或支出…"
          style={{
            width: '100%',
            padding: '18px 24px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(15px, 2.5vw, 19px)',
            fontWeight: 400,
            letterSpacing: '0.05em',
            color: 'var(--text-primary)',
            textAlign: 'center',
            caretColor: 'var(--accent-gold)',
          }}
        />
      </div>
    </div>
  );
}