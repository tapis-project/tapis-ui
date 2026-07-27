import React, { useRef, useState } from 'react';
import {
  Box,
  Chip,
  Collapse,
  Link,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ArrowForwardRounded,
  OpenInNewRounded,
  ExpandMoreRounded,
  CircleRounded,
  GitHub,
  MenuBookRounded,
} from '@mui/icons-material';
import { Component } from '@tapis/tapisui-extensions-core';
import { Icon } from '@tapis/tapisui-common';
import {
  CATALOGS,
  Catalog,
  ServiceItem,
  ServiceLink,
  ServiceLinkKind,
  ServiceStatus,
  DOAAS,
  statusCounts,
} from './catalogs';

// Semantic status colors — separate from any brand accent, legible on both
// light and dark grounds.
const STATUS_COLOR: Record<ServiceStatus, string> = {
  live: '#2f9e5b',
  ext: '#6a5cd6',
  soon: '#8b97a4',
};

const BORDER = '1px solid rgba(112, 122, 134, 0.24)';
const fineSx = { fontSize: '0.7rem', color: 'text.secondary' } as const;
// label font-size (0.78rem) × line-height (1.35): the first-line box height.
// The dot/link/chevron each live in a box this tall (top-aligned), so they
// stay pinned to the first line whether the row is 1, 2 or 3 lines tall.
const ROW_LINE = '1.05rem';
const firstLineSx = {
  height: ROW_LINE,
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
} as const;

const StatusDot: React.FC<{ status: ServiceStatus; size?: number }> = ({
  status,
  size = 8,
}) =>
  status === 'soon' ? (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `1.5px solid ${STATUS_COLOR.soon}`,
        flexShrink: 0,
      }}
    />
  ) : (
    <CircleRounded
      sx={{ fontSize: size, color: STATUS_COLOR[status], flexShrink: 0 }}
    />
  );

// Compact destination link. The name truncates (capped width, tighter on
// mobile) so a long name can never blow out the row; the icon never shrinks.
const goSx = (color: string) =>
  ({
    fontFamily: 'monospace',
    fontSize: '0.7rem',
    color,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    maxWidth: { xs: '5.5rem', sm: '9rem' },
    flexShrink: 0,
    px: 0.75,
    py: 0.3,
    borderRadius: 1.5,
    border: '1px solid transparent',
    '&:hover': {
      borderColor: 'rgba(112,122,134,0.35)',
      bgcolor: 'background.paper',
    },
  } as const);

// The monospace blue catalog-code chip — shared by the panel headers (opens
// the catalog's full page) and the header jump row (scrolls to the panel).
const codeChipSx = {
  height: 18,
  flexShrink: 0,
  fontFamily: 'monospace',
  fontSize: '0.65rem',
  fontWeight: 600,
  borderRadius: 1,
  color: '#2f7fd1',
  bgcolor: 'rgba(47,127,209,0.12)',
  '& .MuiChip-label': { px: 0.75 },
} as const;

/** DOM id a catalog panel scrolls to from the header jump chips */
const panelId = (code: string) => `sv2-catalog-${code}`;

// An icon-font glyph (the TapisUI sidebar icons) sized for link buttons —
// destinations like Pods/Jobs/Files carry the exact icon users know from
// the side pane.
const FontIcon: React.FC<{ name: string; size?: string }> = ({
  name,
  size,
}) => (
  <Box
    component="span"
    sx={{
      // the font glyphs render visually heavier than the MUI icons at the
      // same size — keep them a step smaller so the buttons read evenly
      fontSize: size ?? '0.7rem',
      lineHeight: 1,
      display: 'inline-flex',
      flexShrink: 0,
    }}
  >
    <Icon name={name} />
  </Box>
);

// kind-icon table entries; each accepts (and ignores) the sx the MUI icons take
const PodGlyph: React.FC<{ sx?: unknown }> = () => (
  <FontIcon name="visualization" />
);
// no Python mark in MUI icons or the tapis icon font — a "Py" text glyph,
// same treatment as the "UI" portal glyph
const PyGlyph: React.FC<{ sx?: unknown }> = () => (
  <Box
    component="span"
    sx={{ fontFamily: 'monospace', fontSize: '0.58rem', fontWeight: 700 }}
  >
    Py
  </Box>
);
const NpmGlyph: React.FC<{ sx?: unknown }> = () => (
  <Box
    component="span"
    sx={{ fontFamily: 'monospace', fontSize: '0.5rem', fontWeight: 700 }}
  >
    npm
  </Box>
);

const LINK_ICON: Record<ServiceLinkKind, React.ElementType> = {
  portal: ArrowForwardRounded,
  docs: MenuBookRounded,
  repo: GitHub,
  pod: PodGlyph,
  pypi: PyGlyph,
  npm: NpmGlyph,
  site: OpenInNewRounded,
};

/**
 * Explicit kind, or inferred from the href: '/route' → portal,
 * github.com/.io → repo, readthedocs / tutorials → docs, pypi.org → pypi,
 * npmjs.com → npm, *.pods.<tenant>.tapis.io → pod (deployed pod service),
 * else site.
 */
const linkKind = (link: ServiceLink): ServiceLinkKind =>
  link.kind ??
  (link.href.startsWith('/')
    ? 'portal'
    : /github\.(com|io)/.test(link.href)
    ? 'repo'
    : /readthedocs\.|\/tutorials?\//.test(link.href)
    ? 'docs'
    : link.href.includes('pypi.org')
    ? 'pypi'
    : link.href.includes('npmjs.com')
    ? 'npm'
    : /\.pods\.[^/]*\.tapis\.io/.test(link.href)
    ? 'pod' // a deployed pod's live service URL — purple container (external)
    : 'site');

/**
 * One destination button on an expanded row. Portal routes (href starting
 * with '/') become hash links in-portal; everything else opens a new tab.
 * Colors follow the board's status language: green in-portal, purple off.
 */
const LinkButton: React.FC<{ link: ServiceLink }> = ({ link }) => {
  const isPortal = link.href.startsWith('/');
  const Icon = LINK_ICON[linkKind(link)];
  return (
    <Link
      href={isPortal ? `#${link.href}` : link.href}
      {...(isPortal ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
      underline="none"
      onClick={(e) => e.stopPropagation()}
      sx={{
        ...goSx(isPortal ? STATUS_COLOR.live : STATUS_COLOR.ext),
        maxWidth: 'none',
        border: '1px solid rgba(112,122,134,0.28)',
      }}
    >
      {link.label}
      {link.glyph ? (
        <FontIcon name={link.glyph} />
      ) : (
        <Icon sx={{ fontSize: '0.8rem', flexShrink: 0 }} />
      )}
    </Link>
  );
};

/**
 * Glanceable destination glyph on a COLLAPSED row — one tiny button per
 * destination, icon only: "UI" = a page in TapisUI, the pods container
 * glyph, the GitHub mark, a book for docs, open-in-new for other sites.
 * Tooltip carries the label; the expanded footer repeats the same links
 * with full labels.
 */
const MiniLinkButton: React.FC<{ link: ServiceLink }> = ({ link }) => {
  const kind = linkKind(link);
  const isPortal = link.href.startsWith('/');
  const Glyph = LINK_ICON[kind];
  return (
    <Tooltip
      title={`${link.label} — ${isPortal ? 'in TapisUI' : 'new tab'}`}
      placement="top"
    >
      <Link
        href={isPortal ? `#${link.href}` : link.href}
        {...(isPortal ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
        underline="none"
        onClick={(e) => e.stopPropagation()}
        sx={{
          width: 20,
          height: 18,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isPortal ? STATUS_COLOR.live : STATUS_COLOR.ext,
          borderRadius: 1,
          border: '1px solid transparent',
          flexShrink: 0,
          '&:hover': {
            borderColor: 'rgba(112,122,134,0.35)',
            bgcolor: 'background.paper',
          },
        }}
      >
        {/* font glyphs run ~15% smaller collapsed than in the expanded
            footer — at mini-button scale they otherwise crowd the box */}
        {link.glyph ? (
          <FontIcon name={link.glyph} size="0.6rem" />
        ) : kind === 'pod' ? (
          <FontIcon name="visualization" size="0.6rem" />
        ) : kind === 'portal' ? (
          <Box
            component="span"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.58rem',
              fontWeight: 700,
            }}
          >
            UI
          </Box>
        ) : (
          <Glyph sx={{ fontSize: '0.85rem', flexShrink: 0 }} />
        )}
      </Link>
    </Tooltip>
  );
};

/**
 * The kind → glyph mapping as a standalone element (no link, no tooltip), for
 * the icon legend. Mirrors the kind branches MiniLinkButton renders so the
 * legend always shows the exact marks users see on the rows.
 */
const KindGlyph: React.FC<{ kind: ServiceLinkKind }> = ({ kind }) => {
  if (kind === 'pod') return <FontIcon name="visualization" size="0.6rem" />;
  if (kind === 'portal')
    return (
      <Box
        component="span"
        sx={{ fontFamily: 'monospace', fontSize: '0.58rem', fontWeight: 700 }}
      >
        UI
      </Box>
    );
  const Glyph = LINK_ICON[kind];
  return <Glyph sx={{ fontSize: '0.85rem', flexShrink: 0 }} />;
};

// The core Tapis platform icon-font glyphs — the exact iconName each service
// uses in the main sidebar (see Sidebar.tsx's sidebarItems + the Tapis
// section registered in index.ts), so a link that points at a named Tapis
// service (Systems/Files/Jobs/Apps/Workflows/Pods) carries the identical mark
// a user already recognizes from the side pane, and the legend calls it out
// as its own group rather than mixing it into the generic link-kind glyphs.
const TAPIS_LEGEND_ITEMS: { glyph: string; label: string }[] = [
  { glyph: 'data-files', label: 'Systems' },
  { glyph: 'folder', label: 'Files' },
  { glyph: 'jobs', label: 'Jobs' },
  { glyph: 'applications', label: 'Apps' },
  { glyph: 'publications', label: 'Workflows' },
  { glyph: 'visualization', label: 'Pods' },
];

/** One Tapis-icon + label pair — always green (a page inside TapisUI). */
const TapisLegendItem: React.FC<{ glyph: string; label: string }> = ({
  glyph,
  label,
}) => (
  <Stack
    direction="row"
    spacing={0.5}
    alignItems="center"
    sx={{ whiteSpace: 'nowrap' }}
  >
    <Box
      sx={{
        width: 20,
        height: 18,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: STATUS_COLOR.live,
        border: BORDER,
        borderRadius: 1,
        flexShrink: 0,
      }}
    >
      <FontIcon name={glyph} size="0.68rem" />
    </Box>
    <Typography sx={fineSx}>{label}</Typography>
  </Stack>
);

// The generic destination-kind glyphs — what a link resolves to when it
// ISN'T one of the named Tapis services above. Ordered in-portal first
// (green), then off-platform (purple) — the same green/purple language the
// row buttons and status dots use. ('pod' is omitted here — a live deployed
// pod renders the same Pods glyph already shown in the Tapis group above.)
const LEGEND_ITEMS: { kind: ServiceLinkKind; label: string }[] = [
  { kind: 'repo', label: 'Code on GitHub' },
  { kind: 'docs', label: 'Docs & guides' },
  { kind: 'pypi', label: 'PyPI package' },
  { kind: 'npm', label: 'npm package' },
  { kind: 'site', label: 'External site' },
];

/** One glyph + label pair; glyph boxed and colored like the mini row buttons. */
const LegendItem: React.FC<{ kind: ServiceLinkKind; label: string }> = ({
  kind,
  label,
}) => (
  <Stack
    direction="row"
    spacing={0.5}
    alignItems="center"
    sx={{ whiteSpace: 'nowrap' }}
  >
    <Box
      sx={{
        width: 20,
        height: 18,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: kind === 'portal' ? STATUS_COLOR.live : STATUS_COLOR.ext,
        border: BORDER,
        borderRadius: 1,
        flexShrink: 0,
      }}
    >
      <KindGlyph kind={kind} />
    </Box>
    <Typography sx={fineSx}>{label}</Typography>
  </Stack>
);

const legendGroupLabelSx = {
  ...fineSx,
  fontSize: '0.58rem',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  mb: 0.5,
} as const;

// Inside the title tile, hairline-divided under the mini-stats. Split top
// (Tapis) / bottom (generic links) so the two glyph vocabularies never blur
// together.
const IconLegendTile: React.FC = () => (
  <Box sx={{ mt: 1.25, pt: 1.25, borderTop: BORDER }}>
    <Typography sx={legendGroupLabelSx}>Tapis</Typography>
    <Stack
      direction="row"
      spacing={1.1}
      useFlexGap
      sx={{ flexWrap: 'wrap', rowGap: 0.5 }}
    >
      {/* generic "somewhere in TapisUI" glyph leads, then the named services */}
      <LegendItem kind="portal" label="TapisUI Page" />
      {TAPIS_LEGEND_ITEMS.map((it) => (
        <TapisLegendItem key={it.glyph} {...it} />
      ))}
    </Stack>
    <Typography sx={{ ...legendGroupLabelSx, mt: 1, pt: 1, borderTop: BORDER }}>
      Links
    </Typography>
    <Stack
      direction="row"
      spacing={1.1}
      useFlexGap
      sx={{ flexWrap: 'wrap', rowGap: 0.5 }}
    >
      {LEGEND_ITEMS.map((it) => (
        <LegendItem key={it.kind} {...it} />
      ))}
    </Stack>
  </Box>
);

/**
 * One service row (ready or upcoming). Collapsed it stays a single tidy line
 * (label ellipsis-truncated) with a strip of glanceable destination glyphs
 * on the right — one tiny button per link. Clicking the row toggles the FULL
 * label + description + labeled link buttons open beneath it — state is
 * per-row (isolated), so any number can be open at once. Link clicks stop
 * propagation so they navigate without toggling.
 */
const ServiceRow: React.FC<{ item: ServiceItem }> = ({ item }) => {
  const [open, setOpen] = useState(false);
  // every destination: the primary (item.href, labeled by item.name) plus
  // extras — collapsed shows them as glyphs, expanded as labeled buttons.
  // kind is inferred from the href (github → repo mark, '/x' → UI, …).
  const allLinks: ServiceLink[] = [
    ...(item.href ? [{ label: item.name ?? 'Open', href: item.href }] : []),
    ...(item.links ?? []),
  ];

  return (
    <Box sx={{ borderTop: BORDER }}>
      {/* Always top-aligned; the dot/link/chevron each sit in a first-line-
          height box so they stay pinned to the first line and never shift
          when the row opens or grows to 2–3 lines. The label truncates when
          collapsed and un-truncates in place when open (no duplicate title). */}
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        alignItems="flex-start"
        onClick={() => setOpen((v) => !v)}
        sx={{
          pl: 1.5,
          // tighter on the right so the glyphs + chevron hug the edge
          pr: 0.75,
          py: 0.85,
          cursor: 'pointer',
          userSelect: 'none',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <Box sx={firstLineSx}>
          <StatusDot status={item.status} />
        </Box>
        <Typography
          sx={{
            fontSize: '0.78rem',
            lineHeight: 1.35,
            flex: 1,
            minWidth: 0,
            ...(open
              ? {}
              : {
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }),
          }}
        >
          {item.label}
        </Typography>
        {allLinks.length > 0 && (
          <Stack
            direction="row"
            spacing={0.25}
            useFlexGap
            alignItems="center"
            sx={firstLineSx}
          >
            {allLinks.map((l) => (
              <MiniLinkButton key={l.label + l.href} link={l} />
            ))}
          </Stack>
        )}
        {/* pull the chevron in toward the glyph strip — the Stack's spacing
            alone leaves the right side airier than the rest of the row */}
        <Box sx={{ ...firstLineSx, ml: -0.5 }}>
          <ExpandMoreRounded
            sx={{
              fontSize: '0.95rem',
              // secondary (not disabled) — the chevron is the only hint that
              // rows expand, so it has to read as interactive
              color: 'text.secondary',
              transform: open ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.15s',
            }}
          />
        </Box>
      </Stack>
      <Collapse in={open}>
        {/* flush-left with the row start (matches the header Stack's pl) rather
            than hanging-indented under the label — keeps every row's text on one
            even left margin. */}
        <Box sx={{ pl: 1.5, pr: 1.5, pb: 0.85 }}>
          <Typography sx={{ ...fineSx, lineHeight: 1.45 }}>
            {item.description}
          </Typography>
          {item.callout && (
            <Box
              sx={{
                mt: 0.75,
                px: 1.25,
                py: 0.85,
                borderRadius: '10px 10px 10px 2px',
                bgcolor: 'rgba(47, 127, 209, 0.09)',
                border: '1px solid rgba(47, 127, 209, 0.25)',
              }}
            >
              <Typography sx={{ fontSize: '0.72rem', lineHeight: 1.5 }}>
                Reach out to{' '}
                <Link
                  href={`mailto:${item.callout.email}`}
                  onClick={(e) => e.stopPropagation()}
                  sx={{ fontWeight: 600 }}
                >
                  {item.callout.email}
                </Link>{' '}
                {item.callout.text}
              </Typography>
            </Box>
          )}
          {allLinks.length > 0 && (
            <Stack
              direction="row"
              spacing={0.5}
              useFlexGap
              justifyContent="flex-end"
              sx={{ flexWrap: 'wrap', mt: 0.85 }}
            >
              {allLinks.map((l) => (
                <LinkButton key={l.label + l.href} link={l} />
              ))}
            </Stack>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

const CountPill: React.FC<{
  n: number;
  color: string;
  label: string;
  hollow?: boolean;
}> = ({ n, color, label, hollow }) => (
  // useFlexGap: margin-based Stack spacing skips text nodes, which let the
  // number sit on top of the dot; CSS gap spaces every flex item.
  <Stack
    direction="row"
    spacing={0.5}
    useFlexGap
    alignItems="center"
    sx={{
      fontFamily: 'monospace',
      fontSize: '0.62rem',
      color,
      bgcolor: `${color}1f`,
      px: 0.6,
      py: 0.25,
      borderRadius: 1,
      whiteSpace: 'nowrap',
    }}
  >
    <Box
      sx={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        flexShrink: 0,
        ...(hollow
          ? { border: `1px solid ${color}` }
          : { backgroundColor: color }),
      }}
    />
    <Box component="span">
      {n} {label}
    </Box>
  </Stack>
);

const CatalogPanel: React.FC<{
  catalog: Catalog;
  /** shared across all panels — open one 'upcoming' section, open them all */
  soonOpen: boolean;
  onToggleSoon: () => void;
  /** briefly glow — set when a header jump chip lands on this panel */
  flash?: boolean;
}> = ({ catalog, soonOpen, onToggleSoon, flash }) => {
  const counts = statusCounts(catalog.items);
  const ready = catalog.items.filter((i) => i.status !== 'soon');
  const soon = catalog.items.filter((i) => i.status === 'soon');
  // A catalog with nothing ready yet would render as an empty shell with every
  // row hidden behind the accordion — those open by default instead, with a
  // local toggle (the shared open-all toggle would mislabel them).
  const allUpcoming = ready.length === 0;
  const [emptyOpen, setEmptyOpen] = useState(allUpcoming);
  const isOpen = allUpcoming ? emptyOpen : soonOpen;
  const toggleOpen = allUpcoming ? () => setEmptyOpen((v) => !v) : onToggleSoon;

  return (
    <Paper
      id={panelId(catalog.code)}
      elevation={0}
      sx={{
        border: BORDER,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%',
        scrollMarginTop: 12,
        // arrival glow — a blue ring that fades out, so the scroll target is
        // unmistakable even when the page was already scrolled there
        ...(flash
          ? {
              animation: 'sv2PanelFlash 1.7s ease-out',
              '@keyframes sv2PanelFlash': {
                '0%': { boxShadow: '0 0 0 4px rgba(47,127,209,0.55)' },
                '35%': { boxShadow: '0 0 0 4px rgba(47,127,209,0.55)' },
                '100%': { boxShadow: '0 0 0 4px rgba(47,127,209,0)' },
              },
            }
          : {}),
      }}
    >
      <Box sx={{ p: 1.25, borderBottom: ready.length ? BORDER : 'none' }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ flexWrap: 'wrap', rowGap: 0.5 }}
        >
          <Tooltip title={`Open the full ${catalog.code} page`} placement="top">
            <Chip
              label={catalog.code}
              size="small"
              component="a"
              href={`#${catalog.sourceRoute}`}
              clickable
              sx={codeChipSx}
            />
          </Tooltip>
          <Typography
            sx={{ fontSize: '0.85rem', fontWeight: 600, flex: 1, minWidth: 0 }}
          >
            {catalog.name}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
            {counts.live + counts.ext > 0 && (
              <CountPill
                n={counts.live + counts.ext}
                color={STATUS_COLOR.live}
                label="live"
              />
            )}
            {counts.soon > 0 && (
              <CountPill
                n={counts.soon}
                color={STATUS_COLOR.soon}
                label="soon"
                hollow
              />
            )}
          </Stack>
        </Stack>
        {/* original page title, kept verbatim */}
        <Tooltip title={catalog.fullTitle} placement="top-start">
          <Typography
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.66rem',
              color: '#2f7fd1',
              mt: 0.5,
              display: 'inline-block',
            }}
          >
            {catalog.expansion}
          </Typography>
        </Tooltip>
        <Typography sx={{ ...fineSx, mt: 0.4, lineHeight: 1.45 }}>
          {catalog.intro}
        </Typography>
      </Box>

      {/* ready services — always visible; click a row to expand its subtext */}
      <Box>
        {ready.map((item) => (
          <ServiceRow key={item.label + item.name} item={item} />
        ))}
      </Box>

      {/* upcoming — hidden behind an accordion; expand to read descriptions */}
      {soon.length > 0 && (
        <Box sx={{ mt: 'auto' }}>
          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            onClick={toggleOpen}
            sx={{
              px: 1.5,
              py: 0.85,
              borderTop: BORDER,
              cursor: 'pointer',
              userSelect: 'none',
              bgcolor: 'rgba(112,122,134,0.04)',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <StatusDot status="soon" />
            <Typography sx={{ ...fineSx, fontWeight: 600, flex: 1 }}>
              {soon.length} upcoming {isOpen ? '— hide' : '— press to preview'}
            </Typography>
            <ExpandMoreRounded
              sx={{
                fontSize: '1rem',
                color: 'text.secondary',
                transform: isOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.15s',
              }}
            />
          </Stack>
          <Collapse in={isOpen}>
            <Box sx={{ opacity: 0.9 }}>
              {soon.map((item) => (
                <ServiceRow key={item.label} item={item} />
              ))}
            </Box>
          </Collapse>
        </Box>
      )}
    </Paper>
  );
};

/**
 * One small inline stat in the title tile — dot + count + label on one line,
 * tooltip teaching what the dot color means on every row below.
 */
const MiniStat: React.FC<{
  n: number;
  label: string;
  color?: string;
  hollow?: boolean;
  hint?: string;
}> = ({ n, label, color, hollow, hint }) => (
  <Tooltip title={hint ?? ''} placement="bottom-start">
    <Stack
      direction="row"
      spacing={0.5}
      useFlexGap
      alignItems="center"
      sx={{
        fontFamily: 'monospace',
        fontSize: '0.68rem',
        color: 'text.secondary',
        whiteSpace: 'nowrap',
        cursor: 'default',
      }}
    >
      {color && (
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            flexShrink: 0,
            ...(hollow
              ? { border: `1.5px solid ${color}` }
              : { bgcolor: color }),
          }}
        />
      )}
      <Box component="span">
        <Box
          component="b"
          sx={{
            color: 'text.primary',
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {n}
        </Box>{' '}
        {label}
      </Box>
    </Stack>
  </Tooltip>
);

const TierHead: React.FC<{ k: string; title: string; story: string }> = ({
  k,
  title,
  story,
}) => (
  <Stack
    direction="row"
    spacing={1.25}
    alignItems="baseline"
    sx={{ mb: 1.25, flexWrap: 'wrap' }}
  >
    <Typography
      sx={{
        fontFamily: 'monospace',
        fontSize: '0.68rem',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'text.disabled',
      }}
    >
      {k}
    </Typography>
    <Typography sx={{ fontSize: '0.95rem', fontWeight: 600, flexShrink: 0 }}>
      {title}
    </Typography>
    <Typography
      sx={{ ...fineSx, flex: 1, minWidth: '16ch', textAlign: 'right' }}
    >
      {story}
    </Typography>
  </Stack>
);

export const IcicleServicesV2: Component = () => {
  const all = CATALOGS.flatMap((c) => c.items);
  const nLive = all.filter((i) => i.status === 'live').length;
  const nExt = all.filter((i) => i.status === 'ext').length;
  const nSoon = all.filter((i) => i.status === 'soon').length;
  const agnostic = CATALOGS.filter((c) => c.tier === 'agnostic');
  const domain = CATALOGS.filter((c) => c.tier === 'domain');
  // one shared toggle so opening any 'upcoming' section opens them all
  const [soonOpen, setSoonOpen] = useState(false);
  const toggleSoon = () => setSoonOpen((v) => !v);
  // header jump chips, in board order (DOaaS lands on the Tier 2 section)
  const jumps = [
    ...agnostic.map((c) => ({
      code: c.code,
      tip: `${c.expansion} — ${c.name}`,
    })),
    {
      code: DOAAS.code,
      tip: `${DOAAS.expansion} — the umbrella over the three domain catalogs`,
    },
    ...domain.map((c) => ({ code: c.code, tip: `${c.expansion} — ${c.name}` })),
  ];
  // scroll to the panel and glow it; if the target is already on screen the
  // glow is the only feedback, so it always fires. DOaaS glows all three
  // domain panels (it's the umbrella, not a panel of its own).
  const [flash, setFlash] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const jumpSeq = useRef(0);
  const jumpTo = (code: string) => {
    const el = document.getElementById(panelId(code));
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (flashTimer.current) clearTimeout(flashTimer.current);
    // clear so re-clicking the same chip restarts the CSS animation
    setFlash(null);
    // Glow only once the smooth scroll LANDS (the target's rect holds still
    // for a couple frames) — fired on click it plays out mid-flight and the
    // arrival looks like nothing. 1.5s cap in case scrolling is interrupted.
    const seq = ++jumpSeq.current;
    const t0 = performance.now();
    let lastTop = NaN;
    let stillFrames = 0;
    const waitForSettle = () => {
      if (jumpSeq.current !== seq) return; // superseded by a newer jump
      const top = el.getBoundingClientRect().top;
      stillFrames = Math.abs(top - lastTop) < 0.5 ? stillFrames + 1 : 0;
      lastTop = top;
      if (stillFrames >= 2 || performance.now() - t0 > 1500) {
        setFlash(code);
        flashTimer.current = setTimeout(() => setFlash(null), 1800);
      } else {
        requestAnimationFrame(waitForSettle);
      }
    };
    requestAnimationFrame(waitForSettle);
  };

  return (
    <Box sx={{ height: '100%', overflowY: 'auto' }}>
      <Box
        sx={{
          maxWidth: 1180,
          mx: 'auto',
          width: '100%',
          p: { xs: 1.5, sm: 2.5 },
          pb: 6,
        }}
      >
        {/* bento header — title tile left, intro blob right */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' },
            gap: 1.75,
            // the summary strip used to sit between header and Tier 1 — its
            // spacing folds in here now that the stats live in the title tile
            mb: 3,
          }}
        >
          <Box
            sx={{
              border: BORDER,
              borderRadius: 2,
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              background:
                'linear-gradient(135deg, rgba(47,127,209,0.07), rgba(47,127,209,0.01))',
            }}
          >
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.68rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#2f7fd1',
              }}
            >
              ICICLE · Unified Services
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '1.15rem', sm: '1.4rem' },
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                textWrap: 'balance',
                mt: 0.5,
              }}
            >
              Welcome to ICICLE&apos;s services board
            </Typography>
            {/* compact board summary — dots teach the row status colors */}
            <Stack
              direction="row"
              spacing={1.25}
              useFlexGap
              sx={{ flexWrap: 'wrap', rowGap: 0.5, mt: 1 }}
            >
              <MiniStat
                n={all.length}
                label="services"
                color="#2f7fd1"
                hint="Every service on this board, across all catalogs below."
              />
              <MiniStat
                n={nLive}
                label="in TapisUI"
                color={STATUS_COLOR.live}
                hint="Green dot — runs inside TapisUI; its link takes you straight there."
              />
              <MiniStat
                n={nExt}
                label="external"
                color={STATUS_COLOR.ext}
                hint="Purple dot — ready to use, but lives off-platform (GitHub or docs); opens in a new tab."
              />
              <MiniStat
                n={nSoon}
                label="upcoming"
                color={STATUS_COLOR.soon}
                hollow
                hint="Hollow dot — planned but not available yet; expand a catalog's 'upcoming' section to read about them."
              />
              <MiniStat
                n={CATALOGS.length}
                label="catalogs"
                color="#2f7fd1"
                hint="Each catalog below mirrors one of the original as-a-Service pages — click its code chip to open the full page."
              />
            </Stack>
            {/* icon legend — under the mini-stats in the title tile */}
            <IconLegendTile />
          </Box>
          <Box
            sx={{
              border: BORDER,
              borderRadius: 2,
              p: 2,
              bgcolor: 'action.hover',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            {/* one tooltipped chip per catalog — tap to jump to its panel */}
            <Stack
              direction="row"
              spacing={0.5}
              useFlexGap
              sx={{ flexWrap: 'wrap', mb: 1 }}
            >
              {jumps.map((j) => (
                <Tooltip key={j.code} title={j.tip} placement="top">
                  <Chip
                    label={j.code}
                    size="small"
                    clickable
                    onClick={() => jumpTo(j.code)}
                    sx={codeChipSx}
                  />
                </Tooltip>
              ))}
            </Stack>
            <Typography sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
              Every ICICLE service on one board — tap a catalog above, open a
              row to learn more, follow its link to use it. Guides live in the{' '}
              <Link href="#/training-catalog" underline="hover">
                Training Catalog
              </Link>
              , visuals in the{' '}
              <Link href="#/component-catalog" underline="hover">
                Component Catalog
              </Link>
              {/* , and hands-on AI — chat, agents, MCP — in the{' '}
              <Link href="#/ai-hub" underline="hover">
                AI Hub
              </Link> */}
              . Our code is open — dig through it all at{' '}
              <Link
                href="https://github.com/ICICLE-ai"
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                sx={{ whiteSpace: 'nowrap' }}
              >
                github.com/ICICLE-ai
              </Link>
              .
            </Typography>
          </Box>
        </Box>

        {/* Tier 1 — domain-agnostic */}
        <Box sx={{ mb: 3.5 }}>
          <TierHead
            k="Tier 1"
            title="Domain-Agnostic"
            story="Plug-and-play across any domain — the AI and CI foundations."
          />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2,1fr)' },
              gap: 1.75,
            }}
          >
            {agnostic.map((c) => (
              <CatalogPanel
                key={c.code}
                catalog={c}
                soonOpen={soonOpen}
                onToggleSoon={toggleSoon}
                flash={flash === c.code}
              />
            ))}
          </Box>
        </Box>

        {/* Tier 2 — domain-specific (DOaaS) */}
        <Box id={panelId(DOAAS.code)} sx={{ scrollMarginTop: 12 }}>
          <TierHead
            k={`Tier 2 · ${DOAAS.code}`}
            title={DOAAS.fullTitle}
            story={DOAAS.intro}
          />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3,1fr)' },
              gap: 1.75,
            }}
          >
            {domain.map((c) => (
              <CatalogPanel
                key={c.code}
                catalog={c}
                soonOpen={soonOpen}
                onToggleSoon={toggleSoon}
                flash={flash === c.code || flash === DOAAS.code}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default IcicleServicesV2;
