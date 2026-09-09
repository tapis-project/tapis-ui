import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Close, HelpOutline, MenuBookOutlined } from '@mui/icons-material';
import {
  Drawer,
  Box,
  Stack,
  Grid,
  Typography,
  ButtonBase,
  Tooltip,
} from '@mui/material';

// The banner drawer's resize bounds: never narrower than a quarter of the
// window, never wider than it already opens.
const MIN_DRAWER_VW = 0.25;
const MAX_DRAWER_VW = 0.92;
const DRAWER_WIDTH_KEY = 'help.drawerWidth';

type HelpProps = {
  title: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  width?: string | number;
  minWidth?: string | number;
  height?: string | number;
  showHeader?: boolean;
  childrenSectionHeight?: string | number;
  iframeUrl?: string;
  iframePosition?: 'top' | 'bottom';
  /**
   * 'icon' = the classic bare glyph; 'chip' = a small rectangular ? button;
   * 'doc' = the same rectangle carrying a book glyph, for headers where ?
   * has been given to the page-description switch and this button is the
   * docs, which is what it always actually opened.
   */
  variant?: 'icon' | 'chip' | 'doc';
  /**
   * 'classic' keeps the big grey h5 header. 'banner' (opt-in) swaps it for a
   * slim info strip in the PreloginBanner grammar — dot, one quiet sentence,
   * and an open-in-tab affordance — so the drawer is nearly all docs.
   */
  headerStyle?: 'classic' | 'banner';
  /** the banner's sentence; defaults to a line built from the title */
  bannerText?: string;
  /** an extra press in the banner bar, left of Open in tab — the service
   *  docs use it to switch between doc sources */
  bannerAction?: { label: string; onClick: () => void };
};

const Help: React.FC<React.PropsWithChildren<HelpProps>> = ({
  title,
  children,
  position = 'right',
  width = '42vw',
  minWidth = '92vw',
  height = '100vh', // There's a header which autohides, but on scroll up gets shown.
  childrenSectionHeight = '700px',
  showHeader = true,
  iframeUrl,
  iframePosition = 'top',
  variant = 'icon',
  headerStyle = 'classic',
  bannerText,
  bannerAction,
}) => {
  const [open, setOpen] = useState(false);

  // One navigation's wait: armed when the drawer opens and again whenever
  // the url changes underneath it (the Switch press), cleared by onLoad.
  // everLoaded tells the two waits apart — a first open is a white frame
  // that deserves a caption; a switch keeps the old document painted, so
  // only the rail speaks.
  const [frameLoading, setFrameLoading] = useState(false);
  const [everLoaded, setEverLoaded] = useState(false);
  useEffect(() => {
    if (open) {
      // the frame mounts fresh with the drawer: nothing painted yet
      setEverLoaded(false);
      setFrameLoading(!!iframeUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  useEffect(() => {
    if (open && iframeUrl) setFrameLoading(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iframeUrl]);
  const frameLoaded = useCallback(() => {
    setFrameLoading(false);
    setEverLoaded(true);
  }, []);

  /**
   * A drawer you can size.
   *
   * The banner drawer opens at 92vw, which is the whole screen for a page of
   * documentation you usually want to read BESIDE the thing you are doing.
   * Drag the left edge: 25vw at the narrowest, the original width at the
   * widest, and the choice is remembered.
   *
   * Only the banner variant — the classic drawer is used in places that have
   * not asked for this.
   */
  const resizable = headerStyle === 'banner';
  const [dragged, setDragged] = useState<number | null>(() => {
    try {
      const stored = Number(window.localStorage.getItem(DRAWER_WIDTH_KEY));
      return Number.isFinite(stored) && stored > 0 ? stored : null;
    } catch {
      return null;
    }
  });
  const dragging = useRef(false);

  const onDrag = useCallback((event: MouseEvent) => {
    if (!dragging.current) return;
    // anchored right, so the width is the distance from the pointer to the
    // right edge of the window
    const raw = window.innerWidth - event.clientX;
    const next = Math.min(
      Math.max(raw, window.innerWidth * MIN_DRAWER_VW),
      window.innerWidth * MAX_DRAWER_VW
    );
    setDragged(next);
  }, []);

  const stopDrag = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    document.body.style.userSelect = '';
    setDragged((width) => {
      try {
        if (width) window.localStorage.setItem(DRAWER_WIDTH_KEY, String(width));
      } catch {
        /* it still holds for this visit */
      }
      return width;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', stopDrag);
    return () => {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', stopDrag);
    };
  }, [onDrag, stopDrag]);

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      {variant === 'chip' || variant === 'doc' ? (
        <Box
          component="button"
          aria-label={variant === 'doc' ? `${title} docs` : `${title} help`}
          onClick={() => setOpen(!open)}
          sx={{
            width: 18,
            height: 18,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '4px',
            bgcolor: 'transparent',
            cursor: 'pointer',
            fontSize: '0.68rem',
            fontWeight: 700,
            lineHeight: 1,
            color: 'text.secondary',
            p: 0,
            '&:hover': { bgcolor: 'rgba(0,0,0,0.05)', color: 'text.primary' },
          }}
        >
          {variant === 'doc' ? <MenuBookOutlined sx={{ fontSize: 12 }} /> : '?'}
        </Box>
      ) : (
        <HelpOutline
          fontSize="small"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setOpen(!open);
          }}
        />
      )}
      <Drawer
        open={open}
        anchor={position}
        onClose={() => {
          setOpen(false);
        }}
      >
        <Box
          sx={{
            width: resizable && dragged ? `${dragged}px` : width,
            // the stored width IS the width; the 92vw floor would override it
            minWidth: resizable && dragged ? 0 : minWidth,
            height: height,
            overflow: 'clip',
            position: 'relative',
          }}
          role="presentation"
        >
          {resizable && (
            <Box
              aria-hidden="true"
              onMouseDown={() => {
                dragging.current = true;
                // without this a drag selects the docs text under the pointer
                document.body.style.userSelect = 'none';
              }}
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 6,
                cursor: 'col-resize',
                zIndex: 2,
                '&:hover': { bgcolor: 'rgba(21, 101, 192, 0.25)' },
              }}
            />
          )}
          <Stack direction="column" sx={{ height: '100%' }}>
            {showHeader && headerStyle === 'banner' && (
              // The PreloginBanner grammar in info blue: a hairline strip
              // instead of a header block — the drawer is for the docs, not
              // for announcing itself.
              <Box
                sx={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.75,
                  py: '4px',
                  minHeight: 30,
                  bgcolor: 'rgba(21, 101, 192, 0.07)',
                  borderBottom: '1px solid rgba(21, 101, 192, 0.28)',
                  color: '#1c5d99',
                  fontSize: '0.78rem',
                  lineHeight: 1.3,
                }}
              >
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: '#1565c0',
                    flexShrink: 0,
                  }}
                />
                <Box
                  component="span"
                  sx={{
                    flexGrow: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {bannerText ??
                    `${title} — the official docs, opened in place.`}
                </Box>
                {bannerAction && (
                  <ButtonBase
                    onClick={bannerAction.onClick}
                    sx={{
                      flexShrink: 0,
                      px: 1.25,
                      py: '2px',
                      borderRadius: '5px',
                      border: '1px solid rgba(21, 101, 192, 0.5)',
                      color: '#1c5d99',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      fontFamily: 'inherit',
                      transition: 'background 0.06s, color 0.06s',
                      '&:hover': { bgcolor: '#1565c0', color: '#ffffff' },
                    }}
                  >
                    {bannerAction.label}
                  </ButtonBase>
                )}
                {iframeUrl && (
                  <ButtonBase
                    onClick={() => window.open(iframeUrl, '_blank')}
                    sx={{
                      flexShrink: 0,
                      px: 1.25,
                      py: '2px',
                      borderRadius: '5px',
                      border: '1px solid rgba(21, 101, 192, 0.5)',
                      color: '#1c5d99',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      fontFamily: 'inherit',
                      transition: 'background 0.06s, color 0.06s',
                      '&:hover': { bgcolor: '#1565c0', color: '#ffffff' },
                    }}
                  >
                    Open in tab ↗
                  </ButtonBase>
                )}
                {/* the drawer closes on backdrop and Escape, but neither is
                    obvious when it is filling the screen */}
                <Tooltip title="Close">
                  <ButtonBase
                    aria-label="Close the docs"
                    onClick={() => setOpen(false)}
                    sx={{
                      flexShrink: 0,
                      width: 22,
                      height: 22,
                      borderRadius: '5px',
                      border: '1px solid rgba(21, 101, 192, 0.5)',
                      color: '#1c5d99',
                      transition: 'background 0.06s, color 0.06s',
                      '&:hover': { bgcolor: '#1565c0', color: '#ffffff' },
                    }}
                  >
                    <Close sx={{ fontSize: 14 }} />
                  </ButtonBase>
                </Tooltip>
              </Box>
            )}
            {showHeader && headerStyle === 'classic' && (
              <Grid>
                <Typography
                  variant="h5"
                  component="h5"
                  sx={{
                    fontWeight: 600,
                    padding: '16px',
                    backgroundColor: '#f0f0f0',
                    color: '#444444',
                    borderBottom: '1px solid #444444',
                  }}
                >
                  {title}
                </Typography>
              </Grid>
            )}
            <Grid sx={{ overflow: 'auto', flexGrow: 1, position: 'relative' }}>
              {/* A switched doc source takes a second or two to answer, and
                  the browser keeps the OLD document painted until the new
                  one commits — so the page is left alone (no dimming, no
                  white-out) and the wait is said by the rail and a small
                  pill riding over it, cleared by the frame's own load
                  event. */}
              {frameLoading && iframeUrl && (
                <>
                  {/* Not MUI's LinearProgress: its two bars accelerate and
                      bounce, which read as a blob wobbling along. This is
                      one gradient band gliding left to right at constant
                      velocity on a tinted track — steady, and visible even
                      over white. */}
                  <Box
                    role="progressbar"
                    aria-label="Loading the docs"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      overflow: 'hidden',
                      zIndex: 2,
                      bgcolor: 'rgba(21, 101, 192, 0.14)',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        width: '40%',
                        background:
                          'linear-gradient(90deg, rgba(21,101,192,0) 0%, #1565c0 45%, #1565c0 55%, rgba(21,101,192,0) 100%)',
                        '@keyframes docsRailSweep': {
                          from: { transform: 'translateX(-100%)' },
                          to: { transform: 'translateX(260%)' },
                        },
                        animation: 'docsRailSweep 1.2s linear infinite',
                      }}
                    />
                  </Box>
                  {everLoaded ? (
                    /* a switch keeps the old document readable, so the
                       words ride the rail's corner instead of sitting on
                       the content */
                    <Typography
                      sx={{
                        position: 'absolute',
                        top: 7,
                        right: 10,
                        zIndex: 2,
                        fontSize: '0.66rem',
                        color: '#1c5d99',
                        bgcolor: 'rgba(255,255,255,0.9)',
                        px: 0.6,
                        py: '1px',
                        borderRadius: '3px',
                        pointerEvents: 'none',
                      }}
                    >
                      fetching the docs…
                    </Typography>
                  ) : (
                    /* a first open is an empty white frame — the words can
                       sit in the middle of it, plainly */
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1,
                        pointerEvents: 'none',
                      }}
                    >
                      <Typography
                        sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
                      >
                        fetching the docs…
                      </Typography>
                    </Box>
                  )}
                </>
              )}
              {iframeUrl && iframePosition === 'top' && (
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                  src={iframeUrl}
                  onLoad={frameLoaded}
                />
              )}
              <Box sx={{ height: childrenSectionHeight }}>{children}</Box>
              {iframeUrl && iframePosition === 'bottom' && (
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                  src={iframeUrl}
                  onLoad={frameLoaded}
                />
              )}
            </Grid>
          </Stack>
        </Box>
      </Drawer>
    </span>
  );
};

export default Help;
