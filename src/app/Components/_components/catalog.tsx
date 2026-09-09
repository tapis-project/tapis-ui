/**
 * The catalog: every house component, named, placed, and dated.
 *
 * The UI's kit grew page by page — pods invented a button, jobs a card,
 * files a status bar — and the pieces are deliberately different where the
 * pages differ. This registry is the order on top of that: one entry per
 * piece, saying what it is, where it came from (the file is the truth),
 * where it is used today, roughly when it entered the codebase, and — when
 * the piece is presentational — a live example right here.
 *
 * Keeping it honest is the maintenance rule: when a component moves or a
 * new surface adopts it, this entry is part of the change. Entries without
 * a demo are ones whose live form needs a page's own data (marked "on
 * page" instead).
 */
import React from 'react';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import { OpenInNewRounded, DescriptionRounded } from '@mui/icons-material';
import PodBarButton from 'app/Pods/_utils/PodBarButton';
import { HeadAction } from 'app/_components/PageShell/overviewKit';
import { DensityButton } from 'app/_components/PageShell/tableRail';
import { TableShell } from 'app/_components/PageShell/tableShell';
import {
  Cell,
  GlyphCell,
  HCell,
  SectionTitle,
  WELL,
} from 'app/_components/PageShell/overviewKit';
import { SystemTypeChip } from 'app/_components/NavV2Kit/SystemTypeTile';
import ErrorDetail from 'app/_components/ErrorDetail/ErrorDetail';
import { Public } from '@mui/icons-material';

export type CatalogEntry = {
  id: string;
  name: string;
  group: string;
  /** roughly when the piece entered the codebase — coarse and honest */
  since: string;
  /** the file that owns it — the source of truth for everything here */
  origin: string;
  usedIn: string[];
  status: 'current' | 'wip' | 'legacy';
  notes?: string;
  /** a live render, only when the piece stands without a page's data */
  demo?: React.ReactNode;
};

export const CATALOG_GROUPS = [
  'Buttons & presses',
  'Tables',
  'Rails & captions',
  'Status & chips',
  'Cards & boxes',
  'Charts',
] as const;

export const CATALOG: CatalogEntry[] = [
  // ── Buttons & presses ────────────────────────────────────────────────────
  {
    id: 'pod-bar-button',
    name: 'PodBarButton',
    group: 'Buttons & presses',
    since: '2026 pods shell era',
    origin: 'src/app/Pods/_utils/PodBarButton.tsx',
    usedIn: [
      'Pods toolbars (everywhere)',
      'Jobs page header (Refresh)',
      'Systems landing (new system)',
      'Files toolbar',
    ],
    status: 'current',
    notes:
      'The house bar button: bordered, small caps feel, loading spin built in. The default press for page headers and toolbars.',
    demo: (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <PodBarButton onClick={() => undefined}>refresh</PodBarButton>
        <PodBarButton loading onClick={() => undefined}>
          fetching…
        </PodBarButton>
      </Box>
    ),
  },
  {
    id: 'head-action',
    name: 'HeadAction',
    group: 'Buttons & presses',
    since: '2026-09 (job head-line rework)',
    origin: 'src/app/_components/PageShell/overviewKit.tsx',
    usedIn: [
      'Job detail head-line (Resubmit / Cancel / JSON)',
      'System summary (JSON)',
      'Session cards (open / panel / stop)',
    ],
    status: 'current',
    notes:
      '22px bordered press with icon + label; danger, busy, active and href variants. The detail-page action grammar.',
    demo: (
      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
        <HeadAction
          label="Open"
          icon={<OpenInNewRounded />}
          onClick={() => undefined}
        />
        <HeadAction
          label="JSON"
          icon={<DescriptionRounded />}
          active
          onClick={() => undefined}
        />
        <HeadAction danger label="Cancel job" onClick={() => undefined} />
        <HeadAction danger busy label="Cancelling…" onClick={() => undefined} />
      </Box>
    ),
  },
  {
    id: 'density-button',
    name: 'DensityButton',
    group: 'Buttons & presses',
    since: '2026-09 (table rail)',
    origin: 'src/app/_components/PageShell/tableRail.tsx',
    usedIn: ['Every landing table, via TableShell'],
    status: 'current',
    notes:
      'One cross-table preference: compact or roomier rows, remembered on this device. The files bar had it first; the rail gave it to everyone.',
    demo: <DensityButton />,
  },
  {
    id: 'micro-button',
    name: 'micro buttons (check / remove / re-check)',
    group: 'Buttons & presses',
    since: '2026-08 (systems credential rows); hoisted to cardKit 2026-09',
    origin: 'src/app/_components/PageShell/cardKit.tsx (MICRO_BTN_SX)',
    usedIn: [
      'System summary credential row',
      'the door box re-check',
      'Sharing & access panel (transfer / make public / + share)',
      'Notes box (raw, show all)',
    ],
    status: 'current',
    notes:
      'Text-sized presses that live INSIDE a fact row. The third consumer arrived and the sx moved to the systems cardKit as promised. On page: /systems/<id>.',
  },
  {
    id: 'files-status-button',
    name: 'StatusButton (files bar)',
    group: 'Buttons & presses',
    since: '2026 files V2',
    origin:
      'packages/tapisui-common/src/components/files/FileListing/FileListingTableV2.tsx',
    usedIn: ['File listing status line (detail columns, density)'],
    status: 'current',
    notes:
      'The quiet 20px icon press the table rail copied. Files keeps its own because its prefs (owner/mode columns) are listing-specific. On page: /files.',
  },
  {
    id: 'sort-label',
    name: 'SortLabel (sortable header)',
    group: 'Buttons & presses',
    since: '2026-09 (apps columns)',
    origin: 'src/app/Apps/_components/AppsOverview.tsx',
    usedIn: ['Apps landing table headers'],
    status: 'wip',
    notes:
      'Press asc → desc → back to the page default. Lives inside AppsOverview today; jobs/systems tables adopting it is the planned next step, then it moves to the kit. On page: /apps.',
  },

  // ── Tables ───────────────────────────────────────────────────────────────
  {
    id: 'table-kit',
    name: 'HCell / Cell / GlyphCell',
    group: 'Tables',
    since: '2026-08 (landing overhaul)',
    origin: 'src/app/_components/PageShell/overviewKit.tsx',
    usedIn: ['Apps, Jobs, Systems landing tables'],
    status: 'current',
    notes:
      'Fixed-layout table grammar: uppercase header cells, ellipsizing body cells (mono/muted variants), the 2rem glyph column. Cells read the density preference.',
    demo: (
      <Box sx={{ ...WELL, p: 0, overflow: 'hidden', maxWidth: 460 }}>
        <Box
          component="table"
          sx={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
          }}
        >
          <Box component="thead" sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
            <Box component="tr">
              <HCell width="2rem"> </HCell>
              <HCell width="40%">System</HCell>
              <HCell>Owner</HCell>
              <HCell>Updated</HCell>
            </Box>
          </Box>
          <Box component="tbody">
            <Box
              component="tr"
              sx={{ borderTop: '1px solid', borderColor: 'divider' }}
            >
              <GlyphCell>
                <Public sx={{ color: '#1565c0' }} />
              </GlyphCell>
              <Cell mono>frontera</Cell>
              <Cell muted>cgarcia</Cell>
              <Cell muted>2h ago</Cell>
            </Box>
          </Box>
        </Box>
      </Box>
    ),
  },
  {
    id: 'apps-columns',
    name: 'AppsColumnsMenu + appsColumns registry',
    group: 'Tables',
    since: '2026-09',
    origin: 'src/app/Apps/_components/appsColumns.ts',
    usedIn: ['Apps landing (the "columns" press)'],
    status: 'current',
    notes:
      'User-chosen columns from a registry, including any "key: value" tag as a column. The extension seam for tenant columns. On page: /apps.',
  },

  // ── Rails & captions ─────────────────────────────────────────────────────
  {
    id: 'table-shell',
    name: 'TableShell',
    group: 'Rails & captions',
    since: '2026-09 (as TableTopRail + TableFacts; one frame later that month)',
    origin: 'src/app/_components/PageShell/tableShell.tsx',
    usedIn: ['Apps, Jobs, Systems, Files landings'],
    status: 'current',
    notes:
      'The one frame around a landing table: a single strip carrying the window facts, the transient hint (loading / filtered, silent at rest), the refusal line, and the presses (columns, ⓘ, density). Preferences pick its edge (footer by default, header row on top) and whether the table grows the page or pins to the window and scrolls its own rows. This demo obeys your own preferences.',
    demo: (
      <Box sx={{ maxWidth: 520 }}>
        <TableShell
          hint='filtered by nav search: "gpu"'
          about="The nav's search box filters this table too: one search drives both surfaces."
          error={new Error('SYSAPI_AUTH the demo refusal')}
          facts="Window: 46 newest jobs by created date. Counts above cover this window."
        >
          <Box
            sx={{
              py: 1.5,
              textAlign: 'center',
              fontSize: '0.7rem',
              color: 'text.disabled',
            }}
          >
            (the table)
          </Box>
        </TableShell>
      </Box>
    ),
  },
  {
    id: 'columns-picker',
    name: 'ColumnsButton + makeColumnsStore',
    group: 'Rails & captions',
    since: '2026-09 (apps first; kit + all four landings later)',
    origin: 'src/app/_components/PageShell/tableColumns.tsx',
    usedIn: ['Apps, Jobs, Systems, Files landing tables'],
    status: 'current',
    notes:
      'Per-table choosable columns: a localStorage store from makeColumnsStore, and the house popover (sectioned check rows, hints, reset-only-when-changed). The apps table adds a tag-derived section on top.',
  },
  {
    id: 'files-status-line',
    name: 'files status line',
    group: 'Rails & captions',
    since: '2026 files V2',
    origin:
      'packages/tapisui-common/src/components/files/FileListing/FileListingTableV2.tsx',
    usedIn: ['File listing (every browser: /files, job output, system files)'],
    status: 'current',
    notes:
      '"41 items · more on scroll" / "Could not read this directory" plus the owner-columns and density presses. The model the table rails were drawn from. On page: /files.',
  },

  // ── Status & chips ───────────────────────────────────────────────────────
  {
    id: 'system-type-chip',
    name: 'SystemTypeChip / SystemTypeTile',
    group: 'Status & chips',
    since: '2026-08 (nav V2 kit)',
    origin: 'src/app/_components/NavV2Kit/SystemTypeTile.tsx',
    usedIn: ['Systems nav rows', 'Systems landing table'],
    status: 'current',
    demo: (
      <Box sx={{ display: 'flex', gap: 0.75 }}>
        <SystemTypeChip type="LINUX" />
        <SystemTypeChip type="S3" />
        <SystemTypeChip type="GLOBUS" />
      </Box>
    ),
  },
  {
    id: 'error-detail',
    name: 'ErrorDetail',
    group: 'Status & chips',
    since: '2026-08',
    origin: 'src/app/_components/ErrorDetail/ErrorDetail.tsx',
    usedIn: [
      'Job holds and refusals',
      'System door box ("what the last try came back with")',
      'Resubmit dialog',
    ],
    status: 'current',
    notes:
      'A service message, framed instead of dumped: monospace, bounded, with a neutral tone variant for expected refusals.',
    demo: (
      <Box sx={{ maxWidth: 480 }}>
        <ErrorDetail
          message="JOBS_QUOTA_MAX_USER_QUEUE_JOBS The user has reached their quota of 1 on system vista-tapis"
          fontSize="0.7rem"
          tone="neutral"
        />
      </Box>
    ),
  },
  {
    id: 'cancelling-strip',
    name: 'the amber cancelling strip',
    group: 'Status & chips',
    since: '2026-09 (cancel lifecycle)',
    origin: 'src/app/Jobs/JobDetail/JobSummaryCard.tsx',
    usedIn: ['Job summary card', 'nav rows wear the matching amber dot'],
    status: 'current',
    notes:
      'Async-cancel honesty: sent / accepted / acknowledged, derived from one module store (CancelledJobsContext) so the card, nav and session box agree. On page: /jobs/<uuid> during a cancel.',
  },

  // ── Cards & boxes ────────────────────────────────────────────────────────
  {
    id: 'session-card',
    name: 'SessionCard + sessionApps registry',
    group: 'Cards & boxes',
    since: '2026-09 (FlexServ, then the registry)',
    origin: 'src/app/Jobs/_components/SessionCard.tsx',
    usedIn: ['Job detail, below Details (FlexServ and ParaView jobs)'],
    status: 'current',
    notes:
      'Jobs that produce a server get a watching box: address/token, open-in-tab, the floating frame (when the app tolerates iframes), and a gravestone after. New app = one registry entry. On page: /jobs/<uuid> of a session app.',
  },
  {
    id: 'door-box',
    name: 'the door box (no way in yet)',
    group: 'Cards & boxes',
    since: '2026-08, settle cycle 2026-09',
    origin: 'src/app/Systems/SystemDetail/SystemSummaryCard.tsx',
    usedIn: ['System detail, inside the access facts'],
    status: 'current',
    notes:
      'The amber credentials door: host-down vs no-credential stories, the TMS mint press, and the patient recheck cycle after a credential lands. On page: /systems/<id> without access.',
  },
  {
    id: 'access-panel',
    name: 'Sharing & access panel',
    group: 'Cards & boxes',
    since: '2026-09',
    origin: 'src/app/Systems/SystemDetail/SystemAccessPanel.tsx',
    usedIn: ['System summary card'],
    status: 'current',
    notes:
      'The cog’s Share / Manage permissions / owner flows as a panel that shows its state: share chips with inline add and remove, per-user permission chips that flip on press, ownership transfer behind its modal. Owner-gated; read-only and honest about it for everyone else. On page: /systems/<id>.',
  },
  {
    id: 'app-access-panel',
    name: 'AppAccessPanel',
    group: 'Cards & boxes',
    since: '2026-09',
    origin: 'src/app/Apps/AppDetails/_components/AppAccessPanel.tsx',
    usedIn: ['App detail overview'],
    status: 'current',
    notes:
      'The systems Sharing & access panel, adapted for apps: owner, availability (enable/disable), visibility (public/private) and the named-user share list with inline add and remove. Differs from the systems twin in two ways: the share list is a real getShareInfo read rather than a record field, and it says out loud that public and per-user sharing are independent doors. Owner-gated, honest read-only for everyone else. On page: /apps/<id>/<version>.',
  },
  {
    id: 'detail-head',
    name: 'DetailHead',
    group: 'Cards & boxes',
    since: '2026-09',
    origin: 'src/app/_components/PageShell/detailHead.tsx',
    usedIn: ['System summary card', 'App detail card', 'Job summary card'],
    status: 'current',
    notes:
      'The head all three detail pages wear: [status] title [what it is] ··· [acts] [JSON] [cog], then the description and a uuid · created · updated line (tags moved into the Tags and Notes box). Built to give each fact ONE home. The uuid used to sit on the title line on systems, on line two on jobs and nowhere on apps, and the owner was a chip on two pages as well as a fact box on all three. Ships VisibilityChip / DisabledChip / LockedChip (the exceptional states shout, the resting ones stay quiet) and SettingsCog. On pages: /systems/<id>, /apps/<id>/<version>, /jobs/<uuid>.',
  },
  {
    id: 'record-json',
    name: 'RecordJson',
    group: 'Cards & boxes',
    since: '2026-09 (v2 of JSONDisplay)',
    origin: 'src/app/_components/PageShell/RecordJson.tsx',
    usedIn: ['System detail', 'App detail', 'Job detail'],
    status: 'current',
    notes:
      'The record as a readable light tree instead of a dark slab: collapsible branches that say what is inside them while shut, typed colours, an honest field count, copy, and the empty fields (most of a Tapis record) hidden until asked for. Opens as its own card BELOW the top card, so reading the JSON never costs you the page. Replaces JSONDisplay and its reactstrap "Include Empty Parameters" checkbox on the three detail pages; JSONDisplay is still in use on Pods, Workflows and the launcher review step.',
  },
  {
    id: 'job-access-panel',
    name: 'JobAccessPanel',
    group: 'Cards & boxes',
    since: '2026-09',
    origin: 'src/app/Jobs/JobDetail/JobAccessPanel.tsx',
    usedIn: ['Job summary card'],
    status: 'current',
    notes:
      'The third Sharing & access box, and the one that is genuinely a different act: a job is shared in PARTS (output, history, input, resubmit request) rather than whole, so it lists one line per person with what they hold and the add offers the parts. Names the owner and the submitter when they differ, which is why the job head line no longer carries an owner. Says out loud that revoke is all-or-nothing, because the service can grant one resource but only unshare a user entirely. On page: /jobs/<uuid>.',
  },
  {
    id: 'notes-box',
    name: 'NotesBox (Tags and Notes)',
    group: 'Cards & boxes',
    since: '2026-09 (v2 of the JSONDisplay slab)',
    origin: 'src/app/_components/PageShell/NotesBox.tsx',
    usedIn: ['System summary card', 'App detail card', 'Job summary card'],
    status: 'current',
    notes:
      'The record’s tags and its free-form notes, in the two field names the JSON uses: tags first as chips, notes below as fact rows: live URLs, chips for flat arrays, nested keys flattened one level. Each section wears its own paper slab inside the box, the way the job card frames Execution and Archive, because labels and prose are different material. Values hold to one line with the whole thing on hover until the ⇲ press lets them wrap; the exact JSON is one press away and copy is kept; the whole box folds at half a card under a fade when long. On pages: /systems/<id>, /apps/<id>/<version>, /jobs/<uuid>.',
  },
  {
    id: 'history-ledger',
    name: 'HistoryBox + HistoryDialog',
    group: 'Cards & boxes',
    since: '2026-09',
    origin: 'src/app/_components/PageShell/HistoryBox.tsx',
    usedIn: ['System summary card', 'App detail card'],
    status: 'current',
    notes:
      'Any Tapis service change ledger at two sizes: a half-column box previewing the newest five (load-on-press, one query serving both), and an expand into a dated timeline: operation chips coloured by family (lifecycle / definition / access / credentials), the actor and both tenants when they differ, the version an entry touched where the service records one, and the JSON each operation carried as field rows. Filter chips per operation. Presentational: each service keeps its own hook in a thin wrapper. The vocabulary is pure and tested in historyLedger.ts. On page: /systems/<id> and /apps/<id>/<version>.',
  },
  {
    id: 'page-about',
    name: 'PageAbout',
    group: 'Cards & boxes',
    since: '2026-08 (landing overhaul)',
    origin: 'src/app/_components/PageShell/PageAbout.tsx',
    usedIn: ['Apps, Jobs, Systems, Files landings'],
    status: 'current',
    notes:
      'The landing header: title, stat tiles with hints, a lead sentence, teaching points, an actions slot. On page: any landing.',
  },
  {
    id: 'service-docs',
    name: 'ServiceDocs + docsSource',
    group: 'Cards & boxes',
    since: '2026-09',
    origin: 'src/app/_components/Help/docsSource.ts',
    usedIn: [
      'Every service Help drawer (Jobs, Systems, Files, Apps, Authenticator)',
    ],
    status: 'current',
    notes:
      'One preference (ReadTheDocs vs live OpenAPI) decides which manual every docs button opens; the drawer carries the switch and the gradient loading rail.',
  },

  // ── Charts ───────────────────────────────────────────────────────────────
  {
    id: 'outcome-chart',
    name: 'outcome bars + activity list',
    group: 'Charts',
    since: '2026-09 (jobs dashboard), lab restyle 2026-09',
    origin: 'src/app/Jobs/_components/JobsDashboard.tsx',
    usedIn: ['Jobs landing'],
    status: 'current',
    notes:
      'Okabe–Ito palette, square data ends, hairline quartile grid, mono annotations, a peak label instead of a y-axis. The Flows tab beside this one uses the same grammar. On page: /jobs.',
  },
];

/** the status chip's look, shared by the tab */
export const STATUS_COLOR: Record<CatalogEntry['status'], string> = {
  current: '#1b7f3b',
  wip: '#8a6d00',
  legacy: '#c62828',
};

const EntryCard: React.FC<{ entry: CatalogEntry }> = ({ entry }) => (
  <Box sx={{ ...WELL, minWidth: 0 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700 }}>
        {entry.name}
      </Typography>
      <Tooltip
        title={
          entry.status === 'wip'
            ? 'Working, but its final home or adoption is still moving'
            : entry.status === 'legacy'
            ? 'Superseded: do not adopt in new work'
            : 'The current house piece for this job'
        }
      >
        <Chip
          size="small"
          label={entry.status}
          sx={{
            height: 16,
            fontSize: '0.6rem',
            borderRadius: '4px',
            color: '#fff',
            bgcolor: STATUS_COLOR[entry.status],
          }}
        />
      </Tooltip>
      <Box sx={{ flex: 1 }} />
      <Typography
        sx={{
          fontSize: '0.62rem',
          color: 'text.disabled',
          whiteSpace: 'nowrap',
        }}
      >
        since {entry.since}
      </Typography>
    </Box>
    <Typography
      sx={{
        fontFamily: 'monospace',
        fontSize: '0.66rem',
        color: 'text.secondary',
        mb: 0.5,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {entry.origin}
    </Typography>
    {entry.notes && (
      <Typography
        sx={{
          fontSize: '0.72rem',
          color: 'text.secondary',
          lineHeight: 1.55,
          mb: 0.75,
        }}
      >
        {entry.notes}
      </Typography>
    )}
    <Box
      sx={{
        display: 'flex',
        gap: 0.5,
        flexWrap: 'wrap',
        mb: entry.demo ? 0.75 : 0,
      }}
    >
      {entry.usedIn.map((where) => (
        <Chip
          key={where}
          size="small"
          label={where}
          sx={{
            height: 18,
            fontSize: '0.62rem',
            borderRadius: '4px',
            bgcolor: 'rgba(21,101,192,0.08)',
            color: '#1565c0',
          }}
        />
      ))}
    </Box>
    {entry.demo && (
      <Box
        sx={{
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 1,
          p: 1,
          bgcolor: '#fcfcfb',
        }}
      >
        {entry.demo}
      </Box>
    )}
  </Box>
);

export const CatalogTab: React.FC = () => (
  <Box sx={{ display: 'grid', gap: 1.5 }}>
    {CATALOG_GROUPS.map((group) => {
      const entries = CATALOG.filter((entry) => entry.group === group);
      if (!entries.length) return null;
      return (
        <Box key={group}>
          <SectionTitle>{group}</SectionTitle>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: 1,
            }}
          >
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </Box>
        </Box>
      );
    })}
  </Box>
);
