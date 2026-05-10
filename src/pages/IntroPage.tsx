import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import ParticleBackground from '../components/intro/ParticleBackground'
import TitleReveal from '../components/intro/TitleReveal'

export default function IntroPage() {
  const navigate = useNavigate()
  const [clicked, setClicked] = useState(false)
  const [hintVisible, setHintVisible] = useState(false)
  const flashRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLParagraphElement>(null)

  // 显示提示文字
  useEffect(() => {
    const timer = setTimeout(() => setHintVisible(true), 300 + 9 * 120 + 600)
    return () => clearTimeout(timer)
  }, [])

  // 提示文字脉冲动画
  useEffect(() => {
    if (!hintVisible || !hintRef.current) return
    gsap.to(hintRef.current, {
      opacity: 1,
      duration: 0.5,
      onComplete: () => {
        gsap.to(hintRef.current, {
          opacity: 0.5,
          duration: 1.2,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
        })
      },
    })
  }, [hintVisible])

  const handleClick = () => {
    if (clicked) return
    setClicked(true)
    gsap.killTweensOf(hintRef.current)

    const tl = gsap.timeline({
      onComplete: () => navigate('/dashboard'),
    })

    // 粒子向中心收缩
    tl.to('#particle-canvas', {
      scale: 0,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
      transformOrigin: 'center center',
    })

    // 标题淡出
    tl.to(
      '.intro-title',
      { opacity: 0, scale: 0.85, duration: 0.4, ease: 'power2.in' },
      0
    )

    // 白色闪光
    tl.to(
      flashRef.current,
      { opacity: 1, duration: 0.2, ease: 'power1.out' },
      0.3
    )
  }

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100dvh',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0ebe0',
        cursor: 'pointer',
      }}
    >
      {/* Three.js 粒子背景 */}
      <div id="particle-canvas" style={{ position: 'absolute', inset: 0 }}>
        <ParticleBackground />
      </div>

      {/* 白色闪光遮罩 */}
      <div
        ref={flashRef}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'white',
          pointerEvents: 'none',
          opacity: 0,
        }}
      />

      {/* 内容 */}
      <div
        className="intro-title"
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <TitleReveal text="绮梦账间" subtitle="Your Private Vault" />
      </div>

      {/* 点击提示 */}
      {hintVisible && (
        <p
          ref={hintRef}
          style={{
            position: 'absolute',
            bottom: '10vh',
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: "'Noto Serif SC', serif",
            fontSize: 'clamp(10px, 2vw, 13px)',
            color: '#a89f8e',
            letterSpacing: '0.2em',
            opacity: 0,
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          点击任意处继续
        </p>
      )}
    </div>
  )
}
