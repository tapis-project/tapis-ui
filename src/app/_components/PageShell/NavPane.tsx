/**
 * The nav column, and the edge you drag to resize it.
 *
 * Every service page draws the same column: a list on the left, the work on
 * the right. It was a fixed 17rem in the stylesheet, so a page with wide
 * content and a page with short names paid the same. This wraps the column
 * and puts a grip on its right edge.
 *
 * The grip is a SIBLING of the column, not a child of it: the column
 * scrolls, and anything inside it scrolls away with the list. It is two
 * pixels of visible rule with a wider invisible reach, because a one-pixel
 * target is a target nobody hits.
 *
 * It is also reachable without a mouse: the grip takes focus and the arrows
 * move it, which is the whole reason it is a `separator` with a value
 * rather than a styled div.
 */
import React, { useCallback, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import styles from './PageShell.module.scss';
import {
  NAV_MAX,
  NAV_MIN,
  resetNavWidth,
  saveNavWidth,
  setNavWidth,
  useNavWidth,
} from './navWidth';

/** how far an arrow press moves the edge */
const STEP = 16;

const NavPane: React.FC<{
  children: React.ReactNode;
  /** extra classes a page already put on its column */
  className?: string;
  /** a page whose column should not be resizable (a dialog's, say) */
  fixed?: boolean;
}> = ({ children, className, fixed }) => {
  const width = useNavWidth();
  const from = useRef<{ x: number; width: number } | null>(null);

  const onDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      from.current = { x: event.clientX, width };
      event.currentTarget.setPointerCapture(event.pointerId);
      // the drag would otherwise select the list behind it
      document.body.style.userSelect = 'none';
    },
    [width]
  );

  // one width per frame: pointer events arrive faster than paints, and
  // every width re-renders the column and the page header above it
  const frame = useRef<number | null>(null);
  const lastX = useRef(0);
  const onMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!from.current) return;
    lastX.current = event.clientX;
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      if (!from.current) return;
      setNavWidth(from.current.width + (lastX.current - from.current.x), {
        save: false,
      });
    });
  }, []);

  const endDrag = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    from.current = null;
    document.body.style.userSelect = '';
  }, []);

  const onUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!from.current) return;
      // land the last position before the frame that would have drawn it
      setNavWidth(from.current.width + (event.clientX - from.current.x), {
        save: false,
      });
      endDrag();
      event.currentTarget.releasePointerCapture(event.pointerId);
      saveNavWidth();
    },
    [endDrag]
  );

  // leaving the page mid-drag must not leave the whole site unselectable
  useEffect(
    () => () => {
      if (from.current) endDrag();
    },
    [endDrag]
  );

  const onKey = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') setNavWidth(width - STEP);
      else if (event.key === 'ArrowRight') setNavWidth(width + STEP);
      else if (event.key === 'Home') resetNavWidth();
      else return;
      event.preventDefault();
    },
    [width]
  );

  return (
    <>
      <div
        className={className ? `${styles['nav']} ${className}` : styles['nav']}
        style={
          fixed
            ? undefined
            : { width, minWidth: width, maxWidth: width, flexShrink: 0 }
        }
      >
        {children}
      </div>
      {!fixed && (
        <Box
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize the list"
          aria-valuenow={width}
          aria-valuemin={NAV_MIN}
          aria-valuemax={NAV_MAX}
          tabIndex={0}
          title="Drag to resize. Double press to put it back"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onDoubleClick={() => resetNavWidth()}
          onKeyDown={onKey}
          sx={{
            flex: '0 0 7px',
            ml: '-4px',
            mr: '-3px',
            zIndex: 1,
            cursor: 'col-resize',
            position: 'relative',
            touchAction: 'none',
            // the rule itself: two pixels down the middle of a seven pixel
            // reach, quiet until the hand is on it
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: '3px',
              width: '2px',
              bgcolor: 'transparent',
              transition: 'background-color 120ms ease',
            },
            '&:hover::after, &:focus-visible::after': {
              bgcolor: 'primary.main',
            },
            '&:focus-visible': { outline: 'none' },
          }}
        />
      )}
    </>
  );
};

export default NavPane;
