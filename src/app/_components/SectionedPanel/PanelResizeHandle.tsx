import React, { useRef } from 'react';
import { Box } from '@mui/material';

// Drag-resize for the SectionedPanel modal family (Settings, Pods Admin,
// node detail): a bottom-right grip the user can pull when they have more
// screen. During the drag the handle mutates the dialog Paper's inline style
// directly — a React re-render per pointermove would redraw the whole panel
// (the section bodies are heavy) — and only on release is the final clamped
// size committed to localStorage + the caller's state, so the next open (and
// the next session) keeps the layout.
//
// Adoption is two lines on any panel dialog: read the stored size into the
// PaperProps sx, and render <PanelResizeHandle storageKey="..."/> beside the
// SectionedPanel (the Paper needs position:'relative').

const KEY_PREFIX = 'panelSize:';

export interface PanelSize {
  w: number;
  h: number;
}

export const readStoredPanelSize = (key: string): PanelSize | null => {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + key);
    if (!raw) return null;
    const v = JSON.parse(raw);
    return typeof v?.w === 'number' && typeof v?.h === 'number'
      ? { w: v.w, h: v.h }
      : null;
  } catch {
    return null;
  }
};

// Floors keep the nav + a section usable; ceilings are the ask: ~90vh tall,
// nearly full width but never edge-to-edge (and never past what stays a
// readable content width on ultrawides).
const MIN_W = 680;
const MIN_H = 460;
export const clampPanelSize = (w: number, h: number): PanelSize => ({
  w: Math.round(
    Math.min(Math.max(w, MIN_W), Math.min(window.innerWidth - 24, 1720))
  ),
  h: Math.round(Math.min(Math.max(h, MIN_H), window.innerHeight * 0.9)),
});

const PanelResizeHandle: React.FC<{
  storageKey: string;
  onCommit?: (size: PanelSize) => void;
}> = ({ storageKey, onCommit }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const paper = ref.current?.closest('.MuiPaper-root') as HTMLElement | null;
    if (!paper) return;
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const rect = paper.getBoundingClientRect();
    const move = (ev: PointerEvent) => {
      const s = clampPanelSize(
        rect.width + (ev.clientX - startX),
        rect.height + (ev.clientY - startY)
      );
      paper.style.width = `${s.w}px`;
      paper.style.height = `${s.h}px`;
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      const r = paper.getBoundingClientRect();
      const s = clampPanelSize(r.width, r.height);
      try {
        localStorage.setItem(KEY_PREFIX + storageKey, JSON.stringify(s));
      } catch {
        /* private mode etc. — session state still gets it via onCommit */
      }
      onCommit?.(s);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <Box
      ref={ref}
      onPointerDown={onPointerDown}
      title="Drag to resize"
      sx={{
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: 20,
        height: 20,
        cursor: 'nwse-resize',
        zIndex: 10,
        touchAction: 'none',
        // three diagonal grip lines, clipped to the corner triangle
        clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
        background:
          'repeating-linear-gradient(135deg, transparent 0 4px, rgba(120,120,120,0.45) 4px 6px)',
        opacity: 0.55,
        '&:hover': { opacity: 1 },
      }}
    />
  );
};

export default PanelResizeHandle;
