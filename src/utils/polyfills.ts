// crypto.randomUUID() polyfill — fallback for rare environments
if (typeof crypto === 'undefined' || typeof crypto.randomUUID !== 'function') {
  const _crypto = (typeof crypto !== 'undefined' ? crypto : {}) as Crypto;
  (_crypto as any).randomUUID = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  };
  (globalThis as any).crypto = _crypto;
}
