import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface TitleRevealProps {
  text: string
  subtitle?: string
  style?: React.CSSProperties
}

export default function TitleReveal({ text, subtitle, style }: TitleRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const charsRef = useRef<HTMLSpanElement[]>([])

  useEffect(() => {
    if (!charsRef.current.length) return
    gsap.set(charsRef.current, { opacity: 0, y: 16 })
    gsap.to(charsRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out',
      stagger: 0.12,
      delay: 0.25,
    })
  }, [])

  const chars = text.split('')

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        ...style,
      }}
    >
      {/* 主标题 */}
      <h1
        style={{
          fontFamily: "'Noto Serif SC', serif",
          fontSize: 'clamp(2rem, 7vw, 3.5rem)',
          color: '#3d3427',
          letterSpacing: '0.08em',
          lineHeight: 1.2,
          textAlign: 'center',
        }}
      >
        {chars.map((char, i) => (
          <span
            key={i}
            ref={(el) => {
              if (el) charsRef.current[i] = el
            }}
            style={{ display: 'inline-block', whiteSpace: 'pre' }}
          >
            {char}
          </span>
        ))}
      </h1>

      {/* 副标题 */}
      {subtitle && (
        <p
          style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: 'clamp(9px, 2vw, 11px)',
            color: '#a89f8e',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            textAlign: 'center',
            marginTop: '4px',
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
