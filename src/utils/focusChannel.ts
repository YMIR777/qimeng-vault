/**
 * Global focus channel for MagicInput.
 * FAB dispatches 'quickadd:focus', MagicInput on Dashboard listens.
 */
export function requestMagicFocus() {
  window.dispatchEvent(new CustomEvent('quickadd:focus'));
}
