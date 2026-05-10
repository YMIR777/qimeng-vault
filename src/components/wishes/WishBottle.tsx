import React, { useRef, useEffect, useCallback } from 'react';

type WishStatus = 'building' | 'achieved' | 'withdrawn';

interface WishBottleProps {
  name: string;
  currentBalance: number;
  targetPrice: number;
  status: WishStatus;
  onClick?: () => void;
}

// ── 配色 ──────────────────────────────────────────────────────────
const PALETTE = {
  building: {
    particles: ['#6b9fcf', '#8bb8e8', '#a8d0f0', '#4a8bc7'],
    surface: '#6b9fcf',
    glow: 'rgba(107,159,207,0.3)',
  },
  achieved: {
    particles: ['#c9923a', '#e8c97a', '#f0d890', '#d4a843', '#f5e0a8'],
    surface: '#c9923a',
    glow: 'rgba(201,146,58,0.4)',
  },
  withdrawn: {
    particles: ['#c5bdb0', '#d8d0c5', '#b0a898'],
    surface: '#c5bdb0',
    glow: 'rgba(197,189,176,0.2)',
  },
} as const;

const SVG_W = 120;
const SVG_H = 180;
const BODY_TOP = 50;
const BODY_BOTTOM = 170;
const BODY_HEIGHT = BODY_BOTTOM - BODY_TOP;

// ── 粒子类型 ────────────────────────────────────────────────────────
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  color: string;
  type: 'dust' | 'bubble' | 'star';
  twinkle: number;
}

export const WishBottle: React.FC<WishBottleProps> = ({
  name,
  currentBalance,
  targetPrice,
  status,
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);

  const percentage = Math.min((currentBalance / targetPrice) * 100, 100);
  const colors = PALETTE[status];
  const isAchieved = status === 'achieved';

  // 瓶身水平边界函数（根据 y 坐标返回 [left, right]）
  const getBottleBounds = useCallback((y: number): [number, number] => {
    if (y < 40) return [45, 75]; // 瓶颈
    if (y < 50) {
      const t = (y - 40) / 10;
      return [45 - t * 10, 75 + t * 10];
    }
    // 瓶身曲线近似
    const bodyT = Math.min(Math.max((y - 50) / 120, 0), 1);
    const width = 35 + Math.sin(bodyT * Math.PI) * 25;
    const center = 60;
    return [center - width, center + width];
  }, []);

  // 生成粒子
  const spawnParticle = useCallback((fillY: number): Particle => {
    const [left, right] = getBottleBounds(BODY_BOTTOM - 5);
    const y = BODY_BOTTOM - Math.random() * (BODY_BOTTOM - fillY - 5);
    const color = colors.particles[Math.floor(Math.random() * colors.particles.length)];
    const isStar = isAchieved && Math.random() < 0.08;
    const isBubble = !isStar && Math.random() < 0.15;

    return {
      x: left + Math.random() * (right - left),
      y,
      vx: (Math.random() - 0.5) * 0.3,
      vy: isBubble ? -0.3 - Math.random() * 0.4 : -0.15 - Math.random() * 0.25,
      size: isStar ? 2.5 : isBubble ? 2 + Math.random() * 2 : 1 + Math.random() * 1.5,
      opacity: 0,
      life: 0,
      maxLife: isBubble ? 180 + Math.random() * 120 : 120 + Math.random() * 100,
      color,
      type: isStar ? 'star' : isBubble ? 'bubble' : 'dust',
      twinkle: Math.random() * Math.PI * 2,
    };
  }, [colors, getBottleBounds, isAchieved]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SVG_W * dpr;
    canvas.height = SVG_H * dpr;
    ctx.scale(dpr, dpr);

    particlesRef.current = [];
    timeRef.current = 0;

    const animate = () => {
      const t = timeRef.current++;
      const fillHeight = (percentage / 100) * BODY_HEIGHT;
      const fillY = BODY_BOTTOM - fillHeight;

      // 清空
      ctx.clearRect(0, 0, SVG_W, SVG_H);

      // ── 绘制渐变填充背景 ──────────────────────────────────────
      if (fillHeight > 0) {
        const grad = ctx.createLinearGradient(0, BODY_BOTTOM, 0, fillY);
        if (status === 'building') {
          grad.addColorStop(0, 'rgba(107,159,207,0.35)');
          grad.addColorStop(0.5, 'rgba(107,159,207,0.2)');
          grad.addColorStop(1, 'rgba(168,208,240,0.1)');
        } else if (status === 'achieved') {
          grad.addColorStop(0, 'rgba(201,146,58,0.45)');
          grad.addColorStop(0.5, 'rgba(232,201,122,0.25)');
          grad.addColorStop(1, 'rgba(240,216,144,0.12)');
        } else {
          grad.addColorStop(0, 'rgba(197,189,176,0.25)');
          grad.addColorStop(1, 'rgba(216,208,197,0.08)');
        }

        // 填充瓶身形状（简化版，用曲线近似）
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(35, Math.max(fillY, 55));
        ctx.quadraticCurveTo(35, 40, 45, 40);
        ctx.lineTo(75, 40);
        ctx.quadraticCurveTo(85, 40, 85, 50);
        ctx.lineTo(85, 55);
        ctx.quadraticCurveTo(110, 70, 110, 100);
        ctx.quadraticCurveTo(110, 140, 85, 155);
        ctx.quadraticCurveTo(70, 165, 50, 165);
        ctx.quadraticCurveTo(30, 165, 15, 155);
        ctx.quadraticCurveTo(10, 140, 10, 100);
        ctx.quadraticCurveTo(10, 70, 35, 55);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      }

      // ── 液面波浪光带 ────────────────────────────────────────────
      if (fillHeight > 5) {
        const waveY = fillY + Math.sin(t * 0.03) * 2;
        ctx.save();
        ctx.beginPath();
        const [left, right] = getBottleBounds(waveY);
        ctx.moveTo(left, waveY);
        for (let wx = left; wx <= right; wx += 2) {
          const wy = waveY + Math.sin((wx + t * 1.5) * 0.08) * 1.5;
          ctx.lineTo(wx, wy);
        }
        ctx.lineTo(right, waveY + 8);
        ctx.lineTo(left, waveY + 8);
        ctx.closePath();
        ctx.fillStyle = colors.glow;
        ctx.fill();
        ctx.restore();
      }

      // ── 粒子系统 ────────────────────────────────────────────────
      // 维护粒子数量
      const targetCount = Math.floor(percentage * 0.8) + (isAchieved ? 15 : 5);
      while (particlesRef.current.length < targetCount) {
        particlesRef.current.push(spawnParticle(fillY));
      }
      if (particlesRef.current.length > targetCount + 10) {
        particlesRef.current.splice(0, particlesRef.current.length - targetCount);
      }

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx + Math.sin(t * 0.02 + p.twinkle) * 0.2;
        p.y += p.vy;

        // 淡出逻辑
        const lifeRatio = p.life / p.maxLife;
        let alpha: number;
        if (lifeRatio < 0.15) alpha = lifeRatio / 0.15; // 淡入
        else if (lifeRatio > 0.7) alpha = 1 - (lifeRatio - 0.7) / 0.3; // 淡出
        else alpha = 1;

        // 接近液面加速淡出
        if (p.y < fillY + 8) {
          alpha *= Math.max(0, (p.y - fillY) / 8);
        }

        // 闪烁
        const twinkle = 0.7 + 0.3 * Math.sin(t * 0.08 + p.twinkle * 3);
        p.opacity = alpha * twinkle;

        // 边界限制
        const [bLeft, bRight] = getBottleBounds(p.y);
        if (p.x < bLeft + 3) p.x = bLeft + 3;
        if (p.x > bRight - 3) p.x = bRight - 3;
        if (p.y < fillY || p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        // 绘制粒子
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));

        if (p.type === 'star') {
          // 绘制四角星
          const s = p.size;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          for (let si = 0; si < 4; si++) {
            const angle = (si * Math.PI) / 2 - Math.PI / 4;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + Math.cos(angle) * s * 2, p.y + Math.sin(angle) * s * 2);
            ctx.lineTo(p.x + Math.cos(angle + 0.3) * s, p.y + Math.sin(angle + 0.3) * s);
          }
          ctx.closePath();
          ctx.fill();
          // 光晕
          ctx.beginPath();
          ctx.arc(p.x, p.y, s * 3, 0, Math.PI * 2);
          ctx.fillStyle = p.color.replace(')', ',0.15)').replace('rgb', 'rgba');
          ctx.fill();
        } else if (p.type === 'bubble') {
          // 气泡：带高光
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(p.x - p.size * 0.25, p.y - p.size * 0.25, p.size * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha *= 0.4;
          ctx.fill();
        } else {
          // 尘埃：带光晕
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = p.color.replace(')', ',0.15)').replace('rgb', 'rgba');
          ctx.fill();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha *= 0.8;
          ctx.fill();
        }

        ctx.restore();
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [percentage, status, colors, spawnParticle, getBottleBounds, isAchieved]);

  return (
    <div
      style={{
        background: '#f0ebe0',
        borderRadius: '18px',
        padding: '20px',
        boxShadow: '5px 5px 10px #cdc5b8, -5px -5px 10px #fffbf5',
        display: 'inline-block',
        cursor: 'pointer',
        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        userSelect: 'none',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.02)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
      }}
      onMouseDown={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(0.97)';
      }}
      onMouseUp={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.02)';
      }}
      onClick={onClick}
    >
      <div style={{ position: 'relative', width: SVG_W, height: SVG_H, margin: '0 auto' }}>
        {/* Canvas 粒子层 */}
        <canvas
          ref={canvasRef}
          width={SVG_W}
          height={SVG_H}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: SVG_W,
            height: SVG_H,
          }}
        />

        {/* SVG 瓶身轮廓层（透明填充，只显示描边） */}
        <svg
          width={SVG_W}
          height={SVG_H}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
          }}
        >
          {isAchieved && (
            <defs>
              <filter id={`glow-${name}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          )}

          {/* 瓶身轮廓（透明内部） */}
          <path
            d="M 35 50 Q 35 40 45 40 L 75 40 Q 85 40 85 50 L 85 55 Q 110 70 110 100 Q 110 140 85 155 Q 70 165 50 165 Q 30 165 15 155 Q 10 140 10 100 Q 10 70 35 55 Z"
            fill="none"
            stroke="#c5bdb0"
            strokeWidth="1.5"
            filter={isAchieved ? `url(#glow-${name})` : undefined}
          />

          {/* 瓶颈 */}
          <rect
            x="45"
            y="20"
            width="30"
            height="25"
            rx="3"
            fill="none"
            stroke="#c5bdb0"
            strokeWidth="1.5"
          />

          {/* 瓶塞 */}
          <rect
            x="48"
            y="12"
            width="24"
            height="12"
            rx="3"
            fill="#d4c4a8"
            stroke="#c5bdb0"
            strokeWidth="1"
          />

          {/* 底部进度条 */}
          <rect
            x="10"
            y={BODY_BOTTOM + 6}
            width={100}
            height="4"
            rx="2"
            fill="#e0dbd3"
          />
          <rect
            x="10"
            y={BODY_BOTTOM + 6}
            width={percentage}
            height="4"
            rx="2"
            fill={colors.surface}
            style={{ transition: 'width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          />
        </svg>
      </div>

      {/* 标签 */}
      <div style={{ textAlign: 'center', marginTop: '8px' }}>
        <div style={{ fontSize: '13px', color: '#3d3427', fontWeight: 500 }}>
          {name}
        </div>
        <div style={{ fontSize: '11px', color: '#a89f8e', marginTop: '2px' }}>
          ¥{currentBalance.toLocaleString()} / ¥{targetPrice.toLocaleString()}
        </div>
      </div>
    </div>
  );
};
