import { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { parseInput } from './parseInput';
import type { ParseResult } from './parseInput';

interface MagicInputProps {
  onSubmit: (result: ParseResult) => void;
}

export interface MagicInputRef {
  focus: () => void;
}

export const MagicInput = forwardRef<MagicInputRef, MagicInputProps>(function MagicInput({ onSubmit }, ref) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      textareaRef.current?.focus();
      textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
  }));

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && value.trim()) {
      e.preventDefault();
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
        background: '#f0ebe0',
        boxShadow: focused
          ? 'inset 6px 6px 12px #c8c0b3, inset -6px -6px 12px #fffbf5'
          : 'inset 4px 4px 8px #cdc5b8, inset -4px -4px 8px #fffbf5',
        transition: `all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)`,
        padding: '4px',
      }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="写下今天做了什么…&#10;比如：涵涵给我存了1000块 / 打车回家花了35"
          rows={1}
          style={{
            width: '100%',
            padding: '18px 24px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: 'clamp(14px, 2.5vw, 17px)',
            fontWeight: 400,
            letterSpacing: '0.02em',
            color: '#3d3427',
            textAlign: 'center',
            caretColor: '#c9923a',
            resize: 'none',
            lineHeight: 1.6,
            minHeight: '56px',
          }}
        />
      </div>
    </div>
  );
});