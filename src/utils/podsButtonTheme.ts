const STORAGE_KEY = 'pods-btn-theme';

const _themes = [
  'clean',
  'lift',
  'inset',
  'mechanical',
  'mechanical-deep',
  'keycap',
  'inset-lift',
  'spring',
  'stamp',
  'neumorphic',
  'glow',
  'accent-bar',
  'terminal',
  'ghost',
] as const;

export type ButtonThemeName = (typeof _themes)[number];
export const BUTTON_THEMES: readonly ButtonThemeName[] = _themes;

let _current: ButtonThemeName = 'inset';

const _listeners = new Set<() => void>();

export const getPodsButtonTheme = (): ButtonThemeName => _current;

export const setPodsButtonTheme = (t: ButtonThemeName) => {
  _current = t;
  localStorage.setItem(STORAGE_KEY, t);
  _listeners.forEach((fn) => fn());
};

export const cyclePodsButtonTheme = (dir: 1 | -1) => {
  const idx = _themes.indexOf(_current);
  const next = _themes[(idx + dir + _themes.length) % _themes.length];
  setPodsButtonTheme(next);
};

export const subscribePodsButtonTheme = (listener: () => void) => {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
};
