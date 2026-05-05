import { useState, useCallback, useEffect } from 'react';
import { ParticleCanvas } from './components/particles';
import './styles/global.css';

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
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

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && inputValue.trim()) {
      setInputValue('');
    }
  }

  const isLight = theme === 'light';

  return (
    <div
      data-theme={theme}
      style={{
        position: 'relative',
        minHeight: '100dvh',
        background: 'var(--bg-primary)',
        transition: 'background 0.6s var(--ease-in-out)',
      }}
    >
      {/* Particle Background */}
      <ParticleCanvas count={320} repelStrength={32} gravity={28} />

      {/* Radial depth overlay — dark only */}
      {!isLight && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1,
            background:
              'radial-gradient(ellipse at 50% 50%, transparent 28%, rgba(4,4,6,0.58) 100%)',
            pointerEvents: 'none',
          }}
        />
      )}

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

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Lab Icon */}
            <button
              aria-label="粒子实验室"
              title="粒子实验室"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: '1px solid var(--border-subtle)',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition:
                  'border-color 0.25s ease, transform 0.2s var(--ease-spring)',
              }}
              onMouseEnter={(e) => {
                const btn = e.currentTarget as HTMLButtonElement;
                btn.style.borderColor = 'var(--accent-blue)';
                btn.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                const btn = e.currentTarget as HTMLButtonElement;
                btn.style.borderColor = 'var(--border-subtle)';
                btn.style.transform = 'scale(1)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="10.5" r="2.2" stroke="var(--accent-gold)" strokeWidth="1.1" />
                <path
                  d="M8 8.3V5.5M6.8 4.6L8 2.5L9.2 4.6"
                  stroke="var(--accent-gold)"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="4.2" cy="4.5" r="1" fill="var(--accent-blue)" opacity="0.65" />
                <circle cx="12" cy="5.5" r="0.75" fill="var(--accent-gold)" opacity="0.75" />
                <circle cx="2.8" cy="8" r="0.55" fill="var(--accent-blue)" opacity="0.45" />
                <circle cx="13.5" cy="8.5" r="0.5" fill="var(--accent-blue)" opacity="0.35" />
              </svg>
            </button>

            {/* Day/Night Toggle */}
            <button
              onClick={toggleTheme}
              aria-label={`切换到${isLight ? '深夜' : '暖白'}模式`}
              style={{
                width: 54,
                height: 28,
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'border-color 0.3s ease',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 2,
                  borderRadius: 'var(--radius-full)',
                  background: isLight
                    ? 'rgba(255,214,99,0.18)'
                    : 'rgba(79,195,247,0.07)',
                  transition: 'background 0.45s ease',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 3,
                  left: isLight ? 28 : 3,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: isLight ? 'var(--accent-gold)' : 'var(--accent-blue)',
                  boxShadow: isLight
                    ? '0 0 10px rgba(255,214,99,0.55)'
                    : '0 0 10px rgba(79,195,247,0.5)',
                  transition:
                    'left 0.38s var(--ease-spring), background 0.45s ease, box-shadow 0.45s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isLight ? (
                  // Sun
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <circle cx="5" cy="5" r="2.2" fill="#7a4f00" />
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                      <line
                        key={i}
                        x1="5" y1="1.2" x2="5" y2="0.3"
                        stroke="#7a4f00" strokeWidth="1.3" strokeLinecap="round"
                        transform={`rotate(${deg} 5 5)`}
                      />
                    ))}
                  </svg>
                ) : (
                  // Moon
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path
                      d="M5 1.8a3.2 3.2 0 1 0 3.2 5.2A4.5 4.5 0 0 1 5 1.8z"
                      fill="#0a2a40"
                    />
                  </svg>
                )}
              </div>
            </button>
          </div>
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
                textShadow: isLight
                  ? 'none'
                  : '0 0 48px rgba(79,195,247,0.12), 0 0 96px rgba(79,195,247,0.05)',
                transition: 'text-shadow 0.6s ease',
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
                  ? isLight
                    ? '0 0 0 1.5px var(--accent-gold), 0 6px 36px rgba(184,134,11,0.1)'
                    : '0 0 0 1.5px var(--accent-blue), 0 6px 36px rgba(79,195,247,0.13)'
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

        {/* Footer hint */}
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
          Move cursor to disturb particles
        </footer>
      </div>
    </div>
  );
}

export default App;
