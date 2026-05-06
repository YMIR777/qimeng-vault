import { useState } from 'react';
import { parseInput } from './parseInput';
import type { ParseResult } from './parseInput';

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
    <div style={{ position: 'relative' }}>
      {/* Neumorphic inset input area */}
      <div style={{
        borderRadius: '20px',
        background: '#e8edf2',
        boxShadow: focused
          ? 'inset 6px 6px 12px #b8c0cc, inset -6px -6px 12px #ffffff'
          : 'inset 4px 4px 8px #b8c0cc, inset -4px -4px 8px #ffffff',
        transition: `all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)`,
        padding: '4px',
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
            fontFamily: "'Noto Serif SC', serif",
            fontSize: 'clamp(15px, 2.5vw, 19px)',
            fontWeight: 400,
            letterSpacing: '0.05em',
            color: '#2d3748',
            textAlign: 'center',
            caretColor: '#d4a843',
          }}
        />
      </div>
    </div>
  );
}