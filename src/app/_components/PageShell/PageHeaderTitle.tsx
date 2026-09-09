import React, { useSyncExternalStore } from 'react';
import { Box, Tooltip } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import {
  getInfoDetail,
  setInfoDetail,
  subscribeInfoDetail,
} from './infoDetail';
import {
  getBoundedWidth,
  getPageWide,
  NAV_COLUMN_WIDTH,
  setPageWide,
  subscribePageWide,
} from './pageWidth';

/**
 * The page title in a header bar — and the way back to the page's landing.
 *
 * It was a plain span, so the most obvious thing to click when you are three
 * levels into a job did nothing at all. It is a button now: no underline,
 * because a header title that looks like body-copy link is worse than one
 * that looks like a title, and a soft highlight on hover instead.
 */
export const PageHeaderTitle: React.FC<
  React.PropsWithChildren<{ to: string }>
> = ({ to, children }) => {
  const history = useHistory();
  return (
    <Tooltip title="Back to the overview" enterDelay={400}>
      <Box
        component="button"
        type="button"
        onClick={() => history.push(to)}
        sx={{
          font: 'inherit',
          fontWeight: 600,
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          borderRadius: '4px',
          px: 0.5,
          py: 0.1,
          mx: -0.5,
          color: 'inherit',
          textDecoration: 'none',
          transition: 'background-color 120ms ease, box-shadow 120ms ease',
          '&:hover': {
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            boxShadow: (theme) =>
              `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
          },
        }}
      >
        {children}
      </Box>
    </Tooltip>
  );
};

/**
 * The ? in a page header: turns the page's explanatory text on and off.
 *
 * Deliberately the same 18px rectangle the docs glyph beside it uses, because
 * they are two switches on the same shelf — one opens the manual, one decides
 * how much this page says for itself.
 *
 * Pressed is drawn in the text colour, not the primary blue. Blue is what this
 * app uses to mean 'public' and 'a link'; on a switch that is on by default it
 * only says 'notice me', on every page, forever. Ink and a grey fill say
 * 'pressed' without claiming to be interesting.
 */
export const InfoDetailToggle: React.FC = () => {
  const on = useSyncExternalStore(subscribeInfoDetail, getInfoDetail);
  return (
    <Tooltip
      title={on ? 'Hide the page descriptions' : 'Show the page descriptions'}
    >
      <Box
        component="button"
        type="button"
        aria-label="Toggle page descriptions"
        aria-pressed={on}
        onClick={() => setInfoDetail(!on)}
        sx={{
          width: 18,
          height: 18,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid',
          borderColor: on ? 'text.primary' : 'divider',
          borderRadius: '4px',
          bgcolor: on ? 'rgba(0,0,0,0.07)' : 'transparent',
          cursor: 'pointer',
          fontSize: '0.68rem',
          fontWeight: 700,
          lineHeight: 1,
          color: on ? 'text.primary' : 'text.secondary',
          p: 0,
          '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' },
        }}
      >
        ?
      </Box>
    </Tooltip>
  );
};

/**
 * Outline preview of the shape the page will TAKE, not the one it is in —
 * lifted verbatim from the Pods stacks page so the two controls are the same
 * control, not two drawings of the same idea.
 */
const WidthGlyph: React.FC<{ wide: boolean }> = ({ wide }) => (
  <svg width="18" height="12" style={{ display: 'block' }}>
    <rect
      x="0.5"
      y="0.5"
      width="17"
      height="11"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      opacity="0.45"
    />
    {wide ? (
      // currently wide → clicking bounds it: centered column
      <rect
        x="5"
        y="2.5"
        width="8"
        height="7"
        fill="currentColor"
        opacity="0.8"
      />
    ) : (
      // currently bounded → clicking fills the viewport
      <rect
        x="2"
        y="2.5"
        width="14"
        height="7"
        fill="currentColor"
        opacity="0.8"
      />
    )}
  </svg>
);

/** Sits beside the ? — both are 'how should this page present itself'. */
export const PageWidthToggle: React.FC = () => {
  const wide = useSyncExternalStore(subscribePageWide, getPageWide);
  return (
    <Tooltip
      title={
        wide
          ? 'Bound the page to a comfortable reading width'
          : 'Expand the page to the full window width'
      }
    >
      <Box
        component="button"
        type="button"
        aria-label="Toggle page width"
        aria-pressed={wide}
        onClick={() => setPageWide(!wide)}
        sx={{
          height: 18,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 0.25,
          border: '1px solid',
          borderColor: wide ? 'text.primary' : 'divider',
          borderRadius: '4px',
          bgcolor: wide ? 'rgba(0,0,0,0.07)' : 'transparent',
          cursor: 'pointer',
          color: wide ? 'text.primary' : 'text.secondary',
          p: 0,
          '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' },
        }}
      >
        <WidthGlyph wide={wide} />
      </Box>
    </Tooltip>
  );
};

/**
 * The header bar's contents, bounded to the same right edge as the page.
 *
 * Narrowing only the working pane left the header's actions — Refresh, the
 * file rail — stranded at the far edge of a wide window, pointing at nothing.
 * The bar itself still spans the window (its rule should); what it holds stops
 * where the content stops.
 *
 * The header sits ABOVE the nav rather than beside it, so the matching bound
 * is nav + column, not the column alone.
 */
export const PageHeaderRow: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const wide = useSyncExternalStore(subscribePageWide, getPageWide);
  const bounded = useSyncExternalStore(subscribePageWide, getBoundedWidth);
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        width: '100%',
        minWidth: 0,
        maxWidth: wide ? 'none' : bounded + NAV_COLUMN_WIDTH,
      }}
    >
      {children}
    </Box>
  );
};

export default PageHeaderTitle;
