import React, { useSyncExternalStore } from 'react';
import {
  getPodsButtonTheme,
  subscribePodsButtonTheme,
  type ButtonThemeName,
} from 'utils/podsButtonTheme';

// Inject spinner keyframe once on module load
if (typeof document !== 'undefined') {
  const _sid = '_pbSpinStyle';
  if (!document.getElementById(_sid)) {
    const _s = document.createElement('style');
    _s.id = _sid;
    _s.textContent = '@keyframes _pbSpin{to{transform:rotate(360deg)}}';
    document.head.appendChild(_s);
  }
}

// ── shared base ───────────────────────────────────────────────────────────────

const BASE: React.CSSProperties = {
  fontSize: '0.72rem',
  fontWeight: 500,
  fontFamily: 'inherit',
  cursor: 'pointer',
  border: 'none',
  outline: 'none',
  background: 'none',
  padding: 0,
  lineHeight: 1,
  flexShrink: 0,
  whiteSpace: 'nowrap',
};

// ── theme → handlers ──────────────────────────────────────────────────────────

interface Handlers {
  onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseDown?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseUp?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

type ThemeConfig = {
  style: (active: boolean) => React.CSSProperties;
  activeStyle?: React.CSSProperties;
} & Handlers;

const h = (el: React.MouseEvent) => el.currentTarget as HTMLButtonElement;

const THEMES: Record<ButtonThemeName, ThemeConfig> = {
  clean: {
    style: (active) => ({
      ...BASE,
      padding: '0.34em 0.85em',
      border: `1px solid ${
        active ? 'rgba(25,118,210,0.45)' : 'rgba(0,0,0,0.2)'
      }`,
      borderRadius: 4,
      background: '#fff',
      color: active ? 'rgba(25,118,210,0.85)' : 'rgba(0,0,0,0.5)',
      transition: 'border-color 0.07s, color 0.07s',
      fontWeight: active ? 600 : 500,
    }),
    onMouseEnter: (e) => {
      const el = h(e);
      el.style.borderColor = 'rgba(0,0,0,0.45)';
      el.style.color = 'rgba(0,0,0,0.7)';
    },
    onMouseLeave: (e) => {
      const el = h(e);
      el.style.borderColor = 'rgba(0,0,0,0.2)';
      el.style.color = 'rgba(0,0,0,0.5)';
    },
  },

  lift: {
    style: (active) => ({
      ...BASE,
      padding: '0.34em 0.85em',
      border: `1px solid ${
        active ? 'rgba(25,118,210,0.35)' : 'rgba(0,0,0,0.14)'
      }`,
      borderRadius: 4,
      background: active ? 'rgba(25,118,210,0.06)' : '#fff',
      color: active ? 'rgba(25,118,210,0.85)' : 'rgba(0,0,0,0.5)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      transform: 'translateY(0)',
      transition: 'transform 0.06s ease, box-shadow 0.06s ease',
      fontWeight: active ? 600 : 500,
    }),
    onMouseEnter: (e) => {
      const el = h(e);
      el.style.transform = 'translateY(-2px)';
      el.style.boxShadow = '0 4px 10px rgba(0,0,0,0.13)';
    },
    onMouseLeave: (e) => {
      const el = h(e);
      el.style.transform = 'translateY(0)';
      el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
    },
    onMouseDown: (e) => {
      const el = h(e);
      el.style.transform = 'translateY(1px)';
      el.style.boxShadow = '0 0 2px rgba(0,0,0,0.1)';
    },
    onMouseUp: (e) => {
      const el = h(e);
      el.style.transform = 'translateY(-2px)';
      el.style.boxShadow = '0 4px 10px rgba(0,0,0,0.13)';
    },
  },

  inset: {
    style: (active) => ({
      ...BASE,
      padding: '0.52em 0.9em',
      border: `1px solid ${
        active ? 'rgba(25,118,210,0.3)' : 'rgba(0,0,0,0.14)'
      }`,
      borderRadius: 4,
      background: active ? 'rgba(25,118,210,0.06)' : '#fdfdfd',
      color: active ? 'rgba(25,118,210,0.85)' : 'rgba(0,0,0,0.45)',
      boxShadow: active
        ? 'inset 0 2px 4px rgba(0,0,0,0.1)'
        : '0 1px 2px rgba(0,0,0,0.07)',
      transition: 'background 0.04s, box-shadow 0.02s',
      fontWeight: active ? 600 : 500,
    }),
    onMouseEnter: (e) => {
      h(e).style.background = '#efefef';
    },
    onMouseLeave: (e) => {
      const el = h(e);
      el.style.background = '#fdfdfd';
      el.style.boxShadow = '0 1px 2px rgba(0,0,0,0.07)';
    },
    onMouseDown: (e) => {
      const el = h(e);
      el.style.transition = 'none';
      el.style.boxShadow = '0 1px 2px rgba(0,0,0,0.07)';
      el.style.background = '#efefef';
      requestAnimationFrame(() => {
        el.style.transition = 'background 0.04s, box-shadow 0.03s';
        el.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.13)';
        el.style.background = '#e8e8e8';
      });
    },
    onMouseUp: (e) => {
      const el = h(e);
      el.style.boxShadow = '0 1px 2px rgba(0,0,0,0.07)';
      el.style.background = '#efefef';
    },
  },

  mechanical: {
    style: (active) => ({
      ...BASE,
      padding: '0.34em 0.85em',
      border: `1px solid ${
        active ? 'rgba(25,118,210,0.35)' : 'rgba(0,0,0,0.2)'
      }`,
      borderRadius: 4,
      background: active ? 'rgba(25,118,210,0.05)' : '#fff',
      color: active ? 'rgba(25,118,210,0.85)' : 'rgba(0,0,0,0.5)',
      boxShadow: active ? '0 0 0 rgba(0,0,0,0.22)' : '0 3px 0 rgba(0,0,0,0.22)',
      transform: active ? 'translateY(3px)' : 'translateY(0)',
      transition: 'transform 0.06s ease, box-shadow 0.06s ease',
      fontWeight: active ? 600 : 500,
    }),
    onMouseDown: (e) => {
      const el = h(e);
      // Snap to rest first so every click has visible travel
      el.style.transition = 'none';
      el.style.transform = 'translateY(0)';
      el.style.boxShadow = '0 3px 0 rgba(0,0,0,0.22)';
      requestAnimationFrame(() => {
        el.style.transition = 'transform 0.04s ease, box-shadow 0.04s ease';
        el.style.transform = 'translateY(3px)';
        el.style.boxShadow = '0 0 0 rgba(0,0,0,0.22)';
      });
    },
    onMouseUp: (e) => {
      const el = h(e);
      el.style.transition = 'transform 0.07s ease, box-shadow 0.07s ease';
      el.style.transform = 'translateY(0)';
      el.style.boxShadow = '0 3px 0 rgba(0,0,0,0.22)';
    },
    onMouseLeave: (e) => {
      const el = h(e);
      el.style.transition = 'transform 0.07s ease, box-shadow 0.07s ease';
      el.style.transform = 'translateY(0)';
      el.style.boxShadow = '0 3px 0 rgba(0,0,0,0.22)';
    },
  },

  'mechanical-deep': {
    style: (active) => ({
      ...BASE,
      padding: '0.34em 0.85em',
      border: '1px solid rgba(0,0,0,0.22)',
      borderRadius: 4,
      background: active ? 'rgba(25,118,210,0.05)' : '#fafafa',
      color: active ? 'rgba(25,118,210,0.85)' : 'rgba(0,0,0,0.5)',
      boxShadow: active
        ? '0 0 0 rgba(0,0,0,0.18)'
        : '0 5px 0 rgba(0,0,0,0.18), 0 6px 3px rgba(0,0,0,0.08)',
      transform: active ? 'translateY(5px)' : 'translateY(0)',
      transition: 'transform 0.07s ease, box-shadow 0.07s ease',
      fontWeight: active ? 600 : 500,
    }),
    onMouseDown: (e) => {
      const el = h(e);
      el.style.transform = 'translateY(5px)';
      el.style.boxShadow = '0 0 0 rgba(0,0,0,0.18)';
    },
    onMouseUp: (e) => {
      const el = h(e);
      el.style.transform = 'translateY(0)';
      el.style.boxShadow =
        '0 5px 0 rgba(0,0,0,0.18), 0 6px 3px rgba(0,0,0,0.08)';
    },
    onMouseLeave: (e) => {
      const el = h(e);
      el.style.transform = 'translateY(0)';
      el.style.boxShadow =
        '0 5px 0 rgba(0,0,0,0.18), 0 6px 3px rgba(0,0,0,0.08)';
    },
  },

  keycap: {
    style: (active) => ({
      ...BASE,
      padding: '0.34em 0.85em',
      border: `1px solid ${
        active ? 'rgba(25,118,210,0.3)' : 'rgba(0,0,0,0.18)'
      }`,
      borderRadius: 5,
      background: active
        ? 'linear-gradient(to bottom,rgba(25,118,210,0.08) 0%,rgba(25,118,210,0.04) 100%)'
        : 'linear-gradient(to bottom,#ffffff 0%,#f2f2f2 100%)',
      color: active ? 'rgba(25,118,210,0.85)' : 'rgba(0,0,0,0.52)',
      boxShadow: active
        ? '0 1px 0 #c8c8c8'
        : '0 4px 0 #c8c8c8, 0 5px 4px rgba(0,0,0,0.14)',
      transform: active ? 'translateY(3px)' : 'translateY(0)',
      transition: 'transform 0.06s ease, box-shadow 0.06s ease',
      fontWeight: active ? 600 : 500,
    }),
    onMouseDown: (e) => {
      const el = h(e);
      el.style.transition = 'none';
      el.style.transform = 'translateY(0)';
      el.style.boxShadow = '0 4px 0 #c8c8c8, 0 5px 4px rgba(0,0,0,0.14)';
      requestAnimationFrame(() => {
        el.style.transition = 'transform 0.04s ease, box-shadow 0.04s ease';
        el.style.transform = 'translateY(3px)';
        el.style.boxShadow = '0 1px 0 #c8c8c8, 0 2px 2px rgba(0,0,0,0.1)';
      });
    },
    onMouseUp: (e) => {
      const el = h(e);
      el.style.transition = 'transform 0.07s ease, box-shadow 0.07s ease';
      el.style.transform = 'translateY(0)';
      el.style.boxShadow = '0 4px 0 #c8c8c8, 0 5px 4px rgba(0,0,0,0.14)';
    },
    onMouseLeave: (e) => {
      const el = h(e);
      el.style.transition = 'transform 0.07s ease, box-shadow 0.07s ease';
      el.style.transform = 'translateY(0)';
      el.style.boxShadow = '0 4px 0 #c8c8c8, 0 5px 4px rgba(0,0,0,0.14)';
    },
  },

  'inset-lift': {
    style: (active) => ({
      ...BASE,
      padding: '0.34em 0.85em',
      border: `1px solid ${
        active ? 'rgba(25,118,210,0.3)' : 'rgba(0,0,0,0.14)'
      }`,
      borderRadius: 4,
      background: active ? 'rgba(25,118,210,0.06)' : '#fff',
      color: active ? 'rgba(25,118,210,0.85)' : 'rgba(0,0,0,0.5)',
      boxShadow: active
        ? 'inset 0 2px 5px rgba(0,0,0,0.13)'
        : '0 1px 3px rgba(0,0,0,0.08)',
      transform: 'translateY(0)',
      transition: 'transform 0.03s ease, box-shadow 0.03s ease',
      fontWeight: active ? 600 : 500,
    }),
    onMouseEnter: (e) => {
      const el = h(e);
      el.style.transform = 'translateY(-2px)';
      el.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    },
    onMouseLeave: (e) => {
      const el = h(e);
      el.style.transform = 'translateY(0)';
      el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
    },
    onMouseDown: (e) => {
      const el = h(e);
      el.style.transform = 'translateY(0)';
      el.style.boxShadow = 'inset 0 2px 5px rgba(0,0,0,0.13)';
    },
    onMouseUp: (e) => {
      const el = h(e);
      el.style.transform = 'translateY(-2px)';
      el.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    },
  },

  spring: {
    style: (active) => ({
      ...BASE,
      padding: '0.34em 0.85em',
      border: `1px solid ${
        active ? 'rgba(25,118,210,0.3)' : 'rgba(0,0,0,0.14)'
      }`,
      borderRadius: 4,
      background: active ? 'rgba(25,118,210,0.06)' : '#fff',
      color: active ? 'rgba(25,118,210,0.85)' : 'rgba(0,0,0,0.48)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      transform: 'translateY(0) scale(1)',
      transition:
        'transform 0.06s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.06s ease',
      fontWeight: active ? 600 : 500,
    }),
    onMouseDown: (e) => {
      const el = h(e);
      el.style.transition = 'transform 0.04s ease, box-shadow 0.04s ease';
      el.style.transform = 'translateY(2px) scale(0.97)';
      el.style.boxShadow = '0 0 1px rgba(0,0,0,0.08)';
    },
    onMouseUp: (e) => {
      const el = h(e);
      el.style.transition =
        'transform 0.16s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.1s ease';
      el.style.transform = 'translateY(0) scale(1)';
      el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
    },
    onMouseLeave: (e) => {
      const el = h(e);
      el.style.transition =
        'transform 0.06s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.06s ease';
      el.style.transform = 'translateY(0) scale(1)';
      el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
    },
  },

  stamp: {
    style: (active) => ({
      ...BASE,
      padding: '0.34em 0.85em',
      border: `1px solid ${
        active ? 'rgba(25,118,210,0.3)' : 'rgba(0,0,0,0.18)'
      }`,
      borderRadius: 4,
      background: active ? 'rgba(25,118,210,0.06)' : '#fff',
      color: active ? 'rgba(25,118,210,0.85)' : 'rgba(0,0,0,0.5)',
      boxShadow: active
        ? '0 0 0'
        : '0 3px 0 rgba(0,0,0,0.2), 0 4px 6px rgba(0,0,0,0.07)',
      transform: active
        ? 'translateY(4px) scale(0.98)'
        : 'translateY(0) scale(1)',
      transition:
        'transform 0.08s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.06s ease',
      fontWeight: active ? 600 : 500,
    }),
    onMouseDown: (e) => {
      const el = h(e);
      el.style.transition = 'none';
      el.style.transform = 'translateY(0) scale(1)';
      el.style.boxShadow =
        '0 3px 0 rgba(0,0,0,0.2), 0 4px 6px rgba(0,0,0,0.07)';
      requestAnimationFrame(() => {
        el.style.transition = 'transform 0.03s ease, box-shadow 0.03s ease';
        el.style.transform = 'translateY(4px) scale(0.98)';
        el.style.boxShadow = '0 0 0 rgba(0,0,0,0.2)';
      });
    },
    onMouseUp: (e) => {
      const el = h(e);
      el.style.transition =
        'transform 0.14s cubic-bezier(0.34,1.5,0.64,1), box-shadow 0.1s ease';
      el.style.transform = 'translateY(0) scale(1)';
      el.style.boxShadow =
        '0 3px 0 rgba(0,0,0,0.2), 0 4px 6px rgba(0,0,0,0.07)';
    },
    onMouseLeave: (e) => {
      const el = h(e);
      el.style.transition =
        'transform 0.08s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.06s ease';
      el.style.transform = 'translateY(0) scale(1)';
      el.style.boxShadow =
        '0 3px 0 rgba(0,0,0,0.2), 0 4px 6px rgba(0,0,0,0.07)';
    },
  },

  neumorphic: {
    style: (active) => ({
      ...BASE,
      padding: '0.36em 0.88em',
      borderRadius: 6,
      background: active ? '#dde0e8' : '#e8e8e8',
      color: active ? 'rgba(25,118,210,0.8)' : 'rgba(0,0,0,0.45)',
      boxShadow: active
        ? 'inset 2px 2px 5px #c8c8c8, inset -2px -2px 5px #ffffff'
        : '3px 3px 7px #c8c8c8, -3px -3px 7px #ffffff',
      transition: 'box-shadow 0.07s ease',
      fontWeight: active ? 600 : 500,
    }),
    onMouseDown: (e) => {
      h(e).style.boxShadow =
        'inset 2px 2px 5px #c8c8c8, inset -2px -2px 5px #ffffff';
    },
    onMouseUp: (e) => {
      h(e).style.boxShadow = '3px 3px 7px #c8c8c8, -3px -3px 7px #ffffff';
    },
    onMouseLeave: (e) => {
      h(e).style.boxShadow = '3px 3px 7px #c8c8c8, -3px -3px 7px #ffffff';
    },
  },

  glow: {
    style: (active) => ({
      ...BASE,
      padding: '0.34em 0.85em',
      border: `1px solid ${
        active ? 'rgba(25,118,210,0.4)' : 'rgba(0,0,0,0.16)'
      }`,
      borderRadius: 4,
      background: active ? 'rgba(25,118,210,0.06)' : '#fff',
      color: active ? 'rgba(25,118,210,0.85)' : 'rgba(0,0,0,0.5)',
      boxShadow: active
        ? '0 0 0 3px rgba(25,118,210,0.15)'
        : '0 0 0 0 rgba(100,120,200,0)',
      transition: 'box-shadow 0.1s ease, transform 0.05s ease',
      fontWeight: active ? 600 : 500,
    }),
    onMouseEnter: (e) => {
      h(e).style.boxShadow =
        '0 0 0 3px rgba(100,120,200,0.12), 0 2px 6px rgba(100,120,200,0.12)';
    },
    onMouseLeave: (e) => {
      const el = h(e);
      el.style.boxShadow = '0 0 0 0 rgba(100,120,200,0)';
      el.style.transform = 'none';
    },
    onMouseDown: (e) => {
      h(e).style.transform = 'scale(0.975)';
    },
    onMouseUp: (e) => {
      h(e).style.transform = 'none';
    },
  },

  'accent-bar': {
    style: (active) => ({
      ...BASE,
      padding: '0.34em 0.85em',
      border: `1px solid ${
        active ? 'rgba(25,118,210,0.3)' : 'rgba(0,0,0,0.14)'
      }`,
      borderBottom: active
        ? '2px solid rgba(25,118,210,0.7)'
        : '2px solid transparent',
      borderRadius: '4px 4px 2px 2px',
      background: '#fff',
      color: active ? 'rgba(25,118,210,0.85)' : 'rgba(0,0,0,0.5)',
      transition: 'border-bottom-color 0.07s, color 0.07s',
      fontWeight: active ? 600 : 500,
    }),
    onMouseEnter: (e) => {
      const el = h(e);
      el.style.borderBottomColor = 'rgba(80,100,180,0.55)';
      el.style.color = 'rgba(0,0,0,0.65)';
    },
    onMouseLeave: (e) => {
      const el = h(e);
      el.style.borderBottomColor = 'transparent';
      el.style.color = 'rgba(0,0,0,0.5)';
    },
    onMouseDown: (e) => {
      h(e).style.borderBottomColor = 'rgba(80,100,180,0.85)';
    },
    onMouseUp: (e) => {
      h(e).style.borderBottomColor = 'rgba(80,100,180,0.55)';
    },
  },

  terminal: {
    style: (active) => ({
      ...BASE,
      padding: '0.34em 0.8em',
      border: `1px solid ${
        active ? 'rgba(25,118,210,0.35)' : 'rgba(0,0,0,0.2)'
      }`,
      borderRadius: 2,
      background: active ? 'rgba(25,118,210,0.05)' : '#fafafa',
      color: active ? 'rgba(25,118,210,0.85)' : 'rgba(0,0,0,0.42)',
      fontFamily: 'monospace',
      letterSpacing: '0.02em',
      transition: 'background 0.06s, color 0.06s',
      fontWeight: active ? 600 : 500,
    }),
    onMouseEnter: (e) => {
      const el = h(e);
      el.style.background = '#f2f2f2';
      el.style.color = 'rgba(0,0,0,0.62)';
    },
    onMouseLeave: (e) => {
      const el = h(e);
      el.style.background = '#fafafa';
      el.style.color = 'rgba(0,0,0,0.42)';
    },
    onMouseDown: (e) => {
      h(e).style.background = '#e8e8e8';
    },
    onMouseUp: (e) => {
      h(e).style.background = '#f2f2f2';
    },
  },

  ghost: {
    style: (active) => ({
      ...BASE,
      padding: '0.34em 0.85em',
      border: `1px solid ${active ? 'rgba(25,118,210,0.4)' : 'transparent'}`,
      borderRadius: 4,
      background: active ? 'rgba(25,118,210,0.06)' : 'transparent',
      color: active ? 'rgba(25,118,210,0.85)' : 'rgba(0,0,0,0.35)',
      transition: 'border-color 0.07s, background 0.07s, color 0.07s',
      fontWeight: active ? 600 : 500,
    }),
    onMouseEnter: (e) => {
      const el = h(e);
      el.style.borderColor = 'rgba(0,0,0,0.18)';
      el.style.background = '#fff';
      el.style.color = 'rgba(0,0,0,0.55)';
    },
    onMouseLeave: (e) => {
      const el = h(e);
      el.style.borderColor = 'transparent';
      el.style.background = 'transparent';
      el.style.color = 'rgba(0,0,0,0.35)';
    },
    onMouseDown: (e) => {
      h(e).style.background = '#f2f2f2';
    },
    onMouseUp: (e) => {
      h(e).style.background = '#fff';
    },
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export interface PodBarButtonProps {
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onAuxClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  active?: boolean;
  disabled?: boolean;
  loading?: boolean;
  title?: string;
  href?: string;
  'aria-label'?: string;
  'aria-haspopup'?:
    | boolean
    | 'dialog'
    | 'menu'
    | 'grid'
    | 'listbox'
    | 'tree'
    | 'false'
    | 'true';
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  /** Merged on top of theme styles — use for split-button border-radius adjustments */
  style?: React.CSSProperties;
  prefix?: string;
}

const PodBarButton: React.FC<PodBarButtonProps> = ({
  children,
  onClick,
  onAuxClick,
  active = false,
  disabled,
  loading,
  title,
  'aria-label': ariaLabel,
  'aria-haspopup': ariaHaspopup,
  'aria-expanded': ariaExpanded,
  'aria-controls': ariaControls,
  style: styleOverride,
}) => {
  const theme = useSyncExternalStore(
    subscribePodsButtonTheme,
    getPodsButtonTheme
  );
  const cfg = THEMES[theme];
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      style={{
        ...cfg.style(active),
        opacity: isDisabled ? (loading ? 0.65 : 0.42) : 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        ...styleOverride,
      }}
      onClick={isDisabled ? undefined : onClick}
      onAuxClick={isDisabled ? undefined : onAuxClick}
      onMouseEnter={isDisabled ? undefined : cfg.onMouseEnter}
      onMouseLeave={isDisabled ? undefined : cfg.onMouseLeave}
      onMouseDown={isDisabled ? undefined : cfg.onMouseDown}
      onMouseUp={isDisabled ? undefined : cfg.onMouseUp}
      disabled={isDisabled}
      title={title}
      aria-label={ariaLabel}
      aria-haspopup={ariaHaspopup}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
    >
      {loading ? (
        <span style={{ display: 'inline-grid', verticalAlign: 'middle' }}>
          <span
            style={{
              gridRow: 1,
              gridColumn: 1,
              visibility: 'hidden',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            {children}
          </span>
          <span
            style={{
              gridRow: 1,
              gridColumn: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '11px',
                height: '11px',
                border: '2px solid currentColor',
                borderRightColor: 'transparent',
                borderRadius: '50%',
                animation: '_pbSpin 0.65s linear infinite',
              }}
            />
          </span>
        </span>
      ) : theme === 'terminal' ? (
        <>
          <span style={{ opacity: 0.5 }}>{'> '}</span>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default PodBarButton;
