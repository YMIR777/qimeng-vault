import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { vertexShader, fragmentShader } from './particleShader';

interface ParticleFieldProps {
  count?: number;
  repelStrength?: number;
  gravity?: number;
}

export function ParticleField({ count = 300, repelStrength = 30, gravity = 28 }: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const { camera } = useThree();

  // Stable initial positions — world space at z=0, camera at z=5
  // Visible frustum at z=0: roughly ±(aspect*halfH, halfH) for fov 75 at camera z=5
  const geoRef = useRef<THREE.BufferGeometry>(null);
  const posAttrRef = useRef<THREE.BufferAttribute | null>(null);
  const scaleAttrRef = useRef<THREE.BufferAttribute | null>(null);
  const colorAttrRef = useRef<THREE.BufferAttribute | null>(null);

  const uniforms = useMemo(
    () => ({
      uTime:          { value: 0 },
      uMouseX:        { value: 0 },
      uMouseY:        { value: 0 },
      uRepelStrength: { value: repelStrength },
      uGravity:       { value: gravity },
    }),
    []
  );

  useEffect(() => {
    uniforms.uRepelStrength.value = repelStrength;
    uniforms.uGravity.value = gravity;
  }, [repelStrength, gravity, uniforms]);

  useFrame(({ clock, pointer }) => {
    if (!pointsRef.current) return;
    const mat = pointsRef.current.material as THREE.ShaderMaterial;
    mat.uniforms.uTime.value = clock.getElapsedTime();
    // Project pointer to world space at z=0
    const v = new THREE.Vector3(pointer.x, pointer.y, 0).unproject(camera);
    mat.uniforms.uMouseX.value = v.x;
    mat.uniforms.uMouseY.value = v.y;
  });

  // Initialize geometry imperatively — runs once
  useEffect(() => {
    if (!geoRef.current) return;

    const aspect = window.innerWidth / window.innerHeight;
    const fovRad = (75 * Math.PI) / 180;
    const halfH = Math.tan(fovRad / 2) * 5;
    const halfW = halfH * aspect;

    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const colorMixes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Random in world space — spread to fill visible frustum with margin
      const px = (Math.random() - 0.5) * halfW * 1.6;
      const py = (Math.random() - 0.5) * halfH * 1.6;
      positions[i * 3]     = px;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;

      scales[i] = Math.random() < 0.06 ? 2.5 + Math.random() * 1.5 : 0.6 + Math.random() * 0.8;
      colorMixes[i] = Math.random() < 0.3 ? Math.random() * 0.7 : 0;
    }

    // Positions
    const posAttr = new THREE.BufferAttribute(positions, 3);
    geoRef.current.setAttribute('position', posAttr);
    posAttrRef.current = posAttr;

    // Custom attributes
    const scaleAttr = new THREE.BufferAttribute(scales, 1);
    geoRef.current.setAttribute('aScale', scaleAttr);
    scaleAttrRef.current = scaleAttr;

    const colorAttr = new THREE.BufferAttribute(colorMixes, 1);
    geoRef.current.setAttribute('aColorMix', colorAttr);
    colorAttrRef.current = colorAttr;

    geoRef.current.computeBoundingSphere();
  }, [count]);

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geoRef} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}