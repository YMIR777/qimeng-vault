export const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uMouseX;
  uniform float uMouseY;
  uniform float uRepelStrength;
  uniform float uGravity;
  uniform float uDamping;

  attribute float aScale;
  attribute float aColorMix;

  varying float vColorMix;
  varying float vAlpha;

  // Simplex noise helpers
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vColorMix = aColorMix;

    vec3 pos = position;

    // Flow field: noise-based organic drift
    float noiseScale = 0.6;
    float noiseSpeed = 0.12;
    vec3 noiseInput = vec3(pos.x * noiseScale, pos.y * noiseScale, uTime * noiseSpeed);
    float nx = snoise(noiseInput);
    float ny = snoise(noiseInput + vec3(4.3, 7.2, 1.5));
    float nz = snoise(noiseInput + vec3(2.1, 8.6, 3.8));

    // Gravity: gentle downward pull
    pos.y -= uGravity * 0.001 * (1.0 - aColorMix * 0.5 + 0.25);

    // Flow drift
    pos.x += nx * 0.012;
    pos.y += ny * 0.012;
    pos.z += nz * 0.008;

    // Mouse repulsion (in world space, z is ~0)
    vec2 mouse = vec2(uMouseX, uMouseY);
    vec2 diff = pos.xy - mouse;
    float dist = length(diff);
    float repelRadius = 1.8;
    if (dist < repelRadius && dist > 0.001) {
      float force = (1.0 - dist / repelRadius) * uRepelStrength * 0.1;
      pos.xy += normalize(diff) * force;
    }

    // Breathing pulse: subtle scale oscillation
    float pulse = sin(uTime * 0.4 + aColorMix * 6.28) * 0.05 + 1.0;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aScale * pulse * (280.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    // Alpha: fade near edges, pulse
    float edgeFade = smoothstep(2.5, 0.5, length(pos.xy));
    vAlpha = aColorMix * 0.7 + 0.3;
    vAlpha *= edgeFade * (0.85 + 0.15 * sin(uTime * 0.6 + aColorMix * 3.14));
  }
`;

export const fragmentShader = /* glsl */ `
  varying float vColorMix;
  varying float vAlpha;

  void main() {
    // Circular point with soft glow
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;

    // Dual color: ice blue + warm gold
    vec3 colorBlue = vec3(0.31, 0.76, 0.97);   // #4fc3f7
    vec3 colorGold = vec3(1.0, 0.84, 0.39);    // #ffd663
    vec3 baseColor = mix(colorBlue, colorGold, vColorMix);

    // Glow falloff
    float glow = 1.0 - smoothstep(0.0, 0.5, dist);
    glow = pow(glow, 1.6);

    // Ice blue particles: extra emissive bloom
    float isBlue = 1.0 - vColorMix;
    glow += isBlue * glow * 0.4;

    // Warm gold particles: slightly warmer
    vec3 warmTint = vec3(1.0, 0.92, 0.75);
    vec3 finalColor = mix(baseColor * warmTint, baseColor, isBlue);

    gl_FragColor = vec4(finalColor, glow * vAlpha);
  }
`;
