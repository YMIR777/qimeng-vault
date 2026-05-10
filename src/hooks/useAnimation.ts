import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * 通用页面入场动画 hook
 * @param deps 依赖数组，变化时重新触发动画
 */
export function useEntranceAnimation(deps: unknown[] = []) {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pageRef.current) return;
    const sections = pageRef.current.querySelectorAll('.animate-in');
    if (sections.length === 0) return;

    gsap.fromTo(
      sections,
      { y: 36, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.65, stagger: 0.1, ease: 'power2.out', delay: 0.1 }
    );
  }, deps);

  return pageRef;
}

/**
 * 列表项交错入场
 * @param selector CSS 选择器
 * @param delay 延迟
 */
export function useListAnimation(selector: string, deps: unknown[] = [], delay = 0.3) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll(selector);
    if (items.length === 0) return;

    gsap.fromTo(
      items,
      { x: -24, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay }
    );
  }, deps);

  return listRef;
}

/**
 * 数字滚动动画（从 0 滚动到目标值）
 * @param target 目标值
 * @param duration 持续时间（秒）
 * @param delay 延迟
 */
export function useCountUp(target: number, duration = 1, delay = 0) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration,
      delay,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = Math.round(obj.val).toLocaleString();
      },
    });
  }, [target, duration, delay]);

  return ref;
}
