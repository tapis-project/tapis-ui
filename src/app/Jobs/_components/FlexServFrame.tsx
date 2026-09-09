/**
 * FlexServFrame — the running session, framed inside the page.
 *
 * The same floating-window grammar as the file viewer (move by the title
 * bar, resize from the edges, geometry remembered, Escape closes, no
 * backdrop blacking the page out) with an iframe for a body, so a
 * just-started FlexServ can be used right where its address appeared.
 *
 * One honest limitation carried in the chrome: a served app can refuse to
 * be framed (X-Frame-Options / CSP), and a cross-origin frame gives no
 * error we can read — the strip at the bottom says what a blank frame
 * means, and the open-in-tab press always works.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import {
  CloseRounded,
  ContentCopyRounded,
  DoneRounded,
  OpenInNewRounded,
  RefreshRounded,
} from '@mui/icons-material';

const FLEXSERV_ACCENT = '#00897b';

const GEOMETRY_KEY = 'flexserv.frame.window';
const MIN_WIDTH = 420;
const MIN_HEIGHT = 300;

type Geometry = { x: number; y: number; width: number; height: number };

/** centred, and big enough to actually use a web app in */
const defaultGeometry = (vw: number, vh: number): Geometry => {
  const width = Math.max(MIN_WIDTH, Math.min(1240, vw * 0.82));
  const height = Math.max(MIN_HEIGHT, Math.min(860, vh * 0.84));
  return {
    width,
    height,
    x: Math.round((vw - width) / 2),
    y: Math.round((vh - height) / 2),
  };
};

/** never lost: some of the title bar stays reachable while dragging */
const clampGeometry = (g: Geometry, vw: number, vh: number): Geometry => {
  const width = Math.min(Math.max(g.width, MIN_WIDTH), Math.max(MIN_WIDTH, vw));
  const height = Math.min(
    Math.max(g.height, MIN_HEIGHT),
    Math.max(MIN_HEIGHT, vh)
  );
  return {
    width,
    height,
    x: Math.min(Math.max(g.x, -width + 80), vw - 80),
    y: Math.min(Math.max(g.y, 0), vh - 40),
  };
};

/** restoring shrinks to fit and pulls fully into view */
const fitGeometry = (g: Geometry, vw: number, vh: number): Geometry => {
  const width = Math.min(Math.max(g.width, MIN_WIDTH), vw);
  const height = Math.min(Math.max(g.height, MIN_HEIGHT), vh);
  return {
    width,
    height,
    x: Math.min(Math.max(g.x, 0), Math.max(0, vw - width)),
    y: Math.min(Math.max(g.y, 0), Math.max(0, vh - height)),
  };
};

const readGeometry = (): Geometry => {
  const fallback = defaultGeometry(window.innerWidth, window.innerHeight);
  try {
    const stored = window.localStorage.getItem(GEOMETRY_KEY);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored);
    if (
      typeof parsed?.x !== 'number' ||
      typeof parsed?.y !== 'number' ||
      typeof parsed?.width !== 'number' ||
      typeof parsed?.height !== 'number'
    ) {
      return fallback;
    }
    return fitGeometry(parsed, window.innerWidth, window.innerHeight);
  } catch {
    return fallback;
  }
};

type DragState =
  | { kind: 'move'; startX: number; startY: number; from: Geometry }
  | {
      kind: 'resize';
      edge: 'e' | 's' | 'se' | 'w' | 'sw';
      startX: number;
      startY: number;
      from: Geometry;
    }
  | null;

const BAR_BTN_SX = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  p: '3px',
  borderRadius: '4px',
  cursor: 'pointer',
  background: 'none',
  color: 'text.secondary',
  '&:hover': { bgcolor: 'rgba(0,0,0,0.06)', color: 'text.primary' },
  '& svg': { fontSize: 15 },
} as const;

const FlexServFrame: React.FC<{
  address: string;
  token?: string;
  /** what the title bar calls it — usually the job's name */
  label?: string;
  /** the app's own name for the bar and aria labels — defaults FlexServ,
   *  the frame's first tenant; every session app rides the same window */
  title?: string;
  /** the app's accent for the bar — defaults to FlexServ's teal */
  accent?: string;
  onClose: () => void;
}> = ({
  address,
  token,
  label,
  title = 'FlexServ',
  accent = FLEXSERV_ACCENT,
  onClose,
}) => {
  const [geometry, setGeometry] = useState<Geometry>(readGeometry);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  // bumping the key is the only reload a cross-origin frame allows
  const [frameKey, setFrameKey] = useState(0);
  const drag = useRef<DragState>(null);

  useEffect(() => {
    const onResize = () =>
      setGeometry((current) =>
        fitGeometry(current, window.innerWidth, window.innerHeight)
      );
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      const state = drag.current;
      if (!state) return;
      const dx = event.clientX - state.startX;
      const dy = event.clientY - state.startY;
      const next =
        state.kind === 'move'
          ? { ...state.from, x: state.from.x + dx, y: state.from.y + dy }
          : {
              ...state.from,
              width:
                state.edge === 'w' || state.edge === 'sw'
                  ? state.from.width - dx
                  : state.edge === 'e' || state.edge === 'se'
                  ? state.from.width + dx
                  : state.from.width,
              x:
                state.edge === 'w' || state.edge === 'sw'
                  ? state.from.x + dx
                  : state.from.x,
              height:
                state.edge === 'e' ? state.from.height : state.from.height + dy,
            };
      setGeometry(clampGeometry(next, window.innerWidth, window.innerHeight));
    };
    const onUp = () => {
      if (!drag.current) return;
      drag.current = null;
      setDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      setGeometry((current) => {
        try {
          window.localStorage.setItem(GEOMETRY_KEY, JSON.stringify(current));
        } catch {
          /* it still holds for this visit */
        }
        return current;
      });
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const startDrag = (state: NonNullable<DragState>, cursor: string) => {
    drag.current = state;
    setDragging(true);
    document.body.style.cursor = cursor;
    document.body.style.userSelect = 'none';
  };

  const edge = (
    key: 'e' | 's' | 'se' | 'w' | 'sw',
    cursor: string,
    sx: Record<string, unknown>
  ) => (
    <Box
      role="separator"
      aria-label={`Resize session window ${key}`}
      onMouseDown={(event: React.MouseEvent) =>
        startDrag(
          {
            kind: 'resize',
            edge: key,
            startX: event.clientX,
            startY: event.clientY,
            from: geometry,
          },
          cursor
        )
      }
      sx={{ position: 'absolute', cursor, zIndex: 1, ...sx }}
    />
  );

  return (
    <Box
      role="dialog"
      aria-label={`${title} session window`}
      sx={{
        position: 'fixed',
        left: geometry.x,
        top: geometry.y,
        width: geometry.width,
        height: geometry.height,
        zIndex: 1250,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: `${accent}66`,
        borderRadius: '6px',
        overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(0,0,0,0.22)',
      }}
    >
      {edge('w', 'ew-resize', { left: -3, top: 0, bottom: 12, width: 6 })}
      {edge('e', 'ew-resize', { right: -3, top: 0, bottom: 12, width: 6 })}
      {edge('s', 'ns-resize', { left: 12, right: 12, bottom: -3, height: 6 })}
      {edge('sw', 'nesw-resize', {
        left: -3,
        bottom: -3,
        width: 14,
        height: 14,
      })}
      {edge('se', 'nwse-resize', {
        right: -3,
        bottom: -3,
        width: 14,
        height: 14,
      })}

      {/* ── title bar: whose session, and the handle to move it ────────── */}
      <Box
        onMouseDown={(event: React.MouseEvent) => {
          if ((event.target as HTMLElement).closest('button, a, input')) return;
          startDrag(
            {
              kind: 'move',
              startX: event.clientX,
              startY: event.clientY,
              from: geometry,
            },
            'grabbing'
          );
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          px: 1,
          py: 0.5,
          borderBottom: `1px solid ${accent}44`,
          cursor: 'grab',
          minWidth: 0,
          flexShrink: 0,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.74rem',
            fontWeight: 700,
            color: accent,
            whiteSpace: 'nowrap',
          }}
        >
          {title}
          {label ? ` · ${label}` : ''}
        </Typography>
        <Typography
          sx={{
            fontFamily: 'monospace',
            fontSize: '0.68rem',
            color: 'text.secondary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0,
            flex: 1,
          }}
        >
          {address}
        </Typography>
        {!!token && (
          <Tooltip title={copied ? 'Copied' : 'Copy token'}>
            <Box
              component="button"
              type="button"
              aria-label="Copy token"
              onClick={() => {
                navigator.clipboard?.writeText(token);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
              }}
              sx={{
                ...BAR_BTN_SX,
                ...(copied ? { color: 'success.main' } : {}),
              }}
            >
              {copied ? <DoneRounded /> : <ContentCopyRounded />}
            </Box>
          </Tooltip>
        )}
        <Tooltip title="Reload the frame">
          <Box
            component="button"
            type="button"
            aria-label="Reload session frame"
            onClick={() => setFrameKey((k) => k + 1)}
            sx={BAR_BTN_SX}
          >
            <RefreshRounded />
          </Box>
        </Tooltip>
        <Tooltip title="Open in its own tab - always works, framed or not">
          <Box
            component="a"
            href={address}
            target="_blank"
            rel="noreferrer"
            aria-label="Open session in new tab"
            sx={BAR_BTN_SX}
          >
            <OpenInNewRounded />
          </Box>
        </Tooltip>
        <Tooltip title="Close (Esc)">
          <Box
            component="button"
            type="button"
            aria-label="Close session window"
            onClick={onClose}
            sx={BAR_BTN_SX}
          >
            <CloseRounded />
          </Box>
        </Tooltip>
      </Box>

      {/* ── the session itself ─────────────────────────────────────────── */}
      <Box sx={{ position: 'relative', flex: 1, minHeight: 0 }}>
        <Box
          component="iframe"
          key={frameKey}
          src={address}
          title={`${title} session`}
          allow="clipboard-read; clipboard-write"
          sx={{ width: '100%', height: '100%', border: 'none' }}
        />
        {/* an iframe eats mouse events — a drag would die crossing it */}
        {dragging && <Box sx={{ position: 'absolute', inset: 0, zIndex: 2 }} />}
      </Box>

      <Typography
        sx={{
          px: 1,
          py: '2px',
          fontSize: '0.62rem',
          color: 'text.disabled',
          borderTop: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        blank? the app refuses to be framed - the ↗ tab press always works
      </Typography>
    </Box>
  );
};

export default FlexServFrame;
