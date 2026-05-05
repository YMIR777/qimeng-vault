import { Canvas } from '@react-three/fiber';
import { ParticleField } from './ParticleField';

interface ParticleCanvasProps {
  count?: number;
  repelStrength?: number;
  gravity?: number;
}

export function ParticleCanvas({
  count = 300,
  repelStrength = 30,
  gravity = 30,
}: ParticleCanvasProps) {
  return (
    <Canvas
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background: 'transparent',
        pointerEvents: 'none',
      }}
      camera={{ position: [0, 0, 5], fov: 75 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ParticleField
        count={count}
        repelStrength={repelStrength}
        gravity={gravity}
      />
    </Canvas>
  );
}
