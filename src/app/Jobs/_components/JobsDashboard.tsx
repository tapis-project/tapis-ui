/**
 * JobsDashboard — the landing pane for /jobs, replacing "Select a job from
 * the list."
 *
 * One jobs-list read (shared with the nav via JOBS_LIST_PARAMS) answers three
 * questions: how many jobs are in each state (stat tiles), what activity looks
 * like (14-day outcome bars) and what actually gets run here (per-app
 * activity) — then the table below answers 'where is the one I am thinking
 * of'. All arithmetic lives in jobsData.ts.
 *
 * Chart discipline (dataviz method): outcomes wear the Okabe–Ito palette —
 * the colorblind-safe set research figures standardize on — with the legend
 * counts and text rows as relief for any pair that sits close. Square data
 * ends, 2px surface gaps, hairline quartile grid, one axis in mono, a peak
 * annotation instead of a y-axis, tooltips on every mark.
 */
import React, { useMemo, useSyncExternalStore } from 'react';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { useJobsSource } from './jobsSource';
import { QueryWrapper } from '@tapis/tapisui-common';
import JobGlyph from './JobGlyph';
import { normTs, timeAgo } from 'app/_components/NavV2Kit/navKit';
import {
  SortLabel,
  sortRows,
  useTableSort,
} from 'app/_components/PageShell/tableSort';
import PageAbout from 'app/_components/PageShell/PageAbout';
import { TableShell, windowFacts } from 'app/_components/PageShell/tableShell';
import {
  ColumnsButton,
  makeColumnsStore,
} from 'app/_components/PageShell/tableColumns';
import {
  Cell,
  CellLink,
  EmptyRow,
  GLYPH_COLUMN,
  GlyphCell,
  HCell,
  SectionTitle,
  NO_VALUE,
  SkeletonRows,
  WELL,
  WellSkeleton,
} from 'app/_components/PageShell/overviewKit';
import { getJobsSearch, subscribeJobsSearch } from './jobsSearch';
import {
  JobLite,
  byDayOutcome,
  countsByClass,
  fmtDuration,
  perAppActivity,
  runtimeMs,
} from './jobsData';

// Okabe–Ito, the research-figure standard — see header comment. Order =
// stack order: the good news sits on the baseline, failures ride on top.
const OUTCOME = [
  { key: 'finished', label: 'finished', color: '#009e73' },
  { key: 'active', label: 'active', color: '#0072b2' },
  { key: 'cancelled', label: 'cancelled', color: '#e69f00' },
  { key: 'failed', label: 'failed', color: '#d55e00' },
] as const;

/** the charts' shared furniture — hairlines and mono annotations */
const GRID_LINE = 'rgba(0,0,0,0.07)';
const BASELINE = 'rgba(0,0,0,0.18)';
const ANNOTATION_SX = {
  fontFamily: 'monospace',
  fontSize: '0.58rem',
  color: 'text.disabled',
  letterSpacing: 0,
} as const;

// ── 14-day outcome chart ────────────────────────────────────────────────────

/** every column the jobs table can grow — the window carries the data */
const JOB_COLUMNS: Array<{
  id: string;
  label: string;
  hint?: string;
  mono?: boolean;
  cell: (j: JobLite) => React.ReactNode;
  /** what this column contributes to an ordering; a link does not compare */
  sortValue?: (j: JobLite) => string | number;
}> = [
  {
    id: 'app',
    label: 'App',
    cell: (j) =>
      j.appId && j.appVersion ? (
        <CellLink kind="app" to={`/apps/${j.appId}/${j.appVersion}`}>
          {j.appId}
        </CellLink>
      ) : (
        j.appId ?? ''
      ),
    sortValue: (j) => j.appId ?? '',
  },
  {
    id: 'system',
    label: 'System',
    mono: true,
    cell: (j) =>
      j.execSystemId ? (
        <CellLink kind="system" to={`/systems/${j.execSystemId}`}>
          {j.execSystemId}
        </CellLink>
      ) : (
        ''
      ),
    sortValue: (j) => j.execSystemId ?? '',
  },
  { id: 'owner', label: 'Owner', cell: (j) => j.owner ?? '' },
  {
    id: 'runtime',
    label: 'Runtime',
    hint: 'wall time on the host, dashed until the run started',
    cell: (j) => (j.remoteStarted ? fmtDuration(runtimeMs(j)) : NO_VALUE),
    // the number, not "3h 12m" as text: longest runs sort as longest
    sortValue: (j) => (j.remoteStarted ? runtimeMs(j) : ''),
  },
  {
    id: 'created',
    label: 'Created',
    cell: (j) => timeAgo(j.created),
    // newest first on the first press; "2 days ago" does not sort
    sortValue: (j) => (j.created ? -normTs(j.created) : ''),
  },
  {
    id: 'status',
    label: 'Status',
    hint: 'the word, since the row glyph already says it at a glance',
    cell: (j) => j.status ?? '',
  },
  {
    id: 'appVersion',
    label: 'App version',
    mono: true,
    cell: (j) => j.appVersion ?? '',
  },
  {
    id: 'ended',
    label: 'Ended',
    cell: (j) => (j.ended ? timeAgo(j.ended) : ''),
    sortValue: (j) => (j.ended ? -normTs(j.ended) : ''),
  },
  { id: 'uuid', label: 'UUID', mono: true, cell: (j) => j.uuid ?? '' },
];

/** a column's own key, falling back to its text when the text IS the value */
const jobSortKey = (j: JobLite, columnId: string) => {
  const spec = JOB_COLUMNS.find((c) => c.id === columnId);
  if (columnId === 'name') return j.name ?? j.uuid ?? '';
  if (!spec) return undefined;
  return spec.sortValue ? spec.sortValue(j) : String(spec.cell(j) ?? '');
};
const jobsColumnsStore = makeColumnsStore('jobs.columns', [
  'app',
  'system',
  'owner',
  'runtime',
  'created',
]);

const OutcomeChart: React.FC<{ jobs: JobLite[] }> = ({ jobs }) => {
  const days = useMemo(() => byDayOutcome(jobs, 14), [jobs]);
  const max = Math.max(
    1,
    ...days.map((d) => d.finished + d.failed + d.cancelled + d.active)
  );
  const totals = {
    finished: days.reduce((n, d) => n + d.finished, 0),
    active: days.reduce((n, d) => n + d.active, 0),
    cancelled: days.reduce((n, d) => n + d.cancelled, 0),
    failed: days.reduce((n, d) => n + d.failed, 0),
  };
  const H = 96;
  return (
    <Box sx={WELL}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <SectionTitle>Last 14 days · outcomes by submission day</SectionTitle>
        {/* the peak stands in for a y-axis — one number instead of a rail */}
        <Typography sx={ANNOTATION_SX}>peak {max}/day</Typography>
      </Box>
      <Box
        sx={{
          position: 'relative',
          height: H,
          // the figure's frame: a real baseline, quartile hairlines behind
          borderBottom: `1px solid ${BASELINE}`,
        }}
      >
        {[25, 50, 75].map((pct) => (
          <Box
            key={pct}
            aria-hidden
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: `${pct}%`,
              borderTop: `1px solid ${GRID_LINE}`,
            }}
          />
        ))}
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '3px',
            height: '100%',
          }}
        >
          {days.map((d) => {
            const total = d.finished + d.failed + d.cancelled + d.active;
            const segs = OUTCOME.map((o) => ({
              ...o,
              value: d[o.key as keyof typeof d] as number,
            })).filter((s) => s.value > 0);
            return (
              <Tooltip
                key={d.day}
                arrow
                disableInteractive
                title={
                  total === 0
                    ? `${d.day}: no jobs`
                    : `${d.day}: ${total} job${total === 1 ? '' : 's'}, ` +
                      segs.map((s) => `${s.value} ${s.label}`).join(', ')
                }
              >
                <Box
                  sx={{
                    flex: 1,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    // hover target is the whole column, not the thin bar
                    cursor: 'default',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' },
                  }}
                >
                  {total === 0 ? (
                    // an empty day is a tick on the baseline, not a bar
                    <Box sx={{ height: 2, bgcolor: GRID_LINE }} />
                  ) : (
                    segs.map((s, i) => (
                      <Box
                        key={s.key}
                        sx={{
                          height: `${(s.value / max) * 100}%`,
                          minHeight: 3,
                          bgcolor: s.color,
                          // 2px surface gap between stacked segments; square
                          // data ends — figures state, they don't smile
                          mt: i === segs.length - 1 ? 0 : '2px',
                          borderRadius:
                            i === segs.length - 1 ? '1px 1px 0 0' : 0,
                        }}
                      />
                    ))
                  )}
                </Box>
              </Tooltip>
            );
          })}
        </Box>
      </Box>
      {/* sparse axis in mono: first, middle, last day */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.25 }}>
        {[
          days[0],
          days[Math.floor(days.length / 2)],
          days[days.length - 1],
        ].map((d) => (
          <Typography key={d.day} sx={ANNOTATION_SX}>
            {d.day.slice(5)}
          </Typography>
        ))}
      </Box>
      {/* legend with counts — also the relief for any close color pair */}
      <Box sx={{ display: 'flex', gap: 1.25, mt: 0.75, flexWrap: 'wrap' }}>
        {OUTCOME.map((o) => (
          <Box
            key={o.key}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                bgcolor: o.color,
                borderRadius: '1px',
              }}
            />
            <Typography sx={{ fontSize: '0.66rem', color: 'text.secondary' }}>
              {o.label}{' '}
              <Box
                component="span"
                sx={{ ...ANNOTATION_SX, fontSize: 'inherit' }}
              >
                {totals[o.key as keyof typeof totals]}
              </Box>
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// ── per-app activity ────────────────────────────────────────────────────────

const AppActivityList: React.FC<{ jobs: JobLite[] }> = ({ jobs }) => {
  const acts = useMemo(() => perAppActivity(jobs).slice(0, 8), [jobs]);
  const max = Math.max(1, ...acts.map((a) => a.total));
  return (
    <Box sx={WELL}>
      <SectionTitle>What gets run · by app, most recent first</SectionTitle>
      {acts.length === 0 && (
        <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
          Nothing yet. The first launch starts the history.
        </Typography>
      )}
      {acts.map((a) => (
        <Box
          key={a.appId}
          sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.35 }}
        >
          <Typography
            noWrap
            sx={{ fontFamily: 'monospace', fontSize: '0.72rem', width: 170 }}
          >
            {a.appId}
          </Typography>
          {/* a hairline track behind the bar, so every row's proportion
              reads against the same full width — figure grammar, not gauge */}
          <Box
            sx={{
              flex: 1,
              position: 'relative',
              height: 6,
              bgcolor: 'rgba(0,0,0,0.045)',
              borderRadius: '1px',
            }}
          >
            <Tooltip
              arrow
              disableInteractive
              title={`${a.total} run${a.total === 1 ? '' : 's'} in the window${
                a.failed ? `, ${a.failed} failed` : ''
              }${a.running ? `, ${a.running} running now` : ''}`}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  gap: '2px',
                  width: `${(a.total / max) * 100}%`,
                  minWidth: 8,
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    flex: Math.max(a.total - a.failed, 0),
                    bgcolor: '#0072b2',
                    borderRadius: '1px',
                  }}
                />
                {a.failed > 0 && (
                  <Box
                    sx={{
                      height: '100%',
                      flex: a.failed,
                      bgcolor: '#d55e00',
                      borderRadius: '1px',
                    }}
                  />
                )}
              </Box>
            </Tooltip>
          </Box>
          <Typography sx={{ ...ANNOTATION_SX, width: 30, textAlign: 'right' }}>
            {a.total}
          </Typography>
          <Typography sx={{ ...ANNOTATION_SX, width: 74, textAlign: 'right' }}>
            {timeAgo(a.last)}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// ── job rows (failures, longest running) ────────────────────────────────────

// ── the dashboard ───────────────────────────────────────────────────────────

const JobsDashboard: React.FC = () => {
  // The dashboard is the one consumer that keeps the list warm while
  // something is actually running; everyone else shares the result.
  const source = useJobsSource({ poll: true });
  const { isLoading, error } = source;
  const history = useHistory();
  const jobs = source.jobs as JobLite[];
  const counts = useMemo(() => countsByClass(jobs), [jobs]);

  // the nav's search box, so the page has one search rather than two
  const q = useSyncExternalStore(subscribeJobsSearch, getJobsSearch);
  // which columns this browser shows, in registry order
  const chosenColumns = jobsColumnsStore.use();
  // press a header to order by it: asc, desc, then back to newest-first
  const { sort, cycleSort } = useTableSort();
  const columns = useMemo(
    () => JOB_COLUMNS.filter((c) => chosenColumns.includes(c.id)),
    [chosenColumns]
  );
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    // the same fields the nav searches, so a query that finds a row there
    // finds the same row here
    const matched = jobs.filter(
      (j) =>
        !needle ||
        [j.name, j.appId, j.uuid, j.owner, j.execSystemId, j.status]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(needle)
    );
    // the window arrives newest-first; that is where a third press returns
    return sortRows(matched, sort, jobSortKey, (j) => j.uuid ?? '');
  }, [jobs, q, sort]);

  return (
    // the page renders as itself on first load — real About, real panels'
    // wells, real table header, skeleton rows — instead of a spinner
    <QueryWrapper isLoading={false} error={error}>
      {/* no top or side padding: the shell's right-pane margin is
          the page's inset, the same as every Pods page */}
      <Box sx={{ pb: 2 }}>
        {/* failures stay out of the tile row on purpose — they have
                their own panel below */}
        <PageAbout
          loading={isLoading}
          title="Jobs"
          stats={[
            // the total leads, as it does on Apps and Files — the states
            // beside it are a breakdown of this number, not a set of
            // unrelated counts
            {
              n: jobs.length,
              label: 'jobs',
              hint: `The ${jobs.length} most recent jobs by creation time. Everything on this page is counted from those`,
            },
            { n: counts.running, label: 'running', color: '#1b7f3b' },
            {
              n: counts.queued,
              label: 'queued / staging',
              color: '#1565c0',
            },
            {
              n: counts.blocked,
              label: 'blocked / paused',
              color: '#8a6d00',
            },
            { n: counts.finished, label: 'finished' },
          ]}
          lead="A job is one run of an app on an execution system: Tapis stages the inputs, monitors the runtime, and archives outputs."
          points={[
            'Select a job from the list to inspect it.',
            <>
              New jobs start from the Apps page with <strong>Launch</strong>.
            </>,
          ]}
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1,
            mb: 1.5,
          }}
        >
          {isLoading ? (
            <>
              <WellSkeleton />
              <WellSkeleton />
            </>
          ) : (
            <>
              <OutcomeChart jobs={jobs} />
              <AppActivityList jobs={jobs} />
            </>
          )}
        </Box>

        {/* Every job in the window, as a table — the panels above answer
                questions, this answers 'where is the one I am thinking of'.
                It shares the nav's search box rather than growing a second
                one, the same bargain the files landing makes. */}
        <TableShell
          title="Jobs"
          hint={
            isLoading
              ? 'fetching the first window of runs, newest first'
              : q
              ? `filtered by nav search: "${q}"`
              : undefined
          }
          about="The nav's search box filters this table too: one search drives both surfaces. The counts above the table are computed from the loaded window: the most recent jobs by creation time, not every job you have run."
          controls={
            <ColumnsButton
              sections={[
                {
                  label: 'Columns',
                  options: JOB_COLUMNS.map((c) => ({
                    id: c.id,
                    label: c.label,
                    hint: c.hint,
                  })),
                },
              ]}
              chosen={chosenColumns}
              onToggle={jobsColumnsStore.toggle}
              onReset={jobsColumnsStore.reset}
              isDefault={jobsColumnsStore.isDefault(chosenColumns)}
            />
          }
          error={(error as Error) ?? null}
          facts={windowFacts(jobs.length, 'newest jobs', source.spine)}
        >
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
                <HCell width={GLYPH_COLUMN}> </HCell>
                {/* Job keeps its width; the chosen columns split the rest */}
                <HCell width="33%">
                  <SortLabel
                    id="name"
                    label="Job"
                    sort={sort}
                    onSort={cycleSort}
                  />
                </HCell>
                {columns.map((c) => (
                  <HCell key={c.id}>
                    <SortLabel
                      id={c.id}
                      label={c.label}
                      sort={sort}
                      onSort={cycleSort}
                    />
                  </HCell>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {isLoading && <SkeletonRows cols={2 + columns.length} />}
              {rows.map((j) => (
                <Box
                  component="tr"
                  key={j.uuid}
                  onClick={() => history.push(`/jobs/${j.uuid}`)}
                  sx={{
                    cursor: 'pointer',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                  }}
                >
                  {/* status is the icon, as it is in the nav — the word
                          would cost a column and say the same thing */}
                  <GlyphCell>
                    <JobGlyph job={j} />
                  </GlyphCell>
                  <Cell mono>{j.name ?? j.uuid}</Cell>
                  {columns.map((c) => (
                    <Cell key={c.id} mono={c.mono} muted>
                      {c.cell(j)}
                    </Cell>
                  ))}
                </Box>
              ))}
              {rows.length === 0 && !isLoading && (
                <EmptyRow
                  colSpan={2 + columns.length}
                  query={q || undefined}
                  title="No jobs yet."
                  detail="Every run of an app becomes a job. Launch one from the Apps page and it shows up here."
                />
              )}
            </Box>
          </Box>
        </TableShell>
      </Box>
    </QueryWrapper>
  );
};

export default JobsDashboard;
