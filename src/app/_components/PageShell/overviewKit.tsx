/**
 * overviewKit — the shared grammar for page landing dashboards (Jobs, Files,
 * Apps): stat tiles, wells, section titles, and the dense table those pages
 * list their objects in. Extracted from the jobs dashboard once three pages
 * wanted the same pieces.
 */
import React from 'react';
import {
  Box,
  CircularProgress,
  Skeleton,
  Tooltip,
  Typography,
} from '@mui/material';
import { AppsRounded, DnsRounded, GridViewRounded } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';
import { useTableDensity } from './tableRail';

export const SURFACE = '#fcfcfb';

export const WELL = {
  bgcolor: SURFACE,
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 1,
  p: 1.25,
} as const;

export const Tile: React.FC<{
  n: React.ReactNode;
  label: string;
  color?: string;
  /** what the number is counting, when the label cannot say it in two words */
  hint?: string;
}> = ({ n, label, color, hint }) => {
  const tile = (
    <Box sx={{ ...WELL, minWidth: 90, textAlign: 'center' }}>
      <Typography
        sx={{
          fontSize: 22,
          fontWeight: 700,
          lineHeight: 1.1,
          color:
            color && (typeof n !== 'number' || n > 0) ? color : 'text.primary',
        }}
      >
        {n}
      </Typography>
      <Typography sx={{ fontSize: '0.66rem', color: 'text.secondary' }}>
        {label}
      </Typography>
    </Box>
  );
  return hint ? <Tooltip title={hint}>{tile}</Tooltip> : tile;
};

/**
 * The head-line action press — Cancel, Resubmit, JSON and their kin.
 *
 * The same 22px bordered grammar as the breadcrumb bar's back/up/top
 * buttons, so a card's actions read as part of the page's chrome instead of
 * stock MUI buttons shouting in uppercase. `href` makes it a real anchor
 * (middle-click opens a tab); `busy` swaps the glyph for a spinner without
 * the width jumping.
 */
export const HeadAction: React.FC<{
  label: string;
  icon?: React.ReactNode;
  title?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  /** red at rest — the press that ends something */
  danger?: boolean;
  /** held-down look for a toggle that is currently on */
  active?: boolean;
  busy?: boolean;
  disabled?: boolean;
}> = ({
  label,
  icon,
  title,
  onClick,
  href,
  danger,
  active,
  busy,
  disabled,
}) => {
  const sx = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.5,
    height: 22,
    boxSizing: 'border-box',
    px: 0.75,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: '4px',
    bgcolor: 'transparent',
    fontFamily: 'inherit',
    fontSize: '0.68rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    textDecoration: 'none',
    color: danger ? '#c62828' : 'text.secondary',
    ...(active && { bgcolor: 'rgba(0,0,0,0.05)', color: 'text.primary' }),
    '&:hover': danger
      ? { bgcolor: 'rgba(198,40,40,0.06)', borderColor: '#c6282866' }
      : { bgcolor: 'rgba(0,0,0,0.05)', color: 'text.primary' },
    '&:disabled': {
      cursor: 'default',
      color: 'text.disabled',
      borderColor: 'rgba(0,0,0,0.06)',
    },
    '& svg': { fontSize: 13, display: 'block' },
  } as const;
  const inner = (
    <>
      {busy ? <CircularProgress size={12} color="inherit" /> : icon}
      {label}
    </>
  );
  const press = href ? (
    <Box
      component="a"
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={onClick}
      sx={sx}
    >
      {inner}
    </Box>
  ) : (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      sx={sx}
    >
      {inner}
    </Box>
  );
  if (!title) return press;
  return (
    <Tooltip title={title} arrow describeChild>
      {/* a disabled button cannot hold a tooltip — the span takes it */}
      <span style={{ display: 'inline-flex' }}>{press}</span>
    </Tooltip>
  );
};

export const HCell: React.FC<{
  children: React.ReactNode;
  width?: number | string;
}> = ({ children, width }) => (
  <Typography
    component="th"
    sx={{
      textAlign: 'left',
      fontSize: '0.64rem',
      fontWeight: 700,
      color: 'text.secondary',
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      py: 0.5,
      px: 0.75,
      width,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </Typography>
);

export const Cell: React.FC<{
  children: React.ReactNode;
  mono?: boolean;
  muted?: boolean;
}> = ({ children, mono, muted }) => {
  // the shared preference: one density press roomies every landing table
  const density = useTableDensity();
  return (
    <Typography
      component="td"
      sx={{
        fontSize: '0.72rem',
        py: density === 'comfortable' ? 0.95 : 0.55,
        px: 0.75,
        fontFamily: mono ? 'monospace' : undefined,
        color: muted ? 'text.secondary' : 'text.primary',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: 0,
      }}
    >
      {children}
    </Typography>
  );
};
/**
 * The narrow first column every landing table opens with: one state glyph per
 * row, centred.
 *
 * Centred because a left-aligned icon puts all the slack on one side and
 * reads as a gap between it and the name. And a column rather than an inline
 * glyph because inline it crowds the text it sits beside — the gap that looks
 * right next to 'flexserv' is not the one that looks right next to a status
 * icon.
 *
 * 2rem, fixed. A percentage made the column a function of how wide the window
 * happens to be, which is not what a 14px glyph needs; the three width props
 * pin it whichever layout algorithm the table ends up using. The other columns
 * still have to sum to 100% — under table-layout: fixed the browser shares any
 * leftover width across every column that has one, and this column is the one
 * that shows it.
 */
/** Pass to the matching <HCell width={GLYPH_COLUMN}> so the header lines up. */
/**
 * The "nothing here" glyph for a table cell.
 *
 * An em-dash is the right character for this one job: it is a placeholder
 * standing in for a value, not prose, and no period or comma substitutes
 * for it. Defined once so the copy gate has one line to forgive instead of
 * a dozen scattered literals, and so every table's blank cell looks alike.
 */
// eslint-disable-next-line no-restricted-syntax
export const NO_VALUE = '—';

export const GLYPH_COLUMN = '2rem';

export const GlyphCell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <Box
    component="td"
    sx={{
      width: GLYPH_COLUMN,
      minWidth: GLYPH_COLUMN,
      maxWidth: GLYPH_COLUMN,
      px: 0,
      textAlign: 'center',
      whiteSpace: 'nowrap',
      '& svg': { fontSize: 14, verticalAlign: 'middle' },
    }}
  >
    {children}
  </Box>
);

/**
 * One look for every link that leaves the page.
 *
 * Third attempt. Blue-at-rest turned a table into a wall of links; no hint
 * at all gave no reason to click; a grey underline under every app and
 * system name gave every card a dotted-line rash and still read as
 * decoration rather than as a destination.
 *
 * So the hint is a glyph, not a rule: an app wears the applications mark, a
 * system wears a server, and the text is left alone in its own colour. Hover
 * is a soft blue wash and the blue text — the same feedback a file manager
 * gives a row, which is the thing this behaves like. The wash is padded and
 * negatively margined so it has room to breathe without moving anything.
 */
export const CROSS_LINK_SX = {
  color: 'inherit',
  textDecoration: 'none',
  cursor: 'pointer',
  borderRadius: '3px',
  px: '3px',
  mx: '-3px',
  '&:hover': {
    color: '#1565c0',
    bgcolor: 'rgba(21,101,192,0.09)',
  },
  '&:hover svg': { color: 'inherit' },
} as const;

/** What a cross-page link points at, and the mark it wears for it. */
export type LinkKind = 'app' | 'system' | 'files';

const LINK_GLYPH: Record<LinkKind, typeof AppsRounded> = {
  app: AppsRounded,
  system: DnsRounded,
  files: GridViewRounded,
};

/**
 * A name inside a table cell that is also the way to that thing's own page.
 *
 * A real anchor, so middle-click and ⌘-click open a tab the way they do
 * everywhere else; the left-click is intercepted for the router so it stays a
 * SPA navigation. And it stops the click reaching the row it sits in — the
 * rows navigate too, so without that, following the app named in a job would
 * open the job.
 */
export const CellLink: React.FC<
  React.PropsWithChildren<{
    to: string;
    /** the mark that says what is at the other end; omitted, none is drawn */
    kind?: LinkKind;
  }>
> = ({ to, kind, children }) => {
  const history = useHistory();
  const Glyph = kind ? LINK_GLYPH[kind] : undefined;
  return (
    <Box
      component="a"
      href={`/#${to}`}
      onClick={(event: React.MouseEvent) => {
        // let the browser have the modified clicks: new tab, new window
        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          (event as React.MouseEvent).button !== 0
        ) {
          event.stopPropagation();
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        history.push(to);
      }}
      sx={{
        ...CROSS_LINK_SX,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        maxWidth: '100%',
        minWidth: 0,
        verticalAlign: 'bottom',
      }}
    >
      {Glyph && (
        <Glyph sx={{ fontSize: 13, flexShrink: 0, color: 'text.disabled' }} />
      )}
      <Box
        component="span"
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

/**
 * The row a table shows when it has none.
 *
 * All three landings used to answer "you have nothing" by replacing the
 * whole page with a paragraph — no About block, no tiles, no toolbar, no
 * table header. That is a second page for the least interesting state there
 * is, and it hides every control that would have got you out of it.
 *
 * So the page is always the page and the table says it, in the one place a
 * table has for saying things. Two readings, because they want different
 * answers: nothing exists yet, or nothing here matches what you typed.
 */
export const EmptyRow: React.FC<{
  colSpan: number;
  /** the search that filtered everything out, if that is what happened */
  query?: string;
  /** what this page is for, said once, for someone who has none of them */
  title: string;
  detail: React.ReactNode;
}> = ({ colSpan, query, title, detail }) => (
  <Box component="tr">
    <Box component="td" colSpan={colSpan}>
      <Box sx={{ p: 1.5 }}>
        <Typography sx={{ fontSize: '0.78rem', fontWeight: 600 }}>
          {query ? `Nothing matches “${query}”.` : title}
        </Typography>
        {/* the title sits close enough to read as one cramped paragraph
            without a real gap — and the detail is written to fit one line,
            so no width cap that would fold it */}
        <Typography
          sx={{
            fontSize: '0.72rem',
            color: 'text.secondary',
            mt: 0.75,
            lineHeight: 1.6,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {query ? 'Clear the nav search to see everything again.' : detail}
        </Typography>
      </Box>
    </Box>
  </Box>
);

export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, mb: 0.75 }}>
    {children}
  </Typography>
);

/**
 * Rows-to-be for a landing table's first fetch: the table keeps its real
 * header and column widths, and the body says "rows are coming" in the rows'
 * own shape — a glyph dot and a text line per cell, widths staggered by index
 * so the block doesn't read as one repeated stamp.
 */
export const SkeletonRows: React.FC<{
  cols: number;
  rows?: number;
  /** the table opens with a GlyphCell column (most do) */
  glyph?: boolean;
}> = ({ cols, rows = 8, glyph = true }) => (
  <>
    {Array.from({ length: rows }).map((_, r) => (
      <Box
        component="tr"
        key={r}
        data-skeletonrow=""
        sx={{ borderTop: '1px solid', borderColor: 'divider' }}
      >
        {glyph && (
          <GlyphCell>
            <Skeleton
              variant="circular"
              width={12}
              height={12}
              sx={{ display: 'inline-block' }}
            />
          </GlyphCell>
        )}
        {Array.from({ length: glyph ? cols - 1 : cols }).map((_, c) => (
          <Box component="td" key={c} sx={{ px: 0.75, py: 0.55 }}>
            <Skeleton
              variant="text"
              width={`${80 - ((r * 13 + c * 23) % 45)}%`}
              sx={{ fontSize: '0.72rem' }}
            />
          </Box>
        ))}
      </Box>
    ))}
  </>
);

/** A panel's first fetch: its well, a title line, a few lines of content. */
export const WellSkeleton: React.FC<{ lines?: number }> = ({ lines = 4 }) => (
  <Box sx={{ ...WELL }}>
    <Skeleton variant="text" width="30%" sx={{ fontSize: '0.78rem', mb: 1 }} />
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        width={`${72 - ((i * 19) % 35)}%`}
        sx={{ fontSize: '0.72rem' }}
      />
    ))}
  </Box>
);
