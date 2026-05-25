// Custom service worker registration with update detection
if ('serviceWorker' in navigator) {
  let refreshing = false;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

      // Check for updates on every page load
      const checkUpdate = async () => {
        try {
          await registration.update();
          if (registration.waiting) {
            // Update available — show notification
            showUpdatePrompt();
          }
        } catch (e) {
          // Ignore update check failures
        }
      };

      // Check immediately
      checkUpdate();

      // Check on visibility change (user returns to app)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          checkUpdate();
        }
      });

      // Listen for new service worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdatePrompt();
          }
        });
      });
    } catch (e) {
      console.warn('SW registration failed:', e);
    }
  });

  function showUpdatePrompt() {
    // Check if already showing
    if (document.getElementById('sw-update-toast')) return;

    const toast = document.createElement('div');
    toast.id = 'sw-update-toast';
    toast.style.cssText = [
      'position:fixed', 'bottom:100px', 'left:50%', 'transform:translateX(-50%)', 'z-index:9999',
      'background:#3d3427', 'color:#f5f0e8', 'padding:12px 24px', 'border-radius:40px',
      'font-size:13px', 'font-family:sans-serif', 'box-shadow:0 8px 24px rgba(0,0,0,0.15)',
      'display:flex', 'align-items:center', 'gap:12px', 'cursor:pointer',
      'animation:fadeSlideUp 0.3s ease-out',
    ].join(';');

    toast.innerHTML = '新版本可用 · 点击更新';
    toast.addEventListener('click', () => {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      }
      window.location.reload();
    });

    // Auto-dismiss after 10s
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 10000);

    document.body.appendChild(toast);
  }
}
