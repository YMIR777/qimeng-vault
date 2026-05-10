import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 1200
// 绮梦账间配色：暖米色粒子
const PARTICLE_COLOR = '#d4c4a8'
const LERP_FACTOR = 0.06

function Particles() {
  const pointsRef = useRef<THREE.Points>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const targetMouseRef = useRef({ x: 0, y: 0 })
  const { viewport } = useThree()

  const positions = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * viewport.width * 1.5
      pos[i * 3 + 1] = (Math.random() - 0.5) * viewport.height * 1.5
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2
    }
    return pos
  }, [viewport])

  const sizes = useMemo(() => {
    const s = new Float32Array(PARTICLE_COUNT)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      s[i] = Math.random() * 2 + 0.8
    }
    return s
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetMouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: -(e.clientY / window.innerHeight - 0.5) * 2,
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    const time = clock.getElapsedTime()

    // 呼吸动画：粒子群缓慢缩放
    const breathe = 1 + 0.02 * Math.sin((time / 3) * Math.PI * 2)
    pointsRef.current.scale.setScalar(breathe)

    // 鼠标跟随
    mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * LERP_FACTOR
    mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * LERP_FACTOR

    const geo = pointsRef.current.geometry
    const posAttr = geo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3
      const phase = i * 0.003
      posAttr.array[ix] += Math.sin(time * 0.4 + phase) * 0.001
      posAttr.array[ix + 1] += Math.cos(time * 0.3 + phase) * 0.001
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={PARTICLE_COLOR}
        size={2}
        sizeAttenuation={false}
        transparent
        opacity={0.65}
        depthWrite={false}
      />
    </points>
  )
}

interface ParticleBackgroundProps {
  style?: React.CSSProperties
}

export default function ParticleBackground({ style }: ParticleBackgroundProps) {
  return (
    <div style={{ position: 'absolute', inset: 0, ...style }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <Particles />
      </Canvas>
    </div>
  )
}
