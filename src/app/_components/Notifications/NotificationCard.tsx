import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Collapse,
  LinearProgress,
  Stack,
  Chip,
} from '@mui/material';
import {
  CloseRounded,
  ExpandMoreRounded,
  ExpandLessRounded,
  ContentCopyRounded,
  ErrorOutlineRounded,
  CheckCircleOutlineRounded,
  WarningAmberRounded,
  InfoOutlined,
} from '@mui/icons-material';
import type { AppNotification, NotificationSeverity } from '.';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SEVERITY_COLORS: Record<NotificationSeverity, string> = {
  error: '#d32f2f',
  warning: '#ed6c02',
  success: '#2e7d32',
  info: '#0288d1',
};

const DEFAULT_DISMISS_MS: Record<NotificationSeverity, number> = {
  success: 5000,
  info: 8000,
  warning: 8000,
  error: 12000,
};

const TICK_INTERVAL = 50; // ms between progress updates

const SeverityIcon: React.FC<{ severity: NotificationSeverity }> = ({
  severity,
}) => {
  const sx = { fontSize: 18, opacity: 0.9 };
  switch (severity) {
    case 'error':
      return <ErrorOutlineRounded sx={sx} />;
    case 'warning':
      return <WarningAmberRounded sx={sx} />;
    case 'success':
      return <CheckCircleOutlineRounded sx={sx} />;
    case 'info':
      return <InfoOutlined sx={sx} />;
  }
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

interface ParsedApiError {
  result?: unknown;
  status?: string;
  message?: string;
  version?: string;
  commit?: string;
  build?: string;
}

function tryParseJson(raw: string): ParsedApiError | null {
  try {
    const obj = JSON.parse(raw);
    if (typeof obj === 'object' && obj !== null && 'message' in obj) return obj;
    return null;
  } catch {
    if (raw.startsWith('SK_')) {
      return { status: 'error', message: raw };
    }
    return null;
  }
}

function formatAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 5) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface NotificationCardProps {
  notification: AppNotification;
  onDismiss: () => void;
  onRemove: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onDismiss,
  onRemove,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [agoText, setAgoText] = useState(() =>
    formatAgo(notification.timestamp)
  );

  const totalMs =
    notification.autoDismissMs ??
    DEFAULT_DISMISS_MS[notification.severity] ??
    8000;
  const remainingRef = useRef(totalMs);
  const [progress, setProgress] = useState(100);

  const parsed = tryParseJson(notification.message);
  const bg = SEVERITY_COLORS[notification.severity];

  // Countdown timer — pauses on hover or expand
  const paused = hovered || expanded;

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      remainingRef.current -= TICK_INTERVAL;
      const pct = Math.max(0, (remainingRef.current / totalMs) * 100);
      setProgress(pct);
      if (remainingRef.current <= 0) {
        clearInterval(interval);
        onDismiss();
      }
    }, TICK_INTERVAL);
    return () => clearInterval(interval);
  }, [paused, totalMs, onDismiss]);

  // Update "ago" text while hovered
  useEffect(() => {
    if (!hovered) return;
    setAgoText(formatAgo(notification.timestamp));
    const interval = setInterval(
      () => setAgoText(formatAgo(notification.timestamp)),
      1000
    );
    return () => clearInterval(interval);
  }, [hovered, notification.timestamp]);

  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    // Don't toggle if clicking a button or icon button
    if ((e.target as HTMLElement).closest('button')) return;
    setExpanded((p) => !p);
  }, []);

  return (
    <Box
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      sx={{
        borderRadius: 2,
        boxShadow: 4,
        overflow: 'hidden',
        bgcolor: bg,
        color: '#fff',
        cursor: 'pointer',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          px: 1.5,
          py: 0.75,
        }}
      >
        <SeverityIcon severity={notification.severity} />
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, fontSize: '0.8rem', flex: 1 }}
        >
          {notification.title}
        </Typography>
        <Typography
          variant="caption"
          sx={{ opacity: 0.7, flexShrink: 0, fontSize: '0.7rem' }}
        >
          {hovered ? agoText : ''}
        </Typography>
        <IconButton
          size="small"
          color="inherit"
          onClick={() => setExpanded((p) => !p)}
          sx={{ ml: -0.25 }}
        >
          {expanded ? (
            <ExpandLessRounded sx={{ fontSize: 16 }} />
          ) : (
            <ExpandMoreRounded sx={{ fontSize: 16 }} />
          )}
        </IconButton>
        <IconButton
          size="small"
          color="inherit"
          onClick={() => navigator.clipboard.writeText(notification.message)}
        >
          <ContentCopyRounded sx={{ fontSize: 14 }} />
        </IconButton>
        <IconButton size="small" color="inherit" onClick={onDismiss}>
          <CloseRounded sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {/* Collapsed preview */}
      {!expanded && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            px: 1.5,
            pb: 0.75,
            opacity: 0.85,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '0.7rem',
          }}
        >
          {parsed?.message ?? notification.message.slice(0, 140)}
        </Typography>
      )}

      {/* Expanded detail */}
      <Collapse in={expanded}>
        <Box sx={{ px: 1.5, pb: 1, bgcolor: 'rgba(0,0,0,0.18)' }}>
          {parsed ? (
            <>
              <Typography
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.73rem',
                  lineHeight: 1.5,
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                  color: '#fff',
                  py: 0.75,
                }}
              >
                {parsed.message}
              </Typography>
              {(notification.statusCode || parsed.status || parsed.version) && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    pt: 0.25,
                    borderTop: '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  {notification.statusCode && (
                    <Chip
                      label={notification.statusCode}
                      size="small"
                      sx={{
                        bgcolor: '#d32f2f',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        height: 20,
                        fontFamily: 'monospace',
                      }}
                    />
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.6,
                      fontSize: '0.65rem',
                      fontFamily: 'monospace',
                      color: '#fff',
                    }}
                  >
                    {[parsed.status, parsed.version && `v${parsed.version}`]
                      .filter(Boolean)
                      .join(' · ')}
                  </Typography>
                </Box>
              )}
            </>
          ) : (
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.73rem',
                lineHeight: 1.5,
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
                color: '#fff',
                py: 0.75,
              }}
            >
              {notification.message}
            </Typography>
          )}
        </Box>
      </Collapse>

      {/* Countdown bar */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 3,
          bgcolor: 'rgba(0,0,0,0.2)',
          '& .MuiLinearProgress-bar': {
            bgcolor: 'rgba(255,255,255,0.5)',
            transition: `transform ${TICK_INTERVAL}ms linear`,
          },
        }}
      />
    </Box>
  );
};

export default NotificationCard;
