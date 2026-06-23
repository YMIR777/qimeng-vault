/**
 * 绮梦帐间 — Service Worker 注册 + 新版检测
 * 
 * 改进点：
 * - 每 5 分钟轮询检查新版本（不仅靠 load/visibility）
 * - 更新提示持久显示，不自动消失，直到用户点击
 * - 首次检测到更新时添加视觉脉冲效果
 */

(function () {
  if (!('serviceWorker' in navigator)) return;

  let refreshing = false;
  let updateTimer = null;
  const POLL_INTERVAL = 5 * 60 * 1000; // 5 分钟

  // ── controller 切换后自动刷新 ──
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });

  // ── SW 注册 + 更新检测 ──
  window.addEventListener('load', async () => {
    let registration;

    try {
      registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    } catch (e) {
      console.warn('[SW] 注册失败:', e);
      return;
    }

    /** 检查是否有更新 */
    const checkUpdate = async () => {
      try {
        await registration.update();
        if (registration.waiting) {
          showUpdatePrompt();
        }
      } catch (e) {
        // 网络问题，静默忽略
      }
    };

    // ── 触发源 1: 立即检查 ──
    checkUpdate();

    // ── 触发源 2: 每 5 分钟轮询 ──
    updateTimer = setInterval(checkUpdate, POLL_INTERVAL);

    // ── 触发源 3: 页面恢复前台 ──
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkUpdate();
      }
    });

    // ── 触发源 4: 窗口获得焦点（从其他应用切回来） ──
    window.addEventListener('focus', () => {
      checkUpdate();
    });

    // ── 触发源 5: 注册时发现已安装新 worker ──
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          showUpdatePrompt();
        }
      });
    });

    // ── 触发源 6: 监听来自 SW 的消息（可用于推送触发检查） ──
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'CHECK_UPDATE') {
        checkUpdate();
      }
    });
  });

  // ── 页面卸载时清理定时器 ──
  window.addEventListener('beforeunload', () => {
    if (updateTimer) {
      clearInterval(updateTimer);
      updateTimer = null;
    }
  });

  // ── 更新提示 UI ──
  function showUpdatePrompt() {
    // 防重复
    if (document.getElementById('sw-update-toast')) return;

    const toast = document.createElement('div');
    toast.id = 'sw-update-toast';

    // 内联样式：底部胶囊按钮
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '100px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: '9999',
      background: '#3d3427',
      color: '#f5f0e8',
      padding: '12px 24px',
      borderRadius: '40px',
      fontSize: '14px',
      fontFamily: 'system-ui, -apple-system, "Noto Sans SC", sans-serif',
      fontWeight: '500',
      boxShadow: '0 8px 32px rgba(61,52,39,0.25), 0 0 0 2px rgba(201,146,58,0.4)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      cursor: 'pointer',
      userSelect: 'none',
      animation: 'swSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      letterSpacing: '0.02em',
      transition: 'box-shadow 0.3s',
    });

    // 脉冲动画：持续吸引注意
    const pulseStyle = document.createElement('style');
    pulseStyle.textContent = `
      @keyframes swSlideUp {
        from { transform: translateX(-50%) translateY(20px); opacity: 0; }
        to   { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
      @keyframes swPulse {
        0%, 100% { box-shadow: 0 8px 32px rgba(61,52,39,0.25), 0 0 0 2px rgba(201,146,58,0.4); }
        50%      { box-shadow: 0 8px 32px rgba(61,52,39,0.25), 0 0 0 6px rgba(201,146,58,0.15); }
      }
      #sw-update-toast {
        animation: swSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), swPulse 2s ease-in-out 2s infinite;
      }
    `;
    document.head.appendChild(pulseStyle);

    // 图标 + 文字 + 箭头
    toast.innerHTML = `
      <span style="font-size:18px;line-height:1;">✨</span>
      <span>新版本可用 · 点击更新</span>
      <span style="font-size:16px;opacity:0.6;">→</span>
    `;

    // 点击 → 跳过等待 + 刷新
    toast.addEventListener('click', () => {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      }
      // 备用：直接刷新
      setTimeout(() => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      }, 500);
    });

    // hover 效果
    toast.addEventListener('mouseenter', () => {
      toast.style.boxShadow = '0 8px 36px rgba(61,52,39,0.35), 0 0 0 3px rgba(201,146,58,0.5)';
    });
    toast.addEventListener('mouseleave', () => {
      toast.style.boxShadow = '';
    });

    document.body.appendChild(toast);
  }
})();
