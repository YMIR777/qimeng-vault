import { useState, useEffect } from 'react';
import './styles/global.css';

function App() {
  const [displayNumber, setDisplayNumber] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Animate asset number on mount
  useEffect(() => {
    const target = 12847.5;
    const duration = 1800;
    const start = performance.now();

    function easeOut(t: number) {
      return 1 - Math.pow(1 - t, 3);
    }

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayNumber(target * easeOut(progress));
      if (progress < 1) requestAnimationFrame(tick);
    }

    const timer = setTimeout(() => {
      setShowContent(true);
      requestAnimationFrame(tick);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && inputValue.trim()) {
      setInputValue('');
    }
  }

  return (
    <div
      data-theme="dark"
      style={{
        position: 'relative',
        minHeight: '100dvh',
        background: 'var(--bg-primary)',
        transition: 'background 0.6s var(--ease-in-out)',
      }}
    >
      {/* Main Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '28px 36px',
            opacity: showContent ? 1 : 0,
            transform: showContent ? 'translateY(0)' : 'translateY(-14px)',
            transition:
              'opacity 0.9s var(--ease-out), transform 0.9s var(--ease-out)',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(11px, 1.8vw, 15px)',
              fontWeight: 400,
              letterSpacing: '0.22em',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
            }}
          >
            绮梦账间
          </h1>
        </header>

        {/* Center Stage */}
        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 24px',
            gap: '0',
          }}
        >
          {/* Asset Number */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '52px',
              opacity: showContent ? 1 : 0,
              transform: showContent ? 'scale(1)' : 'scale(0.9)',
              transition:
                'opacity 1.1s var(--ease-out) 0.15s, transform 1.1s var(--ease-out) 0.15s',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(56px, 11vw, 104px)',
                fontWeight: 400,
                letterSpacing: '-0.025em',
                color: 'var(--text-primary)',
                lineHeight: 1,
                textShadow: 'none',
                userSelect: 'none',
              }}
            >
              ¥
              {displayNumber.toLocaleString('zh-CN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div
              style={{
                marginTop: 14,
                fontFamily: 'var(--font-body)',
                fontSize: '10px',
                letterSpacing: '0.28em',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              总资产
            </div>
          </div>

          {/* Magic Input */}
          <div
            style={{
              width: '100%',
              maxWidth: 500,
              opacity: showContent ? 1 : 0,
              transform: showContent ? 'translateY(0)' : 'translateY(18px)',
              transition:
                'opacity 0.95s var(--ease-out) 0.5s, transform 0.95s var(--ease-out) 0.5s',
            }}
          >
            <div
              className="glass-card"
              style={{
                padding: '3px',
                borderRadius: 'var(--radius-lg)',
                boxShadow: inputFocused
                  ? '0 0 0 1.5px var(--accent-blue), 0 6px 36px rgba(79,195,247,0.13)'
                  : 'none',
                transition: 'box-shadow 0.35s ease',
              }}
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
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
            <p
              style={{
                textAlign: 'center',
                marginTop: '11px',
                fontSize: '10px',
                letterSpacing: '0.14em',
                color: 'var(--text-muted)',
              }}
            >
              按 Enter 记录 · 示例：比心 150 / 打车 30
            </p>
          </div>
        </main>

        {/* Footer */}
        <footer
          style={{
            padding: '24px',
            textAlign: 'center',
            fontSize: '9px',
            letterSpacing: '0.22em',
            color: 'var(--text-muted)',
            opacity: showContent ? 0.45 : 0,
            transition: 'opacity 1s ease 1.2s',
            textTransform: 'uppercase',
          }}
        >
          绮梦账间
        </footer>
      </div>
    </div>
  );
}

export default App;
